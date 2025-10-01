import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MenuItem, Order } from "./database";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "recharts";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
export const EditOrderDialog = ({
  open,
  onOpenChange,
  order,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onUpdate: (order: Order) => void;
}) => {
  const [customer, setCustomer] = useState(order?.customer ?? "");
  const [waiter, setWaiter] = useState(order?.waiter ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [selectedItems, setSelectedItems] = useState(order?.items ?? []);
  const [products, setProducts] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    if (order) {
      setCustomer(order.customer);
      setWaiter(order.waiter);
      setNotes(order.notes ?? "");
      setSelectedItems(order.items);
    }
  }, [order]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!profile?.id) return;

      try {
        const { data: restaurant, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("owner_id", profile.id)
          .maybeSingle();

        if (restaurantError) throw restaurantError;
        if (!restaurant) {
          setProducts([]);
          return;
        }

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .eq("available", true)
          .order("display_order", { ascending: true });

        if (productsError) throw productsError;

        const mappedProducts: MenuItem[] = (productsData || []).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: p.price,
          image_url: p.image_url || "",
          category: p.category_id || "Sem categoria",
          quantity: 0,
        }));

        setProducts(mappedProducts);
      } catch (err: any) {
        console.error("Erro ao buscar produtos:", err.message);
        setProducts([]);
      }
    };

    loadProducts();
  }, [profile?.id]);

  const addItem = (item: MenuItem) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItems(selectedItems.filter(i => i.id !== itemId));
    } else {
      setSelectedItems(selectedItems.map(i =>
        i.id === itemId ? { ...i, quantity: qty } : i
      ));
    }
  };

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSave = () => {
    if (!customer.trim() || selectedItems.length === 0) return;

    onUpdate({
      ...order,
      customer,
      waiter,
      notes,
      items: selectedItems,
      total,
    });
    onOpenChange(false);
  };

  const getQuantity = (productId: string) => {
    const item = selectedItems.find(i => i.id === productId);
    return item?.quantity ?? 0;
  };

  return (
    // <Dialog open={open} onOpenChange={onOpenChange}>
    //   <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    //     <DialogHeader>
    //       <DialogTitle>Editar Pedido {order.id}</DialogTitle>
    //     </DialogHeader>

    //     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //       {/* Dados do pedido */}
    //       <div className="space-y-4">
    //         <div>
    //           <Label>Cliente</Label>
    //           <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
    //         </div>
    //         <div>
    //           <Label>Garçom</Label>
    //           <Input value={waiter} onChange={(e) => setWaiter(e.target.value)} />
    //         </div>
    //         <div>
    //           <Label>Observações</Label>
    //           <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
    //         </div>

    //         {selectedItems.length > 0 && (
    //           <Card>
    //             <CardHeader>
    //               <CardTitle className="text-base">Itens do Pedido</CardTitle>
    //             </CardHeader>
    //             <CardContent className="space-y-2">
    //               {selectedItems.map((item) => (
    //                 <div key={item.id} className="flex justify-between items-center p-2 bg-accent/50 rounded">
    //                   <div>
    //                     {item.name} — R$ {item.price.toFixed(2)}
    //                   </div>
    //                   <div className="flex items-center gap-2">
    //                     <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
    //                     <span>{item.quantity}</span>
    //                     <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
    //                   </div>
    //                 </div>
    //               ))}
    //               <div className="flex justify-between font-bold pt-2 border-t">
    //                 <span>Total:</span>
    //                 <span>R$ {total.toFixed(2)}</span>
    //               </div>
    //             </CardContent>
    //           </Card>
    //         )}
    //       </div>

    //       {/* Cardápio com imagens e botão + */}
    //       <div className="space-y-4">
    //         <h3 className="font-semibold">Adicionar itens</h3>
    //         <div className="space-y-2 max-h-96 overflow-y-auto">
    //           {products.map((product) => {
    //             const quantity = getQuantity(product.id);

    //             return (
    //               <Card
    //                 key={product.id}
    //                 className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer"
    //               >
    //                 {/* Imagem */}
    //                 <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
    //                   {product.image_url ? (
    //                     <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
    //                   ) : (
    //                     <span className="text-gray-400 text-xs">Sem imagem</span>
    //                   )}
    //                 </div>

    //                 {/* Nome e preço */}
    //                 <div className="flex-1 flex flex-col justify-center ml-3">
    //                   <span className="font-medium">{product.name}</span>
    //                   <span className="text-success font-bold text-sm">
    //                     R$ {product.price.toFixed(2)}
    //                   </span>
    //                 </div>

    //                 {/* Botão + e quantidade */}
    //                 <div className="flex items-center gap-2">
    //                   {quantity > 0 && <span>{quantity}</span>}
    //                   <Button size="sm" onClick={() => addItem(product)}>+</Button>
    //                 </div>
    //               </Card>
    //             );
    //           })}
    //         </div>
    //       </div>
    //     </div>

    //     <div className="flex justify-end gap-2 pt-4 border-t">
    //       <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
    //       <Button onClick={handleSave} disabled={selectedItems.length === 0 || !customer.trim()}>
    //         Salvar Alterações
    //       </Button>
    //     </div>
    //   </DialogContent>
    // </Dialog>


<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden rounded-lg">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold">
        Editar Pedido #{order.id}
      </DialogTitle>
    </DialogHeader>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[65vh]">
      {/* Dados do pedido */}
      <div className="space-y-3 overflow-y-auto">
        <Card className="p-3 space-y-3">
          <div>
            <Label>Cliente</Label>
            <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>
          <div>
            <Label>Garçom</Label>
            <Input value={waiter} onChange={(e) => setWaiter(e.target.value)} />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {selectedItems.length > 0 && (
            <Card className="bg-gray-50 p-2 space-y-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm font-semibold">Itens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-0">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm"
                  >
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="w-5 text-center">{item.quantity}</span>
                      <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-blue-600">R$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </Card>
      </div>

      {/* Cardápio */}
      <div className="space-y-2 overflow-y-auto">
        <h3 className="text-base font-semibold sticky top-0 bg-card z-10 p-2 border-b border-gray-200">
          Adicionar Itens
        </h3>
        <div className="space-y-2">
          {products.map((product) => {
            const quantity = getQuantity(product.id);
            return (
              <Card
                key={product.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 transition cursor-pointer"
              >
                <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-400 text-xs">Sem</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center ml-2">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-blue-600 font-bold text-xs">R$ {product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  {quantity > 0 && <span className="text-sm">{quantity}</span>}
                  <Button size="icon" variant="outline" onClick={() => addItem(product)}>+</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>

    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
      <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
      <Button onClick={handleSave} disabled={selectedItems.length === 0 || !customer.trim()}>
        Salvar
      </Button>
    </div>
  </DialogContent>
</Dialog>

  );
};



// export const EditOrderDialog = ({
//   open,
//   onOpenChange,
//   order,
//   onUpdate,
// }: {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   order: Order;
//   onUpdate: (order: Order) => void;
// }) => {
//   const [customer, setCustomer] = useState(order?.customer ?? "");
//   const [waiter, setWaiter] = useState(order?.waiter ?? "");
//   const [notes, setNotes] = useState(order?.notes ?? "");
//   const [selectedItems, setSelectedItems] = useState(order?.items ?? []);
//   const [products, setProducts] = useState<MenuItem[]>([]);
//   const { profile } = useAuth();

//   // Atualiza estado se o pedido mudar
//   useEffect(() => {
//     if (order) {
//       setCustomer(order.customer);
//       setWaiter(order.waiter);
//       setNotes(order.notes ?? "");
//       setSelectedItems(order.items);
//     }
//   }, [order]);

//   // Buscar produtos do restaurante
//   useEffect(() => {
//     const loadProducts = async () => {
//       if (!profile?.id) return;

//       try {
//         const { data: restaurant, error: restaurantError } = await supabase
//           .from("restaurants")
//           .select("*")
//           .eq("owner_id", profile.id)
//           .maybeSingle();

//         if (restaurantError) throw restaurantError;
//         if (!restaurant) {
//           setProducts([]);
//           return;
//         }

//         const { data: productsData, error: productsError } = await supabase
//           .from("products")
//           .select("*")
//           .eq("restaurant_id", restaurant.id)
//           .eq("available", true)
//           .order("display_order", { ascending: true });

//         if (productsError) throw productsError;

//         const mappedProducts: MenuItem[] = (productsData || []).map(p => ({
//           id: p.id,
//           name: p.name,
//           description: p.description || "",
//           price: p.price,
//           image_url: p.image_url || "",
//           category: p.category_id || "Sem categoria",
//           quantity: 0,
//         }));

//         setProducts(mappedProducts);
//       } catch (err: any) {
//         console.error("Erro ao buscar produtos:", err.message);
//         setProducts([]);
//       }
//     };

//     loadProducts();
//   }, [profile?.id]);

//   const addItem = (item: MenuItem) => {
//     const existing = selectedItems.find(i => i.id === item.id);
//     if (existing) {
//       setSelectedItems(selectedItems.map(i =>
//         i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
//       ));
//     } else {
//       setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
//     }
//   };

//   const updateQuantity = (itemId: string, qty: number) => {
//     if (qty <= 0) {
//       setSelectedItems(selectedItems.filter(i => i.id !== itemId));
//     } else {
//       setSelectedItems(selectedItems.map(i =>
//         i.id === itemId ? { ...i, quantity: qty } : i
//       ));
//     }
//   };

//   const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   const handleSave = () => {
//     if (!customer.trim() || selectedItems.length === 0) return;

//     onUpdate({
//       ...order,
//       customer,
//       waiter,
//       notes,
//       items: selectedItems,
//       total,
//     });
//     onOpenChange(false);
//   };

//   // Pega a quantidade atual de um produto
//   const getQuantity = (productId: string) => {
//     const item = selectedItems.find(i => i.id === productId);
//     return item?.quantity ?? 0;
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Editar Pedido {order.id}</DialogTitle>
//         </DialogHeader>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Dados do pedido */}
//           <div className="space-y-4">
//             <div>
//               <Label>Cliente</Label>
//               <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
//             </div>
//             <div>
//               <Label>Garçom</Label>
//               <Input value={waiter} onChange={(e) => setWaiter(e.target.value)} />
//             </div>
//             <div>
//               <Label>Observações</Label>
//               <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
//             </div>

//             {selectedItems.length > 0 && (
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-base">Itens do Pedido</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-2">
//                   {selectedItems.map((item) => (
//                     <div key={item.id} className="flex justify-between items-center p-2 bg-accent/50 rounded">
//                       <div>
//                         {item.name} — R$ {item.price.toFixed(2)}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
//                         <span>{item.quantity}</span>
//                         <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
//                       </div>
//                     </div>
//                   ))}
//                   <div className="flex justify-between font-bold pt-2 border-t">
//                     <span>Total:</span>
//                     <span>R$ {total.toFixed(2)}</span>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           {/* Cardápio */}
//           <div className="space-y-4">
//             <h3 className="font-semibold">Adicionar itens</h3>
//             <div className="space-y-2 max-h-96 overflow-y-auto">
//               {products.map((product) => {
//                 const quantity = getQuantity(product.id);

//                 return (
//                   <Card
//                     key={product.id}
//                     className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer"
//                   >
//                     <div className="flex-1" onClick={() => addItem(product)}>
//                       {product.name}
//                     </div>
//                     <div className="flex items-center gap-2">
//                       {quantity > 0 && <span>{quantity}</span>}
//                       <Button size="sm" onClick={() => addItem(product)}>
//                         +
//                       </Button>
//                     </div>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end gap-2 pt-4 border-t">
//           <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
//           <Button onClick={handleSave} disabled={selectedItems.length === 0 || !customer.trim()}>
//             Salvar Alterações
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

