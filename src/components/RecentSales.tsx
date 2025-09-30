import { useState, useMemo } from "react";
import { Select, SelectTrigger, SelectValue,  SelectItem } from "./ui/select";
import { formatCurrency } from "@/lib/formatters";
import { SelectContent } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface Sale {
  id: string;
  customer?: string;
  table?: string;
  waiter?: string;
  total: number;
  items: { quantity: number; name: string }[];
  paymentMethod?: "cash" | "card" | "pix";
  status?: "pending" | "preparing" | "ready" | "served" | "paid";
  createdAt?: string;
  time?: string;
}

interface RecentSalesCardProps {
  combinedSales: Sale[];
  waiters: string[]; // Lista de todos os garçons
}

export const RecentSalesCard = ({ combinedSales, waiters }: RecentSalesCardProps) => {
  const [filterWaiter, setFilterWaiter] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");

  // Filtra vendas com base nos filtros
  const filteredSales = useMemo(() => {
    return combinedSales.filter((sale) => {
      const matchWaiter = filterWaiter === "all" || sale.waiter === filterWaiter;
      const matchStatus = filterStatus === "all" || sale.status === filterStatus;
      const matchPayment = filterPayment === "all" || sale.paymentMethod === filterPayment;
      return matchWaiter && matchStatus && matchPayment;
    });
  }, [combinedSales, filterWaiter, filterStatus, filterPayment]);

  return (
    <Card className="p-6 bg-background border border-border rounded-xl shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Vendas Recentes</h3>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Garçom */}
        <Select value={filterWaiter} onValueChange={setFilterWaiter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os garçons" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os garçons</SelectItem>
            {waiters.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="preparing">Preparando</SelectItem>
            <SelectItem value="ready">Pronto</SelectItem>
            <SelectItem value="served">Servido</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
          </SelectContent>
        </Select>

        {/* Forma de pagamento */}
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os pagamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os pagamentos</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="card">Cartão</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LISTA DE VENDAS */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredSales.length > 0 ? (
          filteredSales
            .sort(
              (a, b) =>
                new Date(b.createdAt || b.time || "").getTime() -
                new Date(a.createdAt || a.time || "").getTime()
            )
            .slice(0, 10)
            .map((sale) => (
              <div
                key={sale.id}
                className="flex justify-between items-center p-4 bg-card rounded-lg shadow hover:shadow-md transition-shadow duration-200"
              >
                {/* Cliente e mesa */}
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {sale.customer || "Cliente Desconhecido"}
                  </span>
                  {sale.table && (
                    <span className="text-sm text-muted-foreground">
                      Mesa {sale.table}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground mt-1">
                    {sale.items.length} {sale.items.length === 1 ? "item" : "itens"} •
                    Garçom: {sale.waiter || "Desconhecido"}
                  </span>
                </div>

                {/* Total e forma de pagamento */}
                <div className="flex flex-col items-end space-y-1">
                  <span className="font-semibold text-foreground">
                    {formatCurrency(sale.total)}
                  </span>
                  {sale.paymentMethod && (
                    <Badge variant="outline" className="text-xs">
                      {sale.paymentMethod === "cash"
                        ? "Dinheiro"
                        : sale.paymentMethod === "card"
                        ? "Cartão"
                        : "PIX"}
                    </Badge>
                  )}
                </div>

                {/* Status */}
                {sale.status && (
                  <Badge className="capitalize px-3 py-1 text-xs">
                    {sale.status}
                  </Badge>
                )}
              </div>
            ))
        ) : (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Nenhuma venda no período selecionado
          </p>
        )}
      </div>
    </Card>
  );
};
