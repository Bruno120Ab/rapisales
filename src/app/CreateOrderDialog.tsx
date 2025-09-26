import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, ShoppingCart, User, Users } from "lucide-react";
import { MenuItem, Table } from "./database";
import { useMenuItems } from "./useDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: Table[];
  selectedTable?: Table;
  onCreateOrder: (order: {
    tableId: number;
    table: string;
    customer: string;
    items: MenuItem[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
    waiter: string;
    notes?: string;
  }) => void;
}

export const CreateOrderDialog = ({ 
  open, 
  onOpenChange, 
  tables, 
  selectedTable,
  onCreateOrder 
}: CreateOrderDialogProps) => {
  const [customer, setCustomer] = useState("");
  const [waiter, setWaiter] = useState("Maria");
  const [notes, setNotes] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<number>(selectedTable?.id || 0);
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const { menuItems } = useMenuItems();
  const [products, setProducts] = useState<any[]>([]);
  const { user, profile, isLoading } = useAuth();
  const city = profile?.id

  // Group menu items by category
  const menuCategories = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  useEffect(() => {
    if (selectedTable) {
      setSelectedTableId(selectedTable.id);
    }
  }, [selectedTable]);

    useEffect(() => {
    // Se houver profile, busca por cidade; senão busca todos

      if (city) {
        // loadProducts();
        fetchProducts(city)
        // fetchProductsByCity(city);
      } else {
        fetchAllProducts();
      }
  }, [profile])
  const availableTables = tables.filter(t => t.status === 'available');

  const addItem = (item: MenuItem) => {
    const existingItem = selectedItems.find(i => i.id === item.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setSelectedItems(selectedItems.map(i => 
      i.id === itemId 
        ? { ...i, quantity }
        : i
    ));
  };

  const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = () => {
    if (!customer.trim() || selectedItems.length === 0 || selectedTableId === 0) {
      return;
    }

    const selectedTableData = tables.find(t => t.id === selectedTableId);
    if (!selectedTableData) return;

    onCreateOrder({
      tableId: selectedTableId,
      table: `Mesa ${selectedTableData.number}`,
      customer: customer.trim(),
      items: selectedItems,
      total,
      status: 'pending',
      waiter,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setCustomer("");
    setNotes("");
    setSelectedItems([]);
    setSelectedTableId(selectedTable?.id || 0);
    onOpenChange(false);
  };

  const fetchProducts = async (ownerId: string) => {
    try {
      // 1️⃣ Buscar o restaurante do dono
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();
  
      if (restaurantError) throw restaurantError;
  
      if (!restaurant) {
        console.warn('Nenhum restaurante encontrado para este dono.');
        setProducts([]);
        return;
      }
  
      const restaurantId = restaurant.id;
  
      // 2️⃣ Buscar produtos do restaurante
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });
  
      if (productsError) throw productsError;
  
      setProducts(productsData || []);
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err.message);
      setProducts([]);
    }
  };

   const fetchAllProducts = async () => {
      try {
        // setIsLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select(`
            id,
            name,
            description,
            price,
            image_url,
            restaurant:restaurants!inner(id, name, delivery_fee, city, status, is_open)
          `)
          .eq("restaurant.is_open", true)
          .limit(12);
  
        if (error) throw error;
  
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching all products:", error);
      } finally {
        // setIsLoading(false);
      }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Nova Comanda
          </DialogTitle>
          <DialogDescription>
            Crie uma nova comanda selecionando mesa, cliente e itens do cardápio
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table">Mesa</Label>
              <Select value={selectedTableId.toString()} onValueChange={(value) => setSelectedTableId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma mesa" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Mesa {table.number} 
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer">Nome do Cliente</Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Digite o nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waiter">Garçom</Label>
              <Select value={waiter} onValueChange={setWaiter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maria">Maria</SelectItem>
                  <SelectItem value="Carlos">Carlos</SelectItem>
                  <SelectItem value="Ana">Ana</SelectItem>
                  <SelectItem value="João">João</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações especiais (opcional)"
                rows={3}
              />
            </div>

            {/* Selected Items Summary */}
            {selectedItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Itens Selecionados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-accent/50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          R$ {item.price.toFixed(2)} × {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-lg">R$ {total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            <h3 className="font-semibold">Cardápio</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
  {products.map((product) => {
    const isAvailable = product.available;

    return (
      <div key={product.id} className="relative">
        <Card
          className={cn(
            "flex items-center gap-3 p-3 transition-all rounded-lg",
            !isAvailable
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-accent/50"
          )}
          onClick={() => isAvailable && addItem(product)}
        >
          {/* Imagem à esquerda */}
          <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs">Sem imagem</span>
            )}
          </div>

          {/* Nome e preço */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="font-medium">{product.name}</span>
            <span className="text-sm text-success font-bold">
              R$ {product.price.toFixed(2)}
            </span>
          </div>

          {/* Botão adicionar */}
          {isAvailable && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </Card>

        {/* Overlay de Fora de Estoque */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg pointer-events-none">
            <span className="text-white font-bold text-sm">Fora de estoque</span>
          </div>
        )}
      </div>
    );
  })}
</div>

          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!customer.trim() || selectedItems.length === 0 || selectedTableId === 0}
            className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary"
          >
            Criar Comanda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};