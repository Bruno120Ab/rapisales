import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Users } from "lucide-react";
import { useOrders } from "./useDatabase";

interface Order {
  id: string;
  table: string;
  items: number;
  total: string;
  time: string;
  status: 'preparing' | 'ready' | 'served';
}

export const RecentOrders = () => {
  const { orders } = useOrders();
  
  const recentOrders = orders
    .filter(order => order.status === 'preparing' || order.status === 'ready')
    .slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Comandas Recentes
        </CardTitle>
        <CardDescription>
          Últimos pedidos em andamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentOrders.map((order) => {
          const getStatusConfig = (status: string) => {
            switch (status) {
              case 'preparing':
                return {
                  label: 'Preparando',
                  className: 'bg-warning/20 text-warning-foreground border-warning/30',
                  dotColor: 'bg-warning'
                };
              case 'ready':
                return {
                  label: 'Pronto',
                  className: 'bg-success/20 text-success-foreground border-success/30',
                  dotColor: 'bg-success'
                };
              default:
                return {
                  label: 'Pendente',
                  className: 'bg-muted text-muted-foreground border-muted',
                  dotColor: 'bg-muted-foreground'
                };
            }
          };
          
          const statusConfig = getStatusConfig(order.status);
          
          return (
            <div 
              key={order.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{order.id}</span>
                  <Badge className={statusConfig.className}>
                    <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} mr-1`} />
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {order.table}
                  </span>
                  <span>{order.items.length} itens</span>
                  <span className="font-medium text-foreground">R$ {order.total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 hover:bg-primary/5 hover:border-primary hover:text-primary"
        >
          Ver Todas as Comandas
        </Button>
      </CardContent>
    </Card>
  );
};