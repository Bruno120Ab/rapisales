import { Order } from "@/app/database";
import { Sale } from "@/lib/database";
import { Card } from "./ui/card";
import { BarChart3 } from "lucide-react";

interface ProductsSoldCardProps {
  sales: Sale[];   // Vendas do PDV
  orders: Order[]; // Pedidos das mesas
}

export const ProductsSoldCard: React.FC<ProductsSoldCardProps> = ({ sales, orders }) => {
  // Combina todos os itens vendidos
  const totalProducts = [
    ...sales.flatMap(s => s.items),
    ...orders.flatMap(o => o.items.map(i => ({
      productId: i.id,
      productName: i.name,
      quantity: i.quantity,
      total: i.price * i.quantity
    })))
  ].reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-accent/10 rounded-lg">
          <BarChart3 className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Produtos Vendidos</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
      </div>
    </Card>
  );
};
