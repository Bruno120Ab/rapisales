import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Clock } from "lucide-react";
import { Table } from "./database";

interface TableMapProps {
  tables: Table[];
  selectedTable: number | null;
  onTableSelect: (tableId: number | null) => void;
  onCreateOrder: () => void;
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

export const TableMap = ({ tables, selectedTable, onTableSelect, onCreateOrder }: TableMapProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => {
        const config = getTableStatusConfig(table.status);
        const isSelected = selectedTable === table.id;
        
        return (
          <Card
            key={table.id}
            className={`
              cursor-pointer transition-all duration-300 hover:shadow-hover
              ${config.bgColor} ${config.borderColor} border-2
              ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''}
            `}
            onClick={() => {
              if (table.status === 'available') {
                onTableSelect(isSelected ? null : table.id);
                if (!isSelected) {
                  setTimeout(() => onCreateOrder(), 100);
                }
              } else {
                onTableSelect(isSelected ? null : table.id);
              }
            }}
          >
            <CardContent className="p-4 text-center space-y-2">
              {/* Table Number */}
              <div className={`text-2xl font-bold ${config.textColor}`}>
                Mesa {table.number}
              </div>
              
              {/* Status Badge */}
              <Badge className={config.badgeColor}>
                {config.label}
              </Badge>
              
              {/* Table Info */}
              {/* <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {table.seats} lugares
              </div> */}
              
              {/* Additional Info based on status */}
              {table.status === 'occupied' && table.customers && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  <User className="h-4 w-4 text-danger" />
                  <span className="text-danger-foreground font-medium">
                    {table.customers} pessoas
                  </span>
                </div>
              )}
              
              {table.status === 'occupied' && table.orderId && (
                <div className="text-xs text-muted-foreground">
                  Comanda: {table.orderId}
                </div>
              )}
              
              {table.status === 'reserved' && table.reservationTime && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-warning-foreground font-medium">
                    {table.reservationTime}
                  </span>
                </div>
              )}

              {/* Action Button for Available Tables */}
              {table.status === 'available' && isSelected && (
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
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