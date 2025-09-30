import { Order } from "@/app/database";
import { Sale } from "@/lib/database";
import { Card } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface AverageTicketCardProps {
  sales: Sale[];
  orders: Order[];
}

export const AverageTicketCard: React.FC<AverageTicketCardProps> = ({ sales, orders }) => {
  const allOrders = [...sales, ...orders];

  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicket = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-info/10 rounded-lg">
          <TrendingUp className="h-6 w-6 text-info" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Ticket Médio</p>
          <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
        </div>
      </div>
    </Card>
  );
};
