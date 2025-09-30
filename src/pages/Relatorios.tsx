import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { db, Sale, StockMovement, User } from '@/lib/database';
import { formatCurrency } from '@/lib/formatters';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  Calendar,
  Download,
  User as UserIcon
} from 'lucide-react';
import { database, MenuItem, Order, Reservation, Stats, Table } from '@/app/database';
import { TopProductsCard } from '@/components/TopProducts';
import { SalesByWaiterCard } from '@/components/SaleByWaiter';
import { TotalSalesCard } from '@/components/TotalSales';
import { ProductsSoldCard } from '@/components/ProuctsSales';
import { TotalRevenueCard } from '@/components/TotalRevenue';
import { AverageTicketCard } from '@/components/AverageTicket';

const Relatorios = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [period, setPeriod] = useState('today');
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [loading, setLoading] = useState(true);



  const [tables, setTables] = useState<Table[]>([]);
const [orders, setOrders] = useState<Order[]>([]);
const [reservations, setReservations] = useState<Reservation[]>([]);
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [stats, setStats] = useState<Stats[]>([]);


const [selectedWaiter, setSelectedWaiter] = useState('all');
const [selectedTable, setSelectedTable] = useState('all');
const [selectedPayment, setSelectedPayment] = useState('all');



useEffect(() => {
  const loadDatabaseData = async () => {
    setLoading(true);
    try {
      const [tablesData, ordersData, reservationsData, menuData, statsData] = await Promise.all([
        database.getTables(),
        database.getOrders(),
        database.getReservations(),
        database.getMenuItems(),
        database.getStats(),
      ]);

      setTables(tablesData);
      setOrders(ordersData);
      setReservations(reservationsData);
      setMenuItems(menuData);
      setStats(statsData);
    } catch (error) {
      console.error("Erro ao carregar dados do DB:", error);
    } finally {
      setLoading(false);
    }
  };

  loadDatabaseData();
}, []);

  useEffect(() => {
    loadData();
  }, [period, selectedUserId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allSales, allMovements, allUsers] = await Promise.all([
        db.sales.toArray(),
        db.stockMovements.toArray(),
        db.users.toArray()
      ]);
      
      let filteredSales = filterByPeriod(allSales);
      const filteredMovements = filterByPeriod(allMovements);
      
      // Filtrar por vendedor
      if (selectedUserId !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.userId === parseInt(selectedUserId));
      }
      
      setSales(filteredSales);
      setStockMovements(filteredMovements);
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterByPeriod = (data: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      switch (period) {
        case 'today':
          return itemDate >= today;
        case 'yesterday':
          return itemDate >= yesterday && itemDate < today;
        case 'week':
          return itemDate >= weekAgo;
        case 'month':
          return itemDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const salesByPayment = sales.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = sales
    .flatMap(sale => sale.items)
    .reduce((acc, item) => {
      const existing = acc.find(p => p.productName === item.productName);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.total;
      } else {
        acc.push({
          productName: item.productName,
          quantity: item.quantity,
          revenue: item.total
        });
      }
      return acc;
    }, [] as Array<{productName: string, quantity: number, revenue: number}>)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Análise por vendedor
  const salesByUser = sales.reduce((acc, sale) => {
    const user = users.find(u => u.id === sale.userId);
    const userName = user?.username || 'Desconhecido';
    
    if (!acc[userName]) {
      acc[userName] = {
        totalSales: 0,
        totalRevenue: 0,
        salesCount: 0
      };
    }
    
    acc[userName].totalSales += 1;
    acc[userName].totalRevenue += sale.total;
    acc[userName].salesCount += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return acc;
  }, {} as Record<string, {totalSales: number, totalRevenue: number, salesCount: number}>);

  // Produtos únicos para filtro
  const uniqueProducts = Array.from(
    new Set(sales.flatMap(sale => sale.items.map(item => item.productName)))
  ).sort();

  const stockMovementsByType = stockMovements.reduce((acc, movement) => {
    acc[movement.type] = (acc[movement.type] || 0) + movement.quantity;
    return acc;
  }, {} as Record<string, number>);

  const mappedSales = sales.map(sale => ({
  ...sale,
  items: sale.items.map(item => ({
    id: item.productName, // ou algum id único
    name: item.productName,
    price: item.total / item.quantity, // calcula preço unitário
    category: "Desconhecido", // se não tiver categoria
    quantity: item.quantity,
  }))
}));

const combinedSales = useMemo(() => {
  // Vendas do PDV
  const pdvSales = sales.map(sale => ({
    id: sale.id,
    customer: 'Cliente PDV', // ou algum campo que faça sentido
    table: sale.table || '',
    waiter: sale.waiter || 'Desconhecido',
    total: sale.total,
    items: sale.items,
    paymentMethod: sale.paymentMethod,
    status: sale.status,
    createdAt: sale.createdAt,
  }));

  // Pedidos das mesas
  const mesaOrders = orders.map(order => ({
    id: order.id,
    customer: order.customer,
    table: order.table,
    waiter: order.waiter || 'Desconhecido',
    total: order.total,
    items: order.items,
    paymentMethod: order.paymentMethod || 'desconhecido',
    status: order.status,
    createdAt: order.time || order.date, // se orders usam `time` e `date`
  }));

  return [...pdvSales, ...mesaOrders];
}, [sales, orders]);

  const exportData = () => {
    const data = {
      period,
      summary: {
        totalRevenue,
        totalSales,
        averageTicket
      },
      sales,
      stockMovements,
      topProducts
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${period}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </div>
    );
  }

  const waiters = Array.from(new Set(combinedSales.map(s => s.waiter || 'Desconhecido')));
  const ourTables = Array.from(new Set(combinedSales.map(s => s.table))).filter(Boolean);
  const ourPayments = Array.from(new Set(combinedSales.map(s => s.paymentMethod))).filter(Boolean);

console.log(combinedSales)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Relatórios do RapiSales - PDV </h1>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os vendedores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id!.toString()}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        {/* Receita Total */}
        <TotalRevenueCard sales={sales} orders={orders} />


        {/* Total de Vendas */}
      <TotalSalesCard sales={sales} orders={orders} />

        {/* Ticket Médio */}
      <AverageTicketCard sales={sales} orders={orders} />

        {/* Produtos Vendidos */}
      <ProductsSoldCard sales={sales} orders={orders} />

        {/* Pedidos do Salão */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Pedidos do Salão</h3>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {orders.length > 0 ? (
            orders.map(order => (
              <div
                key={order.id}
                className="flex justify-between items-center p-3 bg-card hover:bg-card/80 rounded-lg shadow-sm transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{order.customer}</span>
                  <span className="text-sm text-muted-foreground">{order.table}</span>
                </div>

                <div className="text-right flex flex-col items-end space-y-1">
                  <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>

                  {order.paymentMethod && (
                    <Badge variant="outline" className="text-xs">
                      {order.paymentMethod === 'dinheiro'
                        ? 'Dinheiro'
                        : order.paymentMethod === 'cartao'
                        ? 'Cartão'
                        : 'PIX'}
                    </Badge>
                  )}
                </div>

                <Badge
                  variant={
                    order.status === 'pending'
                      ? 'secondary'
                      : order.status === 'preparing'
                      ? 'warning'
                      : order.status === 'ready'
                      ? 'info'
                      : order.status === 'paid'
                      ? 'success'
                      : 'destructive'
                  }
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum pedido no momento</p>
          )}
        </div>
      </Card>

        {/* Mesas */}
      <Card className="p-6 bg-background border border-border rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Mesas</h3>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {tables.length > 0 ? (
            tables.map(table => (
              <div
                key={table.id}
                className="flex justify-between items-center p-3 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      table.status === 'available'
                        ? 'bg-success'
                        : table.status === 'occupied'
                        ? 'bg-warning'
                        : 'bg-destructive'
                    }`}
                  />
                  <span className="font-medium text-foreground">Mesa {table.number}</span>
                </div>
                <span className="capitalize text-sm text-muted-foreground">{table.status}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma mesa cadastrada</p>
          )}
        </div>
      </Card>


        {/* Reservas */}
      

        {/* Produtos do Menu */}



      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">    
        <Card className="p-6 bg-background border border-border rounded-xl shadow-sm">
  <h3 className="text-xl font-semibold mb-4 text-foreground">Vendas Recentes</h3>

  {/* Filtros */}
  <div className="flex flex-wrap gap-2 mb-4">
    {/* Garçom */}
    <select
      className="border rounded px-3 py-1 text-sm"
      value={selectedWaiter}
      onChange={e => setSelectedWaiter(e.target.value)}
    >
      <option value="all">Todos os garçons</option>
      {waiters.map(w => (
        <option key={w} value={w}>{w}</option>
      ))}
    </select>

    {/* Mesa */}
    <select
      className="border rounded px-3 py-1 text-sm"
      value={selectedTable}
      onChange={e => setSelectedTable(e.target.value)}
    >
      <option value="all">Todas as mesas</option>
      {ourTables.map(t => (
        <option key={t} value={t}> {t}</option>
      ))}
    </select>

    {/* <select
    className="border rounded px-3 py-1 text-sm"
    value={selectedPayment}
    onChange={(e) => setSelectedTable(e.target.value)}
  >
  <option value="all">Pagamento</option>
  {ourPayments.map((t) => (
    <option key={t} value={t}> {t}</option>
  ))}
</select> */}

  <select
      className="border rounded px-3 py-1 text-sm"
      value={selectedPayment}
      onChange={e => setSelectedPayment(e.target.value)}
    >
      <option value="all">Pagamentos</option>
      {ourPayments.map(t => (
        <option key={t} value={t}> {t}</option>
      ))}
    </select>
  </div>

  {/* Lista de vendas */}
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {combinedSales
      .filter(sale => 
        (selectedWaiter === 'all' || sale.waiter === selectedWaiter) &&
        (selectedTable === 'all' || sale.table === selectedTable) &&
        (selectedPayment === 'all' || sale.paymentMethod === selectedPayment)

      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.time || '').getTime() -
          new Date(a.createdAt || a.time || '').getTime()
      )
      .slice(0, 10)
      .map((sale) => (
        <div
          key={sale.id}
          className="flex justify-between items-center p-4 bg-card rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{sale.customer || 'Cliente Desconhecido'}</span>
            {sale.table && <span className="text-sm text-muted-foreground">Mesa {sale.table}</span>}
            <span className="text-xs text-muted-foreground mt-1">
              {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} • Garçom: {sale.waiter || 'Desconhecido'}
            </span>
          </div>

          <div className="flex flex-col items-end space-y-1">
            <span className="font-semibold text-foreground">{formatCurrency(sale.total)}</span>
            {sale.paymentMethod && (
              <Badge variant="outline" className="text-xs">
                {sale.paymentMethod === 'cash' ? 'Dinheiro' : sale.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
              </Badge>
            )}
          </div>

          {sale.status && (
            <Badge className="capitalize px-3 py-1 text-xs">{sale.status}</Badge>
          )}
        </div>
      ))
    }

    {combinedSales.filter(sale => 
      (selectedWaiter === 'all' || sale.waiter === selectedWaiter) &&
      (selectedTable === 'all' || sale.table === selectedTable)
    ).length === 0 && (
      <p className="text-center text-muted-foreground py-12 text-sm">
        Nenhuma venda no período selecionado
      </p>
    )}
  </div>
</Card>

        
        <SalesByWaiterCard 
          sales={sales} 
          orders={orders} 
        />

        <TopProductsCard sales={mappedSales} orders={orders} />

      </div>
    </div>
  );
};

export default Relatorios;