import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, Clock, Users, CreditCard, Search, DollarSign } from "lucide-react";
import { useDatabase, useOrders, useReservations, useTables } from "@/app/useDatabase";
import { StatsCards } from "@/app/StatsCards";
import { TableMap } from "@/app/TableMap";
// import { LiveMetrics } from "@/app/LiveMetrics";
import { RecentOrders } from "@/app/RecentOrders";
import { CreateOrderDialog } from "@/app/CreateOrderDialog";
import { CreateReservationDialog } from "@/app/CreateReservationDialog";
import { OrderCard } from "@/app/OrderCard";
import { Input } from "@/components/ui/input";
import { database, Order } from "@/app/database";
import { useAuth } from "@/contexts/AuthContext";
import { EditOrderDialog } from "@/app/EditOrderDialog";

// importa os hooks e componentes da sua base


// const Dashboard = () => {
//   const [selectedTable, setSelectedTable] = useState<number | null>(null);
//   const [showCreateOrder, setShowCreateOrder] = useState(false);
//   const [showCreateReservation, setShowCreateReservation] = useState(false);
  
//   const { isInitialized } = useDatabase();
//   const { tables, occupyTable, reserveTable } = useTables();
//   const { addOrder } = useOrders();
//   const { addReservation } = useReservations();

//   const handleCreateOrder = async (orderData: any) => {
//     try {
//       const newOrder = await addOrder(orderData);
//       await occupyTable(orderData.tableId, orderData.items.length, newOrder.id);
//       setSelectedTable(null);
//     } catch (error) {
//       console.error("Failed to create order:", error);
//     }
//   };

//   const handleCreateReservation = async (reservationData: any) => {
//     try {
//       const newReservation = await addReservation(reservationData);
//       if (reservationData.tableId) {
//         await reserveTable(reservationData.tableId, reservationData.time, newReservation.id);
//       }
//     } catch (error) {
//       console.error("Failed to create reservation:", error);
//     }
//   };

//   if (!isInitialized) {
//     return (
//       <div className="min-h-screen bg-background pt-20 md:pt-8 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Inicializando sistema...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background pt-20 md:pt-8">
//       {/* Header */}
//       {/* <header className="bg-card border-b border-border shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div>
//               <h1 className="text-2xl font-bold text-foreground">RestaurantePRO</h1>
//               <p className="text-sm text-muted-foreground">Dashboard de Atendimento</p>
//             </div>
//             <div className="flex items-center gap-4">
//               <Link to="/reservations">
//                 <Button variant="outline" size="sm">
//                   <Clock className="h-4 w-4 mr-2" />
//                   Reservas
//                 </Button>
//               </Link>
//               <Button 
//                 onClick={() => setShowCreateOrder(true)}
//                 className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-primary-foreground"
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Nova Comanda
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header> */}

//       {/* Main */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-8">
//             <StatsCards />
//             <Card className="shadow-card">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="h-5 w-5 text-primary" />
//                   Mapa do Salão
//                 </CardTitle>
//                 <CardDescription>
//                   Clique em uma mesa para ver detalhes ou criar nova comanda
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <TableMap 
//                   tables={tables}
//                   selectedTable={selectedTable} 
//                   onTableSelect={setSelectedTable}
//                   onCreateOrder={() => setShowCreateOrder(true)}
//                 />
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-8">
//             <LiveMetrics />
//             <RecentOrders />
//             <Card>
//               <CardHeader>
//                 <CardTitle>Ações Rápidas</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Link to="/orders">
//                   <Button variant="outline" className="w-full justify-start hover:bg-primary/5 hover:border-primary">
//                     <CreditCard className="h-4 w-4 mr-2" />
//                     Ver Comandas
//                   </Button>
//                 </Link>
//                 <Button 
//                   variant="outline" 
//                   className="w-full justify-start hover:bg-secondary/5 hover:border-secondary"
//                   onClick={() => setShowCreateReservation(true)}
//                 >
//                   <Users className="h-4 w-4 mr-2" />
//                   Nova Reserva
//                 </Button>
//                 <Link to="/orders?status=ready">
//                   <Button 
//                     variant="outline" 
//                     className="w-full justify-start hover:bg-warning/5 hover:border-warning"
//                   >
//                     <Clock className="h-4 w-4 mr-2" />
//                     Pedidos Prontos
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Dialogs */}
//         <CreateOrderDialog
//           open={showCreateOrder}
//           onOpenChange={setShowCreateOrder}
//           tables={tables}
//           selectedTable={tables.find(t => t.id === selectedTable)}
//           onCreateOrder={handleCreateOrder}
//         />

//         <CreateReservationDialog
//           open={showCreateReservation}
//           onOpenChange={setShowCreateReservation}
//           tables={tables}
//           onCreateReservation={handleCreateReservation}
//         />
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



// const Dashboard = () => {
//   const [selectedTable, setSelectedTable] = useState<number | null>(null);
//   const [showCreateOrder, setShowCreateOrder] = useState(false);
//   const [showCreateReservation, setShowCreateReservation] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [view, setView] = useState<View>("map");

//   const { isInitialized } = useDatabase();
//   const { tables, occupyTable, freeTable } = useTables();
//   const { orders, addOrder, updateOrder, deleteOrder } = useOrders();
//   const { addReservation } = useReservations();

//   if (!isInitialized) {
//     return (
//       <div className="min-h-screen bg-background pt-20 md:pt-8 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Inicializando sistema...</p>
//         </div>
//       </div>
//     );
//   }

//   // Função para liberar mesa
//   const releaseTable = (tableId: number) => freeTable(tableId);

//   // Criação de comanda
//  const handleCreateOrder = async (orderData: any) => {
//   try {
//     // Cria a comanda
//     const newOrder = await addOrder(orderData);

//     // Marca a mesa como ocupada
//     if (newOrder.table) {
//       await occupyTable(Number(newOrder.table), orderData.items.length, newOrder.id);
//     }

//     setSelectedTable(null);
//     setShowCreateOrder(false);
//   } catch (error) {
//     console.error("Falha ao criar comanda:", error);
//   }
// };


//   // Criação de reserva
//   const handleCreateReservation = async (reservationData: any) => {
//     try {
//       const newReservation = await addReservation(reservationData);
//       if (reservationData.tableId) {
//         await occupyTable(reservationData.tableId, reservationData.customers, newReservation.id);
//       }
//       setShowCreateReservation(false);
//     } catch (error) {
//       console.error("Falha ao criar reserva:", error);
//     }
//   };

//   // Filtragem de pedidos
//   const filteredOrders = orders.filter((order) => {
//     const matchesSearch =
//       order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.table.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = statusFilter === "all" || order.status === statusFilter;
//     return matchesSearch && matchesFilter;
//   });

//   return (
//     <div className="min-h-screen bg-background pt-20 md:pt-8">
//       {/* Toggle View */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 mb-6">
//         <Button variant={view === "map" ? "default" : "outline"} onClick={() => setView("map")}>
//           Mapa do Salão
//         </Button>
//         <Button variant={view === "orders" ? "default" : "outline"} onClick={() => setView("orders")}>
//           Comandas
//         </Button>
//       </div>

//       {view === "map" ? (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-8">
//             <StatsCards />
//             <Card className="shadow-card">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="h-5 w-5 text-primary" />
//                   Mapa do Salão
//                 </CardTitle>
//                 <CardDescription>Clique em uma mesa para ver detalhes ou criar nova comanda</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <TableMap
//                   tables={tables}
//                   selectedTable={selectedTable}
//                   onTableSelect={setSelectedTable}
//                   onCreateOrder={() => setShowCreateOrder(true)}
//                 />
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-8">
//             <LiveMetrics />
//             <RecentOrders />
//             <Card>
//               <CardHeader>
//                 <CardTitle>Ações Rápidas</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Link to="/orders">
//                   <Button className="w-full justify-start hover:bg-primary/5 hover:border-primary" variant="outline">
//                     <CreditCard className="h-4 w-4 mr-2" />
//                     Ver Comandas
//                   </Button>
//                 </Link>
//                 <Button
//                   className="w-full justify-start hover:bg-secondary/5 hover:border-secondary"
//                   variant="outline"
//                   onClick={() => setShowCreateReservation(true)}
//                 >
//                   <Users className="h-4 w-4 mr-2" />
//                   Nova Reserva
//                 </Button>
//                 <Link to="/orders?status=ready">
//                   <Button className="w-full justify-start hover:bg-warning/5 hover:border-warning" variant="outline">
//                     <Clock className="h-4 w-4 mr-2" />
//                     Pedidos Prontos
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
//           {/* Cards resumo */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {/* seus Cards de resumo aqui */}
//           </div>

//           {/* Lista de pedidos */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Filtros e Busca</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 max-h-[400px] overflow-y-auto">
//                 {filteredOrders.map((order) => (
//                   <OrderCard
//                     key={order.id}
//                     order={order}
//                     onUpdate={updateOrder}
//                     onDelete={deleteOrder}
//                     releaseTable={(tableId) => releaseTable(Number(tableId))}
//                   />
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Dialogs */}
//       <CreateOrderDialog
//         open={showCreateOrder}
//         onOpenChange={setShowCreateOrder}
//         tables={tables}
//         selectedTable={tables.find((t) => t.id === selectedTable)}
//         onCreateOrder={handleCreateOrder}
//       />

//       <CreateReservationDialog
//         open={showCreateReservation}
//         onOpenChange={setShowCreateReservation}
//         tables={tables}
//         onCreateReservation={handleCreateReservation}
//       />
//     </div>
//   );
// };
type View = "map" | "orders";

export const Dashboard = () => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showCreateReservation, setShowCreateReservation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<View>("map");
// State para edição
const [editingOrder, setEditingOrder] = useState<Order | null>(null);
const [showEditOrder, setShowEditOrder] = useState(false);

// Função para abrir modal de edição
const handleEditOrder = (order: Order) => {
  setEditingOrder(order);
  setShowEditOrder(true);
};

// Função para atualizar pedido
const handleUpdateOrder = (updatedOrder: Order) => {
  updateOrder(updatedOrder); // sua função do hook useOrders()
  setShowEditOrder(false);
  setEditingOrder(null);
};

  const { isInitialized } = useDatabase();
  const { tables, occupyTable, freeTable } = useTables();
  const { orders, addOrder, updateOrder, deleteOrder } = useOrders();
  const { addReservation } = useReservations();
  const { profile } = useAuth();
  const city = profile?.id

useEffect(() => {
    const initDB = async () => {
      try {
        await database.initializeDefaultData(city);
      } catch (error) {
        console.error('Failed to initialize database:', error);
       
      }
    };

    initDB();
  }, []);


    
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background pt-20 md:pt-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando sistema...</p>
        </div>
      </div>
    );
  }

  const releaseTable = (tableId: number) => freeTable(tableId);

  const handleCreateOrder = async (orderData: any) => {
    try {
      // Cria a comanda
      const newOrder = await addOrder(orderData);

      // Marca a mesa como ocupada
      if (orderData.tableId) {
        await occupyTable(orderData.tableId, orderData.items.length, newOrder.id);
      }

      setSelectedTable(null);
      setShowCreateOrder(false);
    } catch (error) {
      console.error("Falha ao criar comanda:", error);
    }
  };

  const handleCreateReservation = async (reservationData: any) => {
    try {
      const newReservation = await addReservation(reservationData);

      if (reservationData.tableId) {
        await occupyTable(reservationData.tableId, reservationData.customers, newReservation.id);
      }

      setShowCreateReservation(false);
    } catch (error) {
      console.error("Falha ao criar reserva:", error);
    }
  };

  

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-8">
      {/* Toggle View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 mb-6">
        <Button variant={view === "map" ? "default" : "outline"} onClick={() => setView("map")}>
          Mapa do Salão
        </Button>
        <Button variant={view === "orders" ? "default" : "outline"} onClick={() => setView("orders")}>
          Comandas
        </Button>
      </div>

      {view === "map" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StatsCards />

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Mapa do Salão
                </CardTitle>
                <CardDescription>
                  Clique em uma mesa para ver detalhes ou criar nova comanda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TableMap
                  tables={tables}
                  selectedTable={selectedTable}
                  onTableSelect={setSelectedTable}
                  onCreateOrder={() => setShowCreateOrder(true)}
                   onOpenOrderDialog={(tableId) => {
    // Encontrar a comanda da mesa
    const order = orders.find(o => o.tableId === tableId);
    if (order) handleEditOrder(order);
  }}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* <LiveMetrics /> */}
            <RecentOrders />
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
       
            <Card>
          <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
          <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          >
          Todas
          </Button>
          <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
          >
          Pendentes
          ({orders.filter( p => p.status == 'pending').length})
          </Button>

          <Button
          variant={statusFilter === "preparing" ? "default" : "outline"}
          onClick={() => setStatusFilter("preparing")}
          >
          Preparando
          ({orders.filter( p => p.status == 'preparing').length})
          </Button>
          <Button
          variant={statusFilter === "ready" ? "default" : "outline"}
          onClick={() => setStatusFilter("ready")}
          >
          Prontos
          ({orders.filter( p => p.status == 'ready').length})
          </Button>
          <Button
          variant={statusFilter === "served" ? "default" : "outline"}
          onClick={() => setStatusFilter("served")}
          >
          Servidas
          ({orders.filter( p => p.status == 'served').length})
          </Button>
          <Button
          variant={statusFilter === "paid" ? "default" : "outline"}
          onClick={() => setStatusFilter("paid")}
          >
          Pagos
          ({orders.filter( p => p.status == 'paid').length})
          </Button>
          
          </div>

          <div className="grid gap-4 max-h-[400px] overflow-y-auto">
          {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onUpdate={updateOrder}
            onDelete={deleteOrder}
            releaseTable={(tableId) => releaseTable(Number(tableId))}
          />
          ))}
          </div>
          </CardContent>
          </Card>


          {/* <Card>
            <CardHeader>
              <CardTitle>Filtros e Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-h-[400px] overflow-y-auto">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdate={updateOrder}
                    onDelete={deleteOrder}
                    releaseTable={(tableId) => releaseTable(Number(tableId))}
                  />
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      )}

      {/* Dialogs */}
      <CreateOrderDialog
        open={showCreateOrder}
        onOpenChange={setShowCreateOrder}
        tables={tables}
        selectedTable={tables.find((t) => t.id === selectedTable)}
        onCreateOrder={handleCreateOrder}
      />

   {editingOrder && (
  <EditOrderDialog
    open={showEditOrder}
    onOpenChange={setShowEditOrder}
    order={editingOrder}
    onUpdate={handleUpdateOrder}
  />
)}


      <CreateReservationDialog
        open={showCreateReservation}
        onOpenChange={setShowCreateReservation}
        tables={tables}
        onCreateReservation={handleCreateReservation}
      />
    </div>
  );
};
export default Dashboard;


