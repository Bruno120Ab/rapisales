import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, User, Phone } from "lucide-react";
import { Table } from "./database";

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: Table[];
  onCreateReservation: (reservation: {
    customerName: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    tableId?: number;
    table?: string;
    status: 'confirmed' | 'arrived' | 'cancelled' | 'completed';
    notes?: string;
  }) => void;
}

export const CreateReservationDialog = ({ 
  open, 
  onOpenChange, 
  tables,
  onCreateReservation 
}: CreateReservationDialogProps) => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState<number>(2);
  const [selectedTableId, setSelectedTableId] = useState<number | undefined>();
  const [notes, setNotes] = useState("");

  const availableTables = tables.filter(t => t.status === 'available');

  const handleSubmit = () => {
    if (!customerName.trim() || !phone.trim() || !date || !time || guests <= 0) {
      return;
    }

    const selectedTable = selectedTableId ? tables.find(t => t.id === selectedTableId) : undefined;

    onCreateReservation({
      customerName: customerName.trim(),
      phone: phone.trim(),
      date,
      time,
      guests,
      tableId: selectedTableId,
      table: selectedTable ? `Mesa ${selectedTable.number}` : undefined,
      status: 'confirmed',
      notes: notes.trim() || undefined,
    });

    // Reset form
    setCustomerName("");
    setPhone("");
    setDate("");
    setTime("");
    setGuests(2);
    setSelectedTableId(undefined);
    setNotes("");
    onOpenChange(false);
  };

  // Generate time options
  const timeOptions = [];
  for (let hour = 11; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-secondary" />
            Nova Reserva
          </DialogTitle>
          <DialogDescription>
            Crie uma nova reserva preenchendo os dados do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome do Cliente *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Digite o nome completo"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Número de Pessoas *</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="guests"
                type="number"
                min="1"
                max="12"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                className="pl-10"
              />
            </div>
          </div>

          {/* {suitableTables.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="table">Mesa (Opcional)</Label>
              <Select 
                value={selectedTableId?.toString() || ""} 
                onValueChange={(value) => setSelectedTableId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Deixar em aberto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem mesa específica</SelectItem>
                 
                </SelectContent>
              </Select>
            </div>
          )} */}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Preferências especiais, aniversário, etc..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!customerName.trim() || !phone.trim() || !date || !time || guests <= 0}
            className="bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary hover:to-secondary"
          >
            Criar Reserva
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};