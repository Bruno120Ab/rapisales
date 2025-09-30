import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Clock, Plus } from "lucide-react";
import { Table } from "./database";

interface TableMapProps {
  tables: Table[];
  selectedTable: number | null;
  onTableSelect: (tableId: number | null) => void;
  onCreateOrder: () => void;
    onOpenOrderDialog: (tableId: number) => void; // ← Adicione esta prop

}

const getTableStatusConfig = (status: Table['status']) => {
  switch (status) {
    case 'available':
      return {
        bgColor: 'bg-success/10 hover:bg-success/20',
        borderColor: 'border-success',
        textColor: 'text-success-foreground',
        badgeVariant: 'default' as const,
        badgeColor: 'bg-success text-success-foreground',
        label: 'Livre'
      };
    case 'occupied':
      return {
        bgColor: 'bg-danger/10 hover:bg-danger/20',
        borderColor: 'border-danger',
        textColor: 'text-danger-foreground',
        badgeVariant: 'destructive' as const,
        badgeColor: 'bg-danger text-danger-foreground',
        label: 'Ocupada'
      };
    case 'reserved':
      return {
        bgColor: 'bg-warning/10 hover:bg-warning/20',
        borderColor: 'border-warning',
        textColor: 'text-warning-foreground',
        badgeVariant: 'secondary' as const,
        badgeColor: 'bg-warning text-warning-foreground',
        label: 'Reservada'
      };
    case 'cleaning':
      return {
        bgColor: 'bg-muted hover:bg-muted/80',
        borderColor: 'border-muted-foreground',
        textColor: 'text-muted-foreground',
        badgeVariant: 'outline' as const,
        badgeColor: 'bg-muted text-muted-foreground',
        label: 'Limpeza'
      };
  }
};

export const TableMap = ({
  tables,
  selectedTable,
  onTableSelect,
  onCreateOrder,
  onOpenOrderDialog,
}: TableMapProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => {
        const config = getTableStatusConfig(table.status);
        const isSelected = selectedTable === table.id;

        // Definindo cores suaves para fundo baseado no status
        let bgClass = "bg-white";
        let textClass = "text-gray-900";
        let borderClass = "border-gray-300";
        let badgeClass = "bg-gray-200 text-gray-800";

        if (table.status === "available") {
          bgClass = "bg-blue-50"; // azul suave
          textClass = "text-blue-700";
          borderClass = "border-blue-300";
          badgeClass = "bg-blue-100 text-blue-700";
        } else if (table.status === "occupied") {
          bgClass = "bg-red-50";
          textClass = "text-red-700";
          borderClass = "border-red-300";
          badgeClass = "bg-red-100 text-red-700";
        } else if (table.status === "reserved") {
          bgClass = "bg-yellow-50";
          textClass = "text-yellow-700";
          borderClass = "border-yellow-300";
          badgeClass = "bg-yellow-100 text-yellow-700";
        }

        return (
          <Card
            key={table.id}
            className={`
              cursor-pointer transition-all duration-300 
              rounded-xl shadow-sm hover:shadow-md
              border-2 ${borderClass} ${bgClass}
              ${isSelected ? 'ring-2 ring-blue-600 ring-offset-2 scale-105' : ''}
            `}
            onClick={() => {
              onTableSelect(isSelected ? null : table.id);
              if (table.status === 'available' && !isSelected) {
                setTimeout(() => onCreateOrder(), 150);
              }
            }}
          >
            <CardContent className="p-4 text-center space-y-2">
              {/* Número da mesa */}
              <div className={`text-2xl font-bold ${textClass}`}>
                Mesa {table.number}
              </div>

              {/* Status Badge */}
              <Badge className={`px-2 py-1 rounded-full text-sm ${badgeClass}`}>
                {config.label}
              </Badge>

              {/* Clientes presentes */}
              {table.status === 'occupied' && table.customers && (
                <div className="flex flex-col items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    {/* <User className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-700">
                      {table.customers} pessoas
                    </span> */}
                  </div>

                  {/* Botão de adicionar produtos */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenOrderDialog(table.id);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              

              {/* Comanda ativa */}
              {table.status === 'occupied' && table.orderId && (
                <div className="text-xs text-muted-foreground mt-1">
                  Comanda: {table.orderId}
                </div>
                
              )}

              {/* Reserva */}
              {table.status === 'reserved' && table.reservationTime && (
                <div className="flex items-center justify-center gap-1 text-sm mt-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-700">
                    {table.reservationTime}
                  </span>
                </div>
              )}

              {/* Botão Criar Comanda */}
              {table.status === 'available' && isSelected && (
                <div className="mt-2">
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateOrder();
                    }}
                  >
                    Criar Comanda
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// export const TableMap = ({ tables, selectedTable, onTableSelect, onCreateOrder, onOpenOrderDialog }: TableMapProps) => {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//       {tables.map((table) => {
//         const config = getTableStatusConfig(table.status);
//         const isSelected = selectedTable === table.id;
        
//         return (
//           <Card
//             key={table.id}
//             className={`
//               cursor-pointer transition-all duration-300 hover:shadow-hover
//               ${config.bgColor} ${config.borderColor} border-2
//               ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''}
//             `}
//             onClick={() => {
//               if (table.status === 'available') {
//                 onTableSelect(isSelected ? null : table.id);
//                 if (!isSelected) {
//                   setTimeout(() => onCreateOrder(), 100);
//                 }
//               } else {
//                 onTableSelect(isSelected ? null : table.id);
//               }
//             }}
//           >
//             <CardContent className="p-4 text-center space-y-2">
//               {/* Table Number */}
//               <div className={`text-2xl font-bold ${config.textColor}`}>
//                 Mesa {table.number}
//               </div>
              
//               {/* Status Badge */}
//               <Badge className={config.badgeColor}>
//                 {config.label}
//               </Badge>
              
//               {/* Table Info */}
//               {/* <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
//                 <Users className="h-4 w-4" />
//                 {table.seats} lugares
//               </div> */}
              
//               {/* Additional Info based on status */}
//               {table.status === 'occupied' && table.customers && (
//   <div className="flex flex-col items-center justify-center gap-1 text-sm">
//     <div className="flex items-center gap-1">
//       <User className="h-4 w-4 text-danger" />
//       <span className="text-danger-foreground font-medium">
//         {table.customers} pessoas
//       </span>
//     </div>

//     {/* Botão para adicionar mais produtos */}
//  <Button
//   size="sm"
//   variant="ghost" // deixa o botão mais leve
//   className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
//   onClick={(e) => {
//     e.stopPropagation(); // evita disparar clique do card
//     onOpenOrderDialog(table.id);
//   }}
// >
//   <Plus className="w-4 h-4" />
// </Button>

//   </div>
// )}
              
//               {table.status === 'occupied' && table.orderId && (
//                 <div className="text-xs text-muted-foreground">
//                   Comanda: {table.orderId}
//                 </div>
//               )}
              
//               {table.status === 'reserved' && table.reservationTime && (
//                 <div className="flex items-center justify-center gap-1 text-sm">
//                   <Clock className="h-4 w-4 text-warning" />
//                   <span className="text-warning-foreground font-medium">
//                     {table.reservationTime}
//                   </span>
//                 </div>
//               )}

//               {/* Action Button for Available Tables */}
//               {table.status === 'available' && isSelected && (
//                 <div className="mt-2">
//                   <Button 
//                     size="sm" 
//                     className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onCreateOrder();
//                     }}
//                   >
//                     Criar Comanda
//                   </Button>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// };