import { ShoppingCart } from "lucide-react";
import { Card } from "./ui/card";
import { Sale } from "@/lib/database";
import { Order } from "@/app/database";

interface TotalSalesCardProps {
  sales: Sale[]; // vendas do PDV
  orders: Order[]; // pedidos das mesas
}

export const TotalSalesCard: React.FC<TotalSalesCardProps> = ({ sales, orders }) => {
  // Total de vendas = PDV + mesas
  const totalSales = sales.length + orders.length;

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total de Vendas</p>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>
      </div>
    </Card>
  );
};
