import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MenuItem, Order } from "./database";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "recharts";
import { Input } from "@/components/ui/input";

export const EditOrderDialog = ({
  open,
  onOpenChange,
  order,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onUpdate: (order: Order) => void;
}) => {
const [customer, setCustomer] = useState(order?.customer ?? "");
const [waiter, setWaiter] = useState(order?.waiter ?? "");
const [notes, setNotes] = useState(order?.notes ?? "");
const [selectedItems, setSelectedItems] = useState(order?.items ?? []);


  const addItem = (item: MenuItem) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedItems(selectedItems.filter(i => i.id !== itemId));
    } else {
      setSelectedItems(selectedItems.map(i =>
        i.id === itemId ? { ...i, quantity: qty } : i
      ));
    }
  };

  const total = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSave = () => {
    onUpdate({
      ...order,
      customer,
      waiter,
      notes,
      items: selectedItems,
      total,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pedido {order.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados principais */}
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} />
            </div>
            <div>
              <Label>Garçom</Label>
              <Input value={waiter} onChange={(e) => setWaiter(e.target.value)} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {selectedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Itens do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        {item.name} — R$ {item.price.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                        <span>{item.quantity}</span>
                        <Button size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cardápio */}
          <div className="space-y-4">
            <h3 className="font-semibold">Adicionar itens</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* {products.map((product) => (
                <Card
                  key={product.id}
                  className="flex items-center justify-between p-3 hover:bg-accent/50 cursor-pointer"
                  onClick={() => addItem(product)}
                >
                  <span>{product.name}</span>
                  <span className="text-success font-bold">R$ {product.price.toFixed(2)}</span>
                </Card>
              ))} */}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
