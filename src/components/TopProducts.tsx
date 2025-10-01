import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { formatCurrency } from "@/lib/formatters";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface Sale {
  items: MenuItem[];
}

interface Order {
  items: MenuItem[];
}

interface TopProductsCardProps {
  sales: Sale[];
  orders: Order[];
}

export const TopProductsCard: React.FC<TopProductsCardProps> = ({ sales, orders }) => {
  // 1️⃣ Combina itens do PDV e mesas
  const allItems = [
    ...sales.flatMap(sale => sale.items),
    ...orders.flatMap(order => order.items)
  ];

  // 2️⃣ Agrupa por produto
  const topProducts = allItems.reduce((acc, item) => {
    const existing = acc.find(p => p.productName === item.name);
    if (existing) {
      existing.quantity += item.quantity;
      existing.revenue += item.price * item.quantity;
    } else {
      acc.push({
        productName: item.name,
        quantity: item.quantity,
        revenue: item.price * item.quantity
      });
    }
    return acc;
  }, [] as Array<{ productName: string; quantity: number; revenue: number }>);

  // 3️⃣ Ordena pelos mais vendidos e pega top 10
  topProducts.sort((a, b) => b.quantity - a.quantity);
  const top10 = topProducts.slice(0, 10);

  return (
  <Card className="p-4">
  <h3 className="text-lg font-semibold mb-3">Produtos Mais Vendidos</h3>

  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
    {top10.length > 0 ? (
      top10.map((product, index) => (
        <div
          key={product.productName}
          className="flex items-center justify-between p-3 bg-card rounded-lg border border-border transition-all duration-150"
        >
          {/* Ranking + Nome */}
          <div className="flex items-center space-x-3 min-w-0">
            <Badge variant="outline" className="min-w-[28px] text-center">{index + 1}º</Badge>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{product.productName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {product.quantity} unidades vendidas
              </p>
            </div>
          </div>

          {/* Receita */}
          <div className="text-right min-w-[70px]">
            <p className="font-semibold text-blue-600 text-sm">{formatCurrency(product.revenue)}</p>
          </div>
        </div>
      ))
    ) : (
      <p className="text-center text-muted-foreground py-6 text-sm">
        Nenhuma venda no período selecionado
      </p>
    )}
  </div>
</Card>

  );
};
