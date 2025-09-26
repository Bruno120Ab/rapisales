import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { db, Product, Sale, SaleItem, StockMovement, Customer } from '@/lib/database';
import { authService } from '@/lib/auth';
import { formatCurrency } from '@/lib/formatters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { setupPWAInstallPrompt } from '@/pwa';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';


import { useNavigate } from "react-router-dom";

interface CartItem extends SaleItem {
  stock: number;
}

const PDV = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix' | 'crediario'>('dinheiro');
  const [discount, setDiscount] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [installments, setInstallments] = useState(1);
  const { user, profile, isLoading } = useAuth();

  const navigate = useNavigate();


  // Redireciona para login se não estiver logado
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const city = profile?.id

  console.log(profile?.id)

  useEffect(() => {
  // Se houver profile, busca por cidade; senão busca todos
    loadCustomers();
    if (city) {
      // loadProducts();
      fetchProducts(city)
      // fetchProductsByCity(city);
    } else {
      fetchAllProducts();
    }
}, [profile])


  const loadCustomers = async () => {
    try {
      const allCustomers = await db.customers.toArray();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };
const fetchProducts = async (ownerId: string) => {
  try {
    // 1️⃣ Buscar o restaurante do dono
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (restaurantError) throw restaurantError;

    if (!restaurant) {
      console.warn('Nenhum restaurante encontrado para este dono.');
      setProducts([]);
      return;
    }

    const restaurantId = restaurant.id;

    // 2️⃣ Buscar produtos do restaurante
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('display_order', { ascending: true });

    if (productsError) throw productsError;

    setProducts(productsData || []);
  } catch (err: any) {
    console.error('Erro ao buscar produtos:', err.message);
    setProducts([]);
  }
};

  // const loadProducts = async () => {
  //   try {
  //   // setIsLoading(true);
  //   const { data, error } = await supabase
  //     .from("products")
  //     .select(`
  //       id,
  //       name,
  //       description,
  //       price,
  //       image_url,
  //       restaurant:restaurants!inner(id, name, delivery_fee, city, status, is_open)
  //     `)
  //     .eq("restaurant.city", city)
  //     .eq("restaurant.is_open", true)
  //     .limit(12);

  //   if (error) throw error;

  //   setProducts(data || []);
  // } catch (error) {
  //   console.error("Error fetching products by city:", error);
  // } finally {
  //   // setIsLoading(false);
  // }
  // };
  const fetchProductsByCity = async (id: string) => {
    try {
        // setIsLoading(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          throw new Error('Restaurante não encontrado');
        }
        
        // setRestaurant(data);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        toast({
          title: "Erro",
          description: "Restaurante não encontrado",
          variant: "destructive"
        });
        // navigate('/restaurants');
      } finally {
        // setIsLoading(false);
      }
  };

  const fetchAllProducts = async () => {
    try {
      // setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          restaurant:restaurants!inner(id, name, delivery_fee, city, status, is_open)
        `)
        .eq("restaurant.is_open", true)
        .limit(12);

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching all products:", error);
    } finally {
      // setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  console.log(filteredProducts)
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id!);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${product.stock} unidades disponíveis.`,
          variant: "destructive",
        });
        return;
      }
      updateCartQuantity(product.id!, existingItem.quantity + 1);
    } else {
      if (product.stock <= 0) {
        toast({
          title: "Produto sem estoque",
          description: "Este produto não possui estoque disponível.",
          variant: "destructive",
        });
        return;
      }
      
      const newItem: CartItem = {
        productId: product.id!,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price,
        stock: product.stock
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => {
      if (item.productId === productId) {
        if (newQuantity > item.stock) {
          toast({
            title: "Estoque insuficiente",
            description: `Apenas ${item.stock} unidades disponíveis.`,
            variant: "destructive",
          });
          return item;
        }
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    return subtotal - discount;
  };

  const finalizeSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === 'crediario' && !selectedCustomer) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para vendas no crediário.",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        return;
      }

      // Create sale record
      const sale: Omit<Sale, 'id'> = {
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        total: getCartTotal(),
        paymentMethod,
        discount,
        createdAt: new Date(),
        userId: currentUser.id,
        customerId: selectedCustomer,
        installments: paymentMethod === 'crediario' ? installments : undefined,
        installmentValue: paymentMethod === 'crediario' ? getCartTotal() / installments : undefined
      };

      const saleId = await db.sales.add(sale);

      // Update stock and create stock movements
      for (const item of cart) {
        const product = await db.products.get(item.productId);
        if (product) {
          const newStock = product.stock - item.quantity;
          await db.products.update(item.productId, { 
            stock: newStock,
            updatedAt: new Date()
          });

          // Create stock movement
          const stockMovement: Omit<StockMovement, 'id'> = {
            productId: item.productId,
            productName: item.productName,
            type: 'saida',
            quantity: item.quantity,
            reason: `Venda #${saleId}`,
            createdAt: new Date()
          };
          await db.stockMovements.add(stockMovement);
        }
      }

      // Se for crediário, criar entrada na agenda de credores
      if (paymentMethod === 'crediario' && selectedCustomer) {
        const customer = customers.find(c => c.id === selectedCustomer);
        if (customer) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // Vencimento em 30 dias

          await db.creditors.add({
            customerId: selectedCustomer,
            customerName: customer.name,
            totalDebt: getCartTotal(),
            paidAmount: 0,
            remainingAmount: getCartTotal(),
            dueDate: dueDate,
            description: `Venda #${saleId} - ${installments}x ${formatCurrency(getCartTotal() / installments)}`,
            status: 'pendente',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      // Clear cart and reload products
      setCart([]);
      setDiscount(0);
      setSelectedCustomer(null);
      setInstallments(1);
      // await fetchAllProducts();

      toast({
        title: "Venda finalizada!",
        description: `Venda #${saleId} registrada com sucesso.`,
        variant: "default",
      });

    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a venda.",
        variant: "destructive",
      });
    }
  };

  const paymentMethods = [
    { id: 'dinheiro' as const, label: 'Dinheiro', icon: Banknote },
    { id: 'cartao' as const, label: 'Cartão', icon: CreditCard },
    { id: 'pix' as const, label: 'PIX', icon: Smartphone },
    { id: 'crediario' as const, label: 'Crediário', icon: Calendar },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Ponto de Venda</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {products.length} produtos cadastrados
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código de barras ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
  {filteredProducts.map((product) => {
    const isAvailable = product.available;

    return (
      <div key={product.id} className="relative">
        {/* Card clicável somente se disponível */}
        <Card
          className={cn(
            "p-4 transition-all rounded-lg bg-white",
            !isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg"
          )}
          onClick={() => isAvailable && addToCart(product)}
        >
          {/* Imagem do Produto */}
          <div className="w-full aspect-[4/3] overflow-hidden rounded mb-2 bg-gray-100 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-sm">Sem imagem</span>
            )}
          </div>

          {/* Nome e categoria */}
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-sm">{product.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{product.category}</p>

          {/* Preço e ícone */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {isAvailable && (
              <Plus className="h-5 w-5 text-green-500 hover:text-green-600 transition-colors" />
            )}
          </div>
        </Card>

        {/* Overlay de Fora de Estoque */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg pointer-events-none">
            <span className="text-white font-bold text-sm">Fora de estoque</span>
          </div>
        )}
      </div>
    );
  })}
</div>

        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Carrinho</h2>
              <Badge variant="secondary">{cart.length}</Badge>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} cada
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Carrinho vazio
              </p>
            )}
          </Card>

          {cart.length > 0 && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(cart.reduce((sum, item) => sum + item.total, 0))}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm">Desconto:</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={discount || ''}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      className="h-8 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <Separator />
                  
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(getCartTotal())}</span>
                </div>
                </div>

                {/* Cliente */}
                {paymentMethod === 'crediario' && (
                  <div className="space-y-2">
                    <Label htmlFor="customer">Cliente *</Label>
                    <Select value={selectedCustomer?.toString() || ''} onValueChange={(value) => setSelectedCustomer(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id!.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de pagamento:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <Button
                          key={method.id}
                          variant={paymentMethod === method.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setPaymentMethod(method.id);
                            if (method.id !== 'crediario') {
                              setSelectedCustomer(null);
                              setInstallments(1);
                            }
                          }}
                          className="flex flex-col items-center p-2 h-auto"
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span className="text-xs">{method.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Parcelamento */}
                {paymentMethod === 'crediario' && (
                  <div className="space-y-2">
                    <Label htmlFor="installments">Parcelas</Label>
                    <Select value={installments.toString()} onValueChange={(value) => setInstallments(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x de {formatCurrency(getCartTotal() / num)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={finalizeSale}
                  className="w-full"
                  size="lg"
                >
                  Finalizar Venda
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDV;