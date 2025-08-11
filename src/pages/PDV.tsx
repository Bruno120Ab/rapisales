import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { db, Product, Sale, SaleItem, StockMovement } from '@/lib/database';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem extends SaleItem {
  stock: number;
}

const PDV = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await db.products.toArray();
      setProducts(allProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

    try {
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
        createdAt: new Date()
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

      // Clear cart and reload products
      setCart([]);
      setDiscount(0);
      await loadProducts();

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  product.stock <= 0 && "opacity-50"
                )}
                onClick={() => addToCart(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <Badge 
                    variant={product.stock <= product.minStock ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {product.stock} un.
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {product.stock > 0 && (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </Card>
            ))}
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
                      R$ {item.price.toFixed(2)} cada
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
                    <span>R$ {cart.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
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
                    <span className="text-primary">R$ {getCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de pagamento:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <Button
                          key={method.id}
                          variant={paymentMethod === method.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaymentMethod(method.id)}
                          className="flex flex-col items-center p-2 h-auto"
                        >
                          <Icon className="h-4 w-4 mb-1" />
                          <span className="text-xs">{method.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

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