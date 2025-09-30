import { Order } from "@/app/database";
import { Sale } from "@/lib/database";
import { formatCurrency } from "@/lib/formatters";
import { DollarSign } from "lucide-react";
import { Card } from "./ui/card";

interface TotalRevenueCardProps {
  sales: Sale[];
  orders: Order[];
}

export const TotalRevenueCard: React.FC<TotalRevenueCardProps> = ({ sales, orders }) => {
  const totalRevenue = [
    ...sales,
    ...orders
  ].reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-success/10 rounded-lg">
          <DollarSign className="h-6 w-6 text-success" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Receita Total</p>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>
    </Card>
  );
};