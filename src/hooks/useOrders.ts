import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  payment_method: string;
  observations?: string;
  created_at: string;
  updated_at: string;
  restaurant?: {
    name: string;
    logo_url?: string;
  };
  customer?: {
    name?: string;
    phone?: string;
  } | null;
  order_items?: OrderItem[];
  review?: {
    id: string;
    rating: number;
    comment?: string;
    created_at: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  observations?: string;
  product?: {
    name: string;
    image_url?: string;
  };
  addons?: Array<{
    id: string;
    product_addon_id: string;
    quantity: number;
    unit_price: number;
    addon?: {
      name: string;
      price: number;
    };
  }>;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();


  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(name, logo_url),
          order_items(
            *,
            product:products(name, image_url),
            order_item_addons(
              *,
              product_addon:product_addons(name, price)
            )
          ),
          review:order_reviews(id, rating, comment, created_at)
        `)
        .order('created_at', { ascending: false });

      // Filter based on user type
      if (profile?.user_type === 'customer') {
        query = query.eq('customer_id', user.id);
      } else if (profile?.user_type === 'vendor') {
        // For vendors, get orders for their restaurant
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        
        if (restaurant) {
          query = query.eq('restaurant_id', restaurant.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch customer data separately for each order
      const ordersWithCustomers = await Promise.all(
        (data || []).map(async (order) => {
        const { data: customer, error } = await supabase
          .from('profiles')
          .select('name, phone')
          .eq('id', order.customer_id)
          .single();

          // Process order items with proper addon mapping
          const processedOrderItems = order.order_items?.map((item: any) => ({
            ...item,
            addons: item.order_item_addons?.map((addon: any) => ({
              ...addon,
              addon: addon.product_addon
            })) || []
          })) || [];
          
          return {
            ...order,
            customer: customer || null,
            order_items: processedOrderItems,
            review: order.review && order.review.length > 0 ? order.review[0] : undefined
          };
        })
      );

      setOrders(ordersWithCustomers as Order[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: {
    restaurant_id: string;
    total_amount: number;
    delivery_fee: number;
    delivery_address: string;
    payment_method: string;
    observations?: string;
      items: Array<{
        product_id: string;
        quantity: number;
        unit_price: number;
        observations?: string;
        addons?: Array<{
          product_addon_id: string;
          quantity: number;
          unit_price: number;
        }>;
      }>;
  }) => {
    if (!user) throw new Error('Usuário não autenticado');

    if (profile.user_type !== 'customer') {
       toast({
        title: "Pedido Negado!",
        description: "Apenas clientes podem realizar pedidos.",
        variant: "destructive"
      });
    return;
    }
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: orderData.restaurant_id,
          total_amount: orderData.total_amount,
          delivery_fee: orderData.delivery_fee,
          delivery_address: orderData.delivery_address,
          payment_method: orderData.payment_method,
          observations: orderData.observations,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        observations: item.observations,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create order item addons
      const orderItemAddons = [];
      for (const item of orderData.items) {
        if (item.addons && item.addons.length > 0) {
          const orderItem = orderItems.find(oi => oi.product_id === item.product_id);
          if (orderItem) {
            for (const addon of item.addons) {
              orderItemAddons.push({
                order_item_id: order.id, // We'll need to get the actual order_item_id
                product_addon_id: addon.product_addon_id,
                quantity: addon.quantity,
                unit_price: addon.unit_price,
              });
            }
          }
        }
      }

      // We need to get the actual order item IDs first
      const { data: createdOrderItems } = await supabase
        .from('order_items')
        .select('id, product_id')
        .eq('order_id', order.id);

      if (createdOrderItems && orderItemAddons.length > 0) {
        // Map addons to correct order_item_ids
        const addonsToInsert = [];
        for (const item of orderData.items) {
          if (item.addons && item.addons.length > 0) {
            const orderItem = createdOrderItems.find(oi => oi.product_id === item.product_id);
            if (orderItem) {
              for (const addon of item.addons) {
                addonsToInsert.push({
                  order_item_id: orderItem.id,
                  product_addon_id: addon.product_addon_id,
                  quantity: addon.quantity,
                  unit_price: addon.unit_price,
                });
              }
            }
          }
        }

        if (addonsToInsert.length > 0) {
          const { error: addonsError } = await supabase
            .from('order_item_addons')
            .insert(addonsToInsert);

          if (addonsError) throw addonsError;
        }
      }

      await fetchOrders();
      return { order, error: null };
    } catch (error) {
      return { order: null, error };
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const createReview = async (orderId: string, rating: number, comment?: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error('Pedido não encontrado');
      
      if (order.status !== 'delivered') {
        throw new Error('Só é possível avaliar pedidos entregues');
      }

      const { error } = await supabase
        .from('order_reviews')
        .insert({
          order_id: orderId,
          customer_id: user.id,
          restaurant_id: order.restaurant_id,
          rating,
          comment,
        });

      if (error) throw error;

      await fetchOrders();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateReview = async (orderId: string, rating: number, comment?: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.review) throw new Error('Avaliação não encontrada');

      const { error } = await supabase
        .from('order_reviews')
        .update({ rating, comment })
        .eq('order_id', orderId)
        .eq('customer_id', user.id);

      if (error) throw error;

      await fetchOrders();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // useEffect(() => {
  //   fetchOrders();
  // }, [user, profile]);

  useEffect(() => {
    // Carrega os pedidos inicialmente
    fetchOrders()

    // Cria o canal realtime
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Evento realtime detectado:', payload)
          fetchOrders() // atualiza o front-end
        }
      )
      .subscribe()

    // Cleanup: remove o canal ao desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile])
  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
    createReview,
    updateReview
  };
};

// import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useAuth } from '@/contexts/AuthContext';


// export interface Order {
//   id: string;
//   customer_id: string;
//   restaurant_id: string;
//   status:
//     | 'pending'
//     | 'confirmed'
//     | 'preparing'
//     | 'ready'
//     | 'delivering'
//     | 'delivered'
//     | 'cancelled';
//   total_amount: number;
//   delivery_fee: number;
//   delivery_address: string;
//   payment_method: string;
//   observations?: string;
//   created_at: string;
//   updated_at: string;
//   restaurant?: {
//     name: string;
//     logo_url?: string;
//   };
//   customer?: {
//     name?: string;
//     phone?: string;
//   } | null;
//   order_items?: OrderItem[];
//   review?: {
//     id: string;
//     rating: number;
//     comment?: string;
//     created_at: string;
//   };
// }

// export interface OrderItem {
//   id: string;
//   order_id: string;
//   product_id: string;
//   quantity: number;
//   unit_price: number;
//   observations?: string;
//   product?: {
//     name: string;
//     image_url?: string;
//   };
//   addons?: Array<{
//     id: string;
//     product_addon_id: string;
//     quantity: number;
//     unit_price: number;
//     addon?: {
//       name: string;
//       price: number;
//     };
//   }>;
// }

// export const useOrders = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, profile } = useAuth();

//   const fetchOrders = async () => {
//     if (!user) return;

//     try {
//       setIsLoading(true);
//       setError(null);

//       let query = supabase
//         .from('orders')
//   .select(`
//     *,
//     restaurant:restaurants(name, logo_url),
//     order_items(
//       *,
//       product:products(name, image_url),
//       order_item_addons(
//         *,
//         product_addon:product_addons(name, price)
//       )
//     ),
//     review:order_reviews(id, rating, comment, created_at)
//   `);

//       if (profile?.user_type === 'customer') {
//         query = query.eq('customer_id', user.id);
//       } else if (profile?.user_type === 'vendor') {
//         const { data: restaurant } = await supabase
//           .from('restaurants')
//           .select('id')
//           .eq('owner_id', user.id)
//           .single();
//         if (restaurant) query = query.eq('restaurant_id', restaurant.id);
//       }

//       const { data, error: fetchError } = await query;
//       if (fetchError) throw fetchError;

//       const ordersWithCustomers: Order[] = await Promise.all(
//         (data || []).map(async (order: any) => {
//           const { data: customer, error: customerError } = await supabase
//             .from('profiles')
//             .select('name, phone')
//             .eq('id', order.customer_id)
//             .single();

//           if (customerError) {
//             console.warn('Erro ao buscar customer:', customerError.message);
//           }

//           const processedOrderItems = (order.order_items || []).map((item: any) => ({
//             ...item,
//             addons: (item.order_item_addons || []).map((addon: any) => ({
//               ...addon,
//               addon: addon.product_addon || null
//             }))
//           }));

//           return {
//             ...order,
//             customer: customer || null,
//             order_items: processedOrderItems,
//             review: (order.review?.[0] as Order['review']) || undefined
//           };
//         })
//       );

//       setOrders(ordersWithCustomers);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || 'Erro ao buscar pedidos');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Realtime
//   useEffect(() => {
//     if (!user) return;

//     fetchOrders();

//     const channel = supabase
//       .channel('orders-realtime')
//       .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
//         fetchOrders();
//       })
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [user, profile]);

//   const updateOrderStatus = async (
//     orderId: string,
//     status: Order['status']
//   ): Promise<{ error: any | null }> => {
//     try {
//       const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
//       if (error) throw error;
//       await fetchOrders();
//       return { error: null };
//     } catch (err) {
//       return { error: err };
//     }
//   };

//   const createOrder = async (orderData: any): Promise<Order | null> => {
//     try {
//       if (!user) throw new Error('Usuário não autenticado');
//       const { data: order, error } = await supabase
//         .from('orders')
//         .insert({ customer_id: user.id, ...orderData })
//         .select()
//         .single();
//       if (error) throw error;
//       await fetchOrders();
//       return order;
//     } catch (err) {
//       console.error(err);
//       return null;
//     }
//   };

//   const createReview = async (orderId: string, rating: number, comment?: string) => {
//     try {
//       if (!user) throw new Error('Usuário não autenticado');
//       const order = orders.find(o => o.id === orderId);
//       if (!order || order.status !== 'delivered') throw new Error('Só é possível avaliar pedidos entregues');

//       const { error } = await supabase.from('order_reviews').insert({
//         order_id: orderId,
//         customer_id: user.id,
//         restaurant_id: order.restaurant_id,
//         rating,
//         comment
//       });
//       if (error) throw error;
//       await fetchOrders();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const updateReview = async (orderId: string, rating: number, comment?: string) => {
//     try {
//       if (!user) throw new Error('Usuário não autenticado');
//       const order = orders.find(o => o.id === orderId);
//       if (!order?.review) throw new Error('Avaliação não encontrada');

//       const { error } = await supabase
//         .from('order_reviews')
//         .update({ rating, comment })
//         .eq('order_id', orderId)
//         .eq('customer_id', user.id);
//       if (error) throw error;
//       await fetchOrders();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return {
//     orders,
//     isLoading,
//     error,
//     refetch: fetchOrders,
//     createOrder,
//     updateOrderStatus,
//     createReview,
//     updateReview
//   };
// };
