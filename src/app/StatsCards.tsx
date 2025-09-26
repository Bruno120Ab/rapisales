import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useOrders, useTables } from "./useDatabase";

export const StatsCards = () => {
  const { tables } = useTables();
  const { orders } = useOrders();

  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const totalTables = tables.length;
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length;
  const todayRevenue = orders
    .filter(o => o.date === new Date().toISOString().split('T')[0])
    .reduce((sum, order) => sum + order.total, 0);

  const STATS = [
    {
      title: "Mesas Ocupadas",
      value: occupiedTables.toString(),
      total: totalTables.toString(),
      icon: "Users",
      trend: { value: `${occupiedTables}/${totalTables}`, isPositive: occupiedTables > 0 },
      bgGradient: "bg-gradient-to-br from-primary/10 to-primary-light/10",
      iconColor: "text-primary"
    },
    {
      title: "Comandas Ativas",
      value: activeOrders.toString(),
      total: null,
      icon: "CheckCircle",
      trend: { value: `+${activeOrders}`, isPositive: activeOrders > 0 },
      bgGradient: "bg-gradient-to-br from-secondary/10 to-secondary-light/10",
      iconColor: "text-secondary"
    },
    {
      title: "Taxa Ocupação",
      value: `${Math.round((occupiedTables / totalTables) * 100)}%`,
      total: null,
      icon: "Clock",
      trend: { value: `${occupiedTables}/${totalTables}`, isPositive: occupiedTables > totalTables * 0.5 },
      bgGradient: "bg-gradient-to-br from-warning/10 to-warning/20",
      iconColor: "text-warning"
    },
    {
      title: "Faturamento Hoje",
      value: `R$ ${todayRevenue.toFixed(2)}`,
      total: null,
      icon: "DollarSign",
      trend: { value: `${orders.filter(o => o.date === new Date().toISOString().split('T')[0]).length} pedidos`, isPositive: todayRevenue > 0 },
      bgGradient: "bg-gradient-to-br from-success/10 to-success/20",
      iconColor: "text-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((stat, index) => (
        <Card key={index} className={`${stat.bgGradient} border-0 shadow-card hover:shadow-hover transition-all duration-300`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                  {stat.total && (
                    <span className="text-lg text-muted-foreground font-normal">
                      /{stat.total}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={`
                      text-xs border-0 
                      ${stat.trend.isPositive 
                        ? 'bg-success/20 text-success-foreground' 
                        : 'bg-muted/20 text-muted-foreground'
                      }
                    `}
                  >
                    {stat.trend.isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stat.trend.value}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};