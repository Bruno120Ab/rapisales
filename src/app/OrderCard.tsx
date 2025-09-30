// import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, User, DollarSign, Eye, Edit, Trash2 } from "lucide-react";
import { Order } from "./database";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { printThermalOrderForDelivery } from "@/components/PrintOrder";

// Componente para exibir itens do pedido em dropdown

// Tipagem dos itens do pedido
export interface MenuItem {
  id: string;
  name: string;
  quantity: number;
}

// Dropdown de itens do pedido
export const OrderItemsMenu = ({ items }: { items: MenuItem[] }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button className="px-3 py-1 border rounded">Itens ({items.length})</button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content className="bg-white border rounded shadow-lg p-2">
      {items.map(item => (
        <DropdownMenu.Item
          key={item.id}
          className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
        >
          {item.name} x{item.quantity}
        </DropdownMenu.Item>
      ))}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
);

interface OrderCardProps {
  order: Order & { items: MenuItem[] }; // garante que items é array de MenuItem
  onUpdate?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
  releaseTable?: (tableId: string) => void;
}

// Configuração visual por status
const statusMap: Record<Order["status"], { label: string; className: string; dotColor: string }> = {
  pending: { label: "Pendente", className: "bg-muted text-muted-foreground border-muted", dotColor: "bg-muted-foreground" },
  preparing: { label: "Preparando", className: "bg-warning/20 text-warning-foreground border-warning/30", dotColor: "bg-warning" },
  ready: { label: "Pronto", className: "bg-success/20 text-success-foreground border-success/30", dotColor: "bg-success" },
  served: { label: "Servido", className: "bg-primary/20 text-primary-foreground border-primary/30", dotColor: "bg-primary" },
  paid: { label: "Pago", className: "bg-secondary/20 text-secondary-foreground border-secondary/30", dotColor: "bg-secondary" },
};



// export const OrderCard = ({ order, onUpdate, onDelete, releaseTable }: OrderCardProps) => {
//   const [showDetails, setShowDetails] = useState(false);
//   const [showCloseModal, setShowCloseModal] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pix">("cash");

//   const statusConfig = statusMap[order.status];

//   const handleChangeStatus = (status: Order["status"]) => onUpdate?.({ ...order, status });

//   const handleCloseOrder = () => {
//     if (order.status !== "served") return;
//     onUpdate?.({ ...order, status: "paid" });

//     // releaseTable espera string
//     releaseTable?.(order.tableId.toString());

//     setShowCloseModal(false);
//   };


//   const handleDelete = () => onDelete?.(order.id);

//   return (
//     <>
//       <Card className="shadow-card hover:shadow-hover transition-all duration-300">
//         <CardContent className="p-6">
//           <div className="flex flex-col sm:flex-row justify-between gap-4">
//             {/* Informações principais */}
//             <div className="flex-1 space-y-3">
//               <div className="flex items-center gap-4">
//                 <h3 className="text-xl font-bold text-foreground">{order.id}</h3>
//                 <Badge className={statusConfig.className}>
//                   <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} mr-2`} />
//                   {statusConfig.label}
//                 </Badge>
//                 <span className="text-sm text-muted-foreground">às {order.time}</span>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
//                 <div className="flex items-center gap-2">
//                   <Users className="h-4 w-4 text-primary" />
//                   <span className="font-medium">{order.table}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <User className="h-4 w-4 text-secondary" />
//                   <span>{order.customer}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock className="h-4 w-4 text-warning" />
//                   <OrderItemsMenu items={order.items} />
//                   <span className="text-muted-foreground">• {order.waiter}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <DollarSign className="h-4 w-4 text-success" />
//                   <span className="font-bold text-lg">R$ {order.total.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Ações */}
//             <div className="flex items-center gap-2 ml-0 sm:ml-6">
//               <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
//                 <Eye className="h-4 w-4" />
//               </Button>
//               <Button
//                   size="sm"
//                   variant="outline"
//                   className="flex-1 sm:flex-none"
//                   onClick={() => printThermalOrderForDelivery(order)}
//                 >
//                   🖨️ Imprimir pedido
//                 </Button>
//               {/* <Button variant="outline" size="sm" onClick={() => onUpdate?.(order)}>
//                 <Edit className="h-4 w-4" />
//               </Button> */}
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setShowCloseModal(true)}
//                 disabled={order.status !== "served"}
//                 title={order.status !== "served" ? "Só pode fechar se estiver servido" : ""}
//               >
//                 Fechar
//               </Button>
//               <Button variant="outline" size="sm" onClick={handleDelete}>
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>

//           {/* Status rápido */}
//           {order.status === "paid" ?
//           (
//               <></>
//           ):
//           (
//              <div className="mt-4 flex gap-2">
//             {(["pending", "preparing", "ready", "served"] as Order["status"][]).map(s => (
//               <Button
//                 key={s}
//                 variant={order.status === s ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => handleChangeStatus(s)}
//               >
//                 {statusMap[s].label}
//               </Button>
//             ))}
//           </div>

//           )}
        
//         </CardContent>
//       </Card>

//       {/* Modal de detalhes */}
//       {showDetails && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-background p-6 rounded-lg max-w-md w-full relative">
//             <h3 className="text-lg font-bold mb-4">{order.id} - Detalhes</h3>
//             <p><strong>Mesa:</strong> {order.table}</p>
//             <p><strong>Cliente:</strong> {order.customer}</p>
//             <OrderItemsMenu items={order.items} />
//             <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
//             <p><strong>Status:</strong> {statusConfig.label}</p>
//             <p><strong>Garçom:</strong> {order.waiter}</p>
//             <Button className="mt-4" onClick={() => setShowDetails(false)}>Fechar</Button>
//           </div>
//         </div>
//       )}

//       {/* Modal de fechamento */}
//       {showCloseModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-background p-6 rounded-lg max-w-md w-full relative">
//             <h3 className="text-lg font-bold mb-4">Fechar comanda {order.id}</h3>
//             <p className="mb-4">Total: <strong>R$ {order.total.toFixed(2)}</strong></p>

//             <div className="mb-4">
//               <label className="block mb-2 font-medium">Forma de pagamento:</label>
//               <select
//                 value={paymentMethod}
//                 onChange={e => setPaymentMethod(e.target.value as "cash" | "card" | "pix")}
//                 className="border rounded px-3 py-2 w-full"
//               >
//                 <option value="cash">Dinheiro</option>
//                 <option value="card">Cartão</option>
//                 <option value="pix">PIX</option>
//               </select>
//             </div>

//             <div className="flex gap-2 justify-end">
//               <Button variant="outline" onClick={() => setShowCloseModal(false)}>Cancelar</Button>
//               <Button
//                 variant="default"
//                 onClick={handleCloseOrder}
//                 disabled={order.status !== "served"}
//                 title={order.status !== "served" ? "Só pode confirmar pagamento se estiver servido" : ""}
//               >
//                 Confirmar pagamento
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };


export const OrderCard = ({
  order,
  onUpdate,
  onDelete,
  releaseTable,
}: OrderCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "pix">(
    "cash"
  );

  const statusConfig = statusMap[order.status];

  const handleChangeStatus = (status: Order["status"]) =>
    onUpdate?.({ ...order, status });

  // const handleCloseOrder = () => {
  //   if (order.status !== "served") return;

  //   onUpdate?.({ ...order, status: "paid" });
  //   releaseTable?.(order.tableId.toString());
  //   setShowCloseModal(false);
  // };
  const handleCloseOrder = () => {
    if (order.status !== "served") return;

    onUpdate?.({ ...order, status: "paid", paymentMethod });
    releaseTable?.(order.tableId.toString());
    setShowCloseModal(false);
  };
  const handleDelete = () => onDelete?.(order.id);

  return (
    <>
      {/* CARD PRINCIPAL */}
      <Card className="shadow-card hover:shadow-hover transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Informações principais */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-foreground">{order.id}</h3>
                <Badge className={statusConfig.className}>
                  <div
                    className={`w-2 h-2 rounded-full ${statusConfig.dotColor} mr-2`}
                  />
                  {statusConfig.label}
                </Badge>
                <span className="text-sm text-muted-foreground">às {order.time}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{order.table}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-secondary" />
                  <span>{order.customer}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <OrderItemsMenu items={order.items} />
                  <span className="text-muted-foreground">• {order.waiter}</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span className="font-bold text-lg">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 ml-0 sm:ml-6">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                <Eye className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => printThermalOrderForDelivery(order)}
              >
                🖨️ Imprimir pedido
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseModal(true)}
                disabled={order.status !== "served"}
                title={order.status !== "served" ? "Só pode fechar se estiver servido" : ""}
              >
                Fechar
              </Button>

              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status rápido */}
          {order.status !== "paid" && (
            <div className="mt-4 flex gap-2">
              {(["pending", "preparing", "ready", "served"] as Order["status"][]).map(
                (s) => (
                  <Button
                    key={s}
                    variant={order.status === s ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChangeStatus(s)}
                  >
                    {statusMap[s].label}
                  </Button>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE DETALHES */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full relative">
            <h3 className="text-lg font-bold mb-4">{order.id} - Detalhes</h3>
            <p>
              <strong>Mesa:</strong> {order.table}
            </p>
            <p>
              <strong>Cliente:</strong> {order.customer}
            </p>
            <OrderItemsMenu items={order.items} />
            <p>
              <strong>Total:</strong> R$ {order.total.toFixed(2)}
            </p>
            <p>
              <strong>Status:</strong> {statusConfig.label}
            </p>
            <p>
              <strong>Garçom:</strong> {order.waiter}
            </p>
            <Button className="mt-4" onClick={() => setShowDetails(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* MODAL DE FECHAMENTO */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full relative">
            <h3 className="text-lg font-bold mb-4">Fechar comanda {order.id}</h3>
            <p className="mb-4">
              Total: <strong>R$ {order.total.toFixed(2)}</strong>
            </p>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Forma de pagamento:</label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as "cash" | "card" | "pix")
                }
                className="border rounded px-3 py-2 w-full"
              >
                <option value="cash">Dinheiro</option>
                <option value="card">Cartão</option>
                <option value="pix">PIX</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCloseModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={handleCloseOrder}
                disabled={order.status !== "served"}
                title={
                  order.status !== "served"
                    ? "Só pode confirmar pagamento se estiver servido"
                    : ""
                }
              >
                Confirmar pagamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
