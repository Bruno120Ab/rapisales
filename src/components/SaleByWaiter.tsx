// SalesByWaiterCard.tsx
import { Card } from "@/components/ui/card";
import { UserIcon } from "lucide-react";
import type { Sale } from "@/lib/database";
import { Order } from "@/app/database";
import { formatCurrency } from "@/lib/formatters";
import { useMemo, useState } from "react";
interface SalesByWaiterCardProps {
  sales: Sale[];   // Vendas do PDV
  orders: Order[]; // Pedidos do salão
}

export const SalesByWaiterCard = ({ sales, orders }: SalesByWaiterCardProps) => {
 const [selectedWaiter, setSelectedWaiter] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "pdv" | "mesa">("all");

  // Combina vendas e pedidos do salão com tipo
  const combinedSales = useMemo(() => [
    ...sales.map(sale => ({ waiter: sale.userId || 'Desconhecido', total: sale.total, items: sale.items, type: 'pdv' })),
    ...orders.map(order => ({ waiter: order.waiter || 'Desconhecido', total: order.total, items: order.items, type: 'mesa' }))
  ], [sales, orders]);

  // Aplica filtros
  const filteredSales = combinedSales.filter(sale => {
    if (selectedWaiter !== "all" && sale.waiter !== selectedWaiter) return false;
    if (selectedType !== "all" && sale.type !== selectedType) return false;
    return true;
  });

  // Agrupa por garçom
  const salesByWaiter = filteredSales.reduce((acc, sale) => {
    const name = sale.waiter;
    if (!acc[name]) acc[name] = { totalRevenue: 0, totalSales: 0, salesCount: 0 };
    acc[name].totalRevenue += sale.total;
    acc[name].totalSales += 1;
    acc[name].salesCount += sale.items.reduce((sum, item) => sum + item.quantity, 0);
    return acc;
  }, {} as Record<string, { totalRevenue: number; totalSales: number; salesCount: number }>);

  // Lista de garçons para o filtro
  const waitersList = Array.from(new Set(combinedSales.map(s => s.waiter)));

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Análise por Garçom</h3>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          className="border rounded px-3 py-1 text-sm"
          value={selectedWaiter}
          onChange={e => setSelectedWaiter(e.target.value)}
        >
          <option value="all">Todos os garçons</option>
          {waitersList.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-1 text-sm"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value as "all" | "pdv" | "mesa")}
        >
          <option value="all">Todos os tipos</option>
          <option value="pdv">PDV</option>
          <option value="mesa">Mesa</option>
        </select>
      </div>

      <div className="space-y-3">
        {Object.entries(salesByWaiter).map(([waiterName, data]) => (
          <div
            key={waiterName}
            className="flex items-center justify-between p-3 bg-card hover:bg-card/80 rounded-lg shadow-sm transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{waiterName}</p>
                <p className="text-sm text-muted-foreground">
                  {data.totalSales} vendas • {data.salesCount} produtos
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{formatCurrency(data.totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">
                Média: {formatCurrency(data.totalRevenue / data.totalSales)}
              </p>
            </div>
          </div>
        ))}

        {Object.keys(salesByWaiter).length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma venda no período selecionado</p>
        )}
      </div>
    </Card>
  );
};