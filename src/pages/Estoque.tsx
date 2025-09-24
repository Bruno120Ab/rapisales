import { useState, useEffect, useMemo } from 'react';
// import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { db, Product, StockMovement, Customer } from '@/lib/database';
import { 
  // Package, 
  Plus, 
  Edit, 
  AlertTriangle,
  Search,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ZapDialog from '@/components/ZapDialog';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// const Estoque = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [showAddDialog, setShowAddDialog] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [showZapDialog, setShowZapDialog] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
//   const [newProduct, setNewProduct] = useState<Partial<Product>>({
//     name: '',
//     price: 0,
//     stock: 0,
//     category: '',
//     barcode: '',
//     description: '',
//     supplier: '',
//     minStock: 5
//   });

//   const [cost, setCost] = useState<number>(0);
//   const [margin, setMargin] = useState<number>(0);
//   const [tax, setTax] = useState<number>(0);
//   const [isManualPrice, setIsManualPrice] = useState(false);

//   // Calcula o preço sugerido
//   const calculatePrice = () => {
//     return ((cost || 0) * (1 + (margin || 0) / 100)) * (1 + (tax || 0) / 100);
//   };

//   // Atualiza o preço quando custo/margem/imposto mudam
//   useEffect(() => {
//     if (!isManualPrice) {
//       setNewProduct(prev => ({ ...prev, price: calculatePrice() }));
//     }
//   }, [cost, margin, tax]);

//   useEffect(() => {
//     loadProducts();
//     loadCustomers();
//   }, []);

//   const loadCustomers = async () => {
//     try {
//       const allCustomers = await db.customers.toArray();
//       setCustomers(allCustomers);
//     } catch (error) {
//       console.error('Erro ao carregar clientes:', error);
//     }
//   };

//   const loadProducts = async () => {
//     try {
//       const allProducts = await db.products.toArray();
//       setProducts(allProducts);
//     } catch (error) {
//       console.error('Erro ao carregar produtos:', error);
//       toast({ title: "Erro", description: "Não foi possível carregar os produtos.", variant: "destructive" });
//     }
//   };

//   const categories = [...new Set(products.map(p => p.category))];

//   const filteredProducts = products.filter(product => {
//     const matchesSearch =
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
//     return matchesSearch && matchesCategory;
//   });

//   const lowStockProducts = products.filter(p => p.stock <= p.minStock);

//   const saveProduct = async () => {
//     try {
//       if (!newProduct.name || !newProduct.category || newProduct.price === undefined) {
//         toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
//         return;
//       }

//       const productData: Product = {
//         ...(newProduct as Product),
//         updatedAt: new Date(),
//         createdAt: editingProduct ? editingProduct.createdAt : new Date()
//       };

//       if (editingProduct) {
//         await db.products.update(editingProduct.id!, productData);
//         toast({ title: "Produto atualizado", description: "Produto atualizado com sucesso." });
//       } else {
//         await db.products.add(productData);
//         toast({ title: "Produto adicionado", description: "Produto adicionado com sucesso." });
//       }

//       setShowAddDialog(false);
//       setEditingProduct(null);
//       resetNewProduct();
//       await loadProducts();
//     } catch (error) {
//       console.error('Erro ao salvar produto:', error);
//       toast({ title: "Erro", description: "Não foi possível salvar o produto.", variant: "destructive" });
//     }
//   };

//   const resetNewProduct = () => {
//     setNewProduct({
//       name: '',
//       price: 0,
//       stock: 0,
//       category: '',
//       barcode: '',
//       description: '',
//       supplier: '',
//       minStock: 5
//     });
//     setCost(0);
//     setMargin(0);
//     setTax(0);
//     setIsManualPrice(false);
//   };

//   const editProduct = (product: Product) => {
//     setEditingProduct(product);
//     setNewProduct(product);
//     setCost(product.price); // você pode calcular backward se quiser
//     setMargin(0);
//     setTax(0);
//     setIsManualPrice(true);
//     setShowAddDialog(true);
//   };

//   const adjustStock = async (productId: number, adjustment: number, reason: string) => {
//     try {
//       const product = await db.products.get(productId);
//       if (!product) return;
//       const newStock = Math.max(0, product.stock + adjustment);
//       await db.products.update(productId, { stock: newStock, updatedAt: new Date() });
//       const stockMovement: Omit<StockMovement, 'id'> = {
//         productId,
//         productName: product.name,
//         type: adjustment > 0 ? 'entrada' : adjustment < 0 ? 'saida' : 'ajuste',
//         quantity: Math.abs(adjustment),
//         reason,
//         createdAt: new Date()
//       };
//       await db.stockMovements.add(stockMovement);
//       await loadProducts();
//       toast({ title: "Estoque ajustado", description: `Estoque de ${product.name} ajustado.` });
//     } catch (error) {
//       console.error('Erro ao ajustar estoque:', error);
//       toast({ title: "Erro", description: "Não foi possível ajustar o estoque.", variant: "destructive" });
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Cabeçalho e botão Novo Produto */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-foreground">Controle de Estoque</h1>
//         <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
//           <DialogTrigger asChild>
//             <Button
//               onClick={() => {
//                 setEditingProduct(null);
//                 resetNewProduct();
//                 setShowAddDialog(true);
//               }}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Novo Produto
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <InputField label="Nome *" value={newProduct.name} onChange={(v) => setNewProduct({ ...newProduct, name: v })} />
              
//               <div className="grid grid-cols-2 gap-2">
//                 <InputField label="Custo do Produto" type="number" value={cost} onChange={(v) => { setCost(Number(v)); setIsManualPrice(false); }} />
//                 <InputField label="Margem (%)" type="number" value={margin} onChange={(v) => { setMargin(Number(v)); setIsManualPrice(false); }} />
//                 <InputField label="Impostos (%)" type="number" value={tax} onChange={(v) => { setTax(Number(v)); setIsManualPrice(false); }} />
//                 <InputField
//                   label="Preço Final *"
//                   type="text" // usamos "text" para permitir a formatação com R$
//                   value={newProduct.price !== undefined ? `R$ ${newProduct.price.toFixed(2)}` : ''}
//                   onChange={(v) => {
//                     // Remove tudo que não é número ou ponto
//                     const numericValue = Number(v.replace(/[^0-9.]/g, ''));
//                     setNewProduct({ ...newProduct, price: numericValue });
//                     setIsManualPrice(true);
//                   }}
//                   placeholder={`R$ ${ formatCurrency(calculatePrice())}`}
//                 />
//                 <InputField label="Estoque" type="number" value={newProduct.stock} onChange={(v) => setNewProduct({ ...newProduct, stock: Number(v) })} />
//               </div>

//               <InputField label="Categoria *" value={newProduct.category} onChange={(v) => setNewProduct({ ...newProduct, category: v })} />
//               <InputField label="Código de Barras" value={newProduct.barcode} onChange={(v) => setNewProduct({ ...newProduct, barcode: v })} />
//               <InputField label="Fornecedor" value={newProduct.supplier} onChange={(v) => setNewProduct({ ...newProduct, supplier: v })} />
//               <InputField label="Estoque Mínimo" type="number" value={newProduct.minStock} onChange={(v) => setNewProduct({ ...newProduct, minStock: Number(v) })} />

//               <Button onClick={saveProduct} className="w-full">{editingProduct ? 'Atualizar' : 'Adicionar'} Produto</Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Cards de estatísticas */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <StatCard icon={<Package className="h-6 w-6 text-primary" />} title="Total de Produtos" value={products.length} />
//         <StatCard icon={<AlertTriangle className="h-6 w-6 text-warning" />} title="Estoque Baixo" value={lowStockProducts.length} />
//         <StatCard icon={<TrendingUp className="h-6 w-6 text-success" />} title="Valor Total Estoque" value={`R$ ${ formatCurrency(products.reduce((sum, p) => sum + (p.price * p.stock), 0))}`} />
//       </div>

//       {/* Filtros */}
//       <Card className="p-4 mb-4">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="relative flex-1">
//             <SearchInput placeholder="Buscar produtos..." value={searchTerm} onChange={setSearchTerm} />
//           </div>
//           <Select value={categoryFilter} onValueChange={setCategoryFilter}>
//             <SelectTrigger className="w-full md:w-48">
//               <SelectValue placeholder="Filtrar por categoria" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Todas as categorias</SelectItem>
//               {categories.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
//             </SelectContent>
//           </Select>
//         </div>
//       </Card>

//       {/* Tabela de produtos */}
//       <Card>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="border-b">
//               <tr className="text-left">
//                 <th className="p-4 font-medium">Produto</th>
//                 <th className="p-4 font-medium">Categoria</th>
//                 <th className="p-4 font-medium">Preço</th>
//                 <th className="p-4 font-medium">Estoque</th>
//                 <th className="p-4 font-medium">Status</th>
//                 <th className="p-4 font-medium">Ações</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredProducts.map((product) => (
//                 <tr key={product.id} className="border-b hover:bg-muted/50">
//                   <td className="p-4">
//                     <p className="font-medium">{product.name}</p>
//                     {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
//                   </td>
//                   <td className="p-4"><Badge variant="outline">{product.category}</Badge></td>
//                   <td className="p-4 font-medium">R$ { formatCurrency(product.price)}</td>
//                   <td className="p-4"><span className="font-medium">{product.stock}</span> <span className="text-xs text-muted-foreground">un.</span></td>
//                   <td className="p-4">
//                     <Badge variant={product.stock <= 0 ? "destructive" : product.stock <= product.minStock ? "warning" : "success"}>
//                       {product.stock <= 0 ? "Sem estoque" : product.stock <= product.minStock ? "Estoque baixo" : "Normal"}
//                     </Badge>
//                   </td>
//                   <td className="p-4 flex items-center space-x-1">
//                     <Button size="sm" variant="outline" onClick={() => editProduct(product)}><Edit className="h-3 w-3" /></Button>
//                     <Button size="sm" variant="outline" onClick={() => adjustStock(product.id!, 10, "Entrada manual")}><TrendingUp className="h-3 w-3" /></Button>
//                     <Button size="sm" variant="outline" onClick={() => adjustStock(product.id!, -1, "Saída manual")}><TrendingDown className="h-3 w-3" /></Button>
//                     {/* <Button 
//                       size="sm" 
//                       variant="outline" 
//                       onClick={() => {
//                         setSelectedProduct(product);
//                         setShowZapDialog(true);
//                       }}
//                       className="text-yellow-600 hover:text-yellow-700"
//                     >
//                       <Zap className="h-3 w-3" />
//                     </Button> */}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Card>

//       {/* Modal do Zapier */}
//       <ZapDialog 
//         isOpen={showZapDialog}
//         onClose={() => setShowZapDialog(false)}
//         product={selectedProduct}
//         customers={customers}
//       />
//     </div>
//   );
// };

// // Componentes auxiliares
// const InputField = ({ label, value, onChange, type = "text", placeholder }: any) => (
//   <div>
//     <Label>{label}</Label>
//     <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
//   </div>
// );

// const StatCard = ({ icon, title, value }: any) => (
//   <Card className="p-4">
//     <div className="flex items-center space-x-3">
//       <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
//       <div>
//         <p className="text-sm text-muted-foreground">{title}</p>
//         <p className="text-2xl font-bold">{value}</p>
//       </div>
//     </div>
//   </Card>
// );

// const SearchInput = ({ placeholder, value, onChange }: any) => (
//   <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
// );


// export default Estoque;





import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle,
  Truck,
  Package,
  X,
  Phone,
  MapPin,
  Home,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { Order, useOrders } from '@/hooks/useOrders';
import { MotoButtonExample } from '@/components/Buttondelivery';
const printCountMap: Record<string, number> = {};

const printThermalOrderForDelivery = (order: Order) => {
  if (!printCountMap[order.id]) {
    printCountMap[order.id] = 1;
  } else {
    printCountMap[order.id] += 1;
  }

  const currentPrintNumber = printCountMap[order.id];
  const isFirstPrint = currentPrintNumber === 1 ? 'Sim' : 'Não';

  const printWindow = window.open('', '', 'width=350,height=800');
  if (!printWindow) return;

  const printDate = new Date();
  const formattedDate = printDate.toLocaleString('pt-BR');

  const restaurant = order.restaurant;
  const restaurantName = restaurant?.name || 'Restaurante';
  // const restaurantOwner = restaurant?.owner_name || 'Proprietário não informado';

  // Informações do cliente
 // Informações do cliente com campo de pagamento
const clientInfo = `
Cliente: ${order.customer?.name || 'Não informado'}
Tel: ${order.customer?.phone || 'Não informado'}
Endereço: ${order.delivery_address}
Pagamento: ${order.payment_method}
Pagamento recebido: [  ]  (marque se já foi pago)
`;


  // Produtos detalhados
  const itemsLines = order.order_items?.map(item => {
    const unitPrice = item.unit_price;
    const addonsLines = item.addons?.map(a => {
      const totalAddon = a.unit_price * a.quantity;
      return `   + ${a.addon?.name.padEnd(15)} R$${a.unit_price.toFixed(2).padStart(6)} x${a.quantity} = R$${totalAddon.toFixed(2).padStart(6)}`;
    }).join('\n') || '';

    const itemTotal = (unitPrice + (item.addons?.reduce((sum, a) => sum + a.unit_price * a.quantity, 0) || 0)) * item.quantity;
    const observations = item.observations ? `   Obs: ${item.observations}` : '';

    return `
${item.product?.name.padEnd(20)} | Qtd: ${String(item.quantity).padStart(2)} | Unit: R$${unitPrice.toFixed(2).padStart(6)} | Total: R$${itemTotal.toFixed(2).padStart(6)}
${addonsLines ? addonsLines + '\n' : ''}${observations ? observations + '\n' : ''}
`;
  }).join('\n');

  // Subtotais e frete
  const subtotal = order.total_amount - (order.delivery_fee || 0);
  const frete = order.delivery_fee || 0;
  const total = order.total_amount;

  // Informações para entregador
  const deliveryInfo = `
=== INFORMAÇÕES PARA ENTREGADOR ===
Cliente: ${order.customer?.name || 'Não informado'}
Tel: ${order.customer?.phone || 'Não informado'}
Endereço: ${order.delivery_address}
${order.observations ? `Observações: ${order.observations}` : ''}
`;

  printWindow.document.write(`
<html>
<head>
<title>Pedido #${order.id.slice(0,8)}</title>
<style>
  body { font-family: monospace; padding: 5px; font-size: 12px; line-height: 1.3; white-space: pre-wrap; }
  h1 { text-align: center; font-size: 16px; margin-bottom: 5px; }
  hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
</style>
</head>
<body>
<div class="center bold">Pedido #${currentPrintNumber}</div>
<hr/>
<div>${clientInfo}</div>
<hr/>
${itemsLines}
<hr/>
<div>${deliveryInfo}</div>
<hr/>
<div class="right">Subtotal: R$ ${subtotal.toFixed(2)}</div>
<div class="right">Frete:    R$ ${frete.toFixed(2)}</div>
<div class="right bold">TOTAL:    R$ ${total.toFixed(2)}</div>
<hr/>
<div>${restaurantName}</div>
<div>Impresso em: ${formattedDate}</div>
<div>Primeira impressão: ${isFirstPrint}</div>
<hr/>
<div class="center bold">RapiDelivery</div>
</body>
</html>
  `);

  printWindow.document.close();
  printWindow.print();
};

const OrderManagement = () => {
  const { profile, restaurant } = useAuth();
  const { orders, isLoading, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [view, setView] = useState<"list" | "grid">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterToday, setFilterToday] = useState(false);


  if (profile?.user_type !== "vendor" || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground">
              Apenas vendedores podem gerenciar pedidos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      preparing: "bg-orange-500",
      ready: "bg-green-500",
      delivering: "bg-purple-500",
      delivered: "bg-gray-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Pronto",
      delivering: "Entregando",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: Package,
      ready: CheckCircle,
      delivering: Truck,
      delivered: CheckCircle,
      cancelled: X,
    };
    return icons[status] || Clock;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    const { error } = await updateOrderStatus(orderId, newStatus);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status atualizado!",
        description: `Pedido marcado como ${getStatusText(newStatus).toLowerCase()}`,
      });
    }
  };

  const openWhatsApp = (order: Order) => {
    const message = encodeURIComponent(
      `Olá ${order.customer?.name || "Cliente"}! Seu pedido #${order.id.slice(
        0,
        8
      )} está ${getStatusText(order.status).toLowerCase()}.\n\n` +
        `Total: R$ ${order.total_amount.toFixed(2)}\n` +
        `Endereço: ${order.delivery_address}`
    );
    const phone = order.customer?.phone?.replace(/\D/g, "") || "5511999999999";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

const filteredOrders = useMemo(() => {
  let result = orders;

  if (filterStatus !== "all") {
    result = result.filter((o) => o.status === filterStatus);
  }

  if (filterToday) {
    const today = new Date();
    result = result.filter((o) => {
      const orderDate = new Date(o.created_at);
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    });
  }

  return result;
}, [orders, filterStatus, filterToday]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-orange-600 mb-2">
            Pedidos do RapiDelivery
          </h2>
          <p className="text-gray-600 text-lg">
            Acompanhe os pedidos de delivery em tempo real.
          </p>
        </div>

        {/* FILTRO + VIEW TOGGLE */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 border-gray-300 rounded-lg">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {[
                "pending",
                "confirmed",
                "preparing",
                "ready",
                "delivering",
                "delivered",
                "cancelled",
              ].map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusText(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}>
              Fila
            </Button>
            <Button variant={view === "grid" ? "default" : "outline"} onClick={() => setView("grid")}>
              Grid
            </Button>
            <Button
  variant={filterToday ? "default" : "outline"}
  onClick={() => setFilterToday(!filterToday)}
>
  Hoje
</Button>
          </div>
        </div>

        {/* PEDIDOS */}
        {orders.length === 0 ? (
          <Card className="shadow-md border">
            <CardContent className="text-center py-16">
              <ShoppingBag className="mx-auto h-20 w-20 text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold mb-2 text-gray-700">Nenhum pedido</h3>
              <p className="text-gray-500">Os pedidos aparecerão aqui quando chegarem</p>
            </CardContent>
          </Card>
        ) : (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
            {filteredOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);

              return (
                <Card key={order.id} className="shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                          <StatusIcon className="h-5 w-5 text-red-500" />
                          Pedido #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(order.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full text-sm`}>
                          {getStatusText(order.status)}
                        </Badge>
                        <p className="text-xl font-bold text-gray-900 mt-1">R$ {order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 py-4 space-y-4">
                    {/* Cliente */}
                    <div className="flex items-center justify-between bg-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                    <p className="text-sm font-semibold">{order.customer?.name}</p>
                    <p className="text-xs text-gray-500">{order.customer?.phone}</p>
                    </div>
                    </div>

                    {/* Agrupa os botões juntos */}
                    <div className="flex flex-wrap items-center gap-2">
  <Button
    size="sm"
    variant="outline"
    className="flex-1 sm:flex-none"
    onClick={() => printThermalOrderForDelivery(order)}
  >
    🖨️ Imprimir pedido
  </Button>

  <Button
    size="sm"
    className="bg-green-500 hover:bg-green-600 text-white rounded-lg flex-1 sm:flex-none"
    onClick={() => openWhatsApp(order)}
  >
    <Phone className="h-4 w-4 mr-1" /> WhatsApp Cliente
  </Button>
</div>

                    </div>


                    {/* Endereço */}
                    <div className="flex items-start gap-3 bg-gray-100 rounded-xl p-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-semibold">Entrega</p>
                        <p className="text-xs text-gray-500">{order.delivery_address}</p>
                      </div>
                    </div>

                    {/* Itens */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Itens do pedido</h4>
                      <div className="space-y-3">
                        {order.order_items?.map((item) => {
                          const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.unit_price * addon.quantity, 0) || 0;
                          const itemTotal = (item.unit_price + addonsTotal) * item.quantity;

                          return (
                            <div key={item.id} className="flex justify-between items-start border-b border-gray-200 pb-2">
                              <div>
                                <p className="text-sm font-medium">{item.quantity}x {item.product?.name}</p>
                                {item.addons?.length > 0 && (
                                  <ul className="ml-4 mt-1 space-y-1">
                                    {item.addons.map((addon) => (
                                      <li key={addon.id} className="text-xs text-gray-500">
                                        + {addon.addon?.name} ({addon.quantity}x) — R$ {(addon.unit_price * addon.quantity).toFixed(2)}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <span className="text-sm font-bold text-gray-900">R$ {itemTotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Update */}
                    {order.status !== "delivered" && order.status !== "cancelled" && (
                     <div className="pt-4">
  <Label className="text-sm font-medium">Atualizar status:</Label>

  <div className="mt-2 flex items-center gap-2">
    <Select
      value={order.status}
      onValueChange={(value) => handleStatusUpdate(order.id, value as Order["status"])}
    >
      <SelectTrigger className="w-full border-gray-300 rounded-lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "delivering",
          "delivered",
          "cancelled",
        ].map((status) => (
          <SelectItem key={status} value={status}>
            {getStatusText(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <MotoButtonExample order={order} />
  </div>
</div>

                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


export default OrderManagement;



