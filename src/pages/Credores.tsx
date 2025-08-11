import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { db, Creditor, Customer } from '@/lib/database';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { 
  Users, 
  Plus, 
  Search, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Credores = () => {
  const [creditors, setCreditors] = useState<Creditor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCreditor, setEditingCreditor] = useState<Creditor | null>(null);
  
  // Form fields
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [totalDebt, setTotalDebt] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    loadCreditors();
    loadCustomers();
  }, []);

  const loadCreditors = async () => {
    try {
      const allCreditors = await db.creditors.orderBy('dueDate').toArray();
      
      // Atualizar status baseado na data
      const updatedCreditors = allCreditors.map(creditor => {
        const today = new Date();
        const due = new Date(creditor.dueDate);
        
        if (creditor.status === 'pendente' && due < today) {
          return { ...creditor, status: 'atrasado' as const };
        }
        return creditor;
      });

      setCreditors(updatedCreditors);
    } catch (error) {
      console.error('Erro ao carregar credores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os credores.",
        variant: "destructive",
      });
    }
  };

  const loadCustomers = async () => {
    try {
      const allCustomers = await db.customers.toArray();
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const filteredCreditors = creditors.filter(creditor => {
    const matchesSearch = creditor.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditor.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || creditor.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4" />;
      case 'atrasado':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'atrasado':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setTotalDebt('');
    setDescription('');
    setDueDate('');
    setEditingCreditor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || !totalDebt || !dueDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const customer = customers.find(c => c.id === Number(selectedCustomer));
      if (!customer) return;

      const debtValue = parseFloat(totalDebt);
      
      const creditorData = {
        customerId: customer.id!,
        customerName: customer.name,
        totalDebt: debtValue,
        paidAmount: 0,
        remainingAmount: debtValue,
        dueDate: new Date(dueDate),
        description: description || 'Crediário',
        status: 'pendente' as const,
        updatedAt: new Date()
      };

      if (editingCreditor) {
        await db.creditors.update(editingCreditor.id!, {
          ...creditorData,
          paidAmount: editingCreditor.paidAmount,
          remainingAmount: debtValue - editingCreditor.paidAmount
        });
        
        toast({
          title: "Credor atualizado!",
          description: "As informações foram atualizadas com sucesso.",
        });
      } else {
        await db.creditors.add({
          ...creditorData,
          createdAt: new Date()
        });
        
        toast({
          title: "Credor adicionado!",
          description: `${customer.name} foi adicionado à agenda de credores.`,
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCreditors();
    } catch (error) {
      console.error('Erro ao salvar credor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o credor.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (creditor: Creditor) => {
    setEditingCreditor(creditor);
    setSelectedCustomer(creditor.customerId.toString());
    setTotalDebt(creditor.totalDebt.toString());
    setDescription(creditor.description);
    setDueDate(new Date(creditor.dueDate).toISOString().split('T')[0]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (creditorId: number) => {
    if (!confirm('Tem certeza que deseja excluir este credor?')) return;
    
    try {
      await db.creditors.delete(creditorId);
      toast({
        title: "Credor removido!",
        description: "O credor foi removido da agenda.",
      });
      loadCreditors();
    } catch (error) {
      console.error('Erro ao excluir credor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o credor.",
        variant: "destructive",
      });
    }
  };

  const markAsPaid = async (creditor: Creditor) => {
    try {
      await db.creditors.update(creditor.id!, {
        status: 'pago',
        paidAmount: creditor.totalDebt,
        remainingAmount: 0,
        updatedAt: new Date()
      });
      
      toast({
        title: "Pagamento registrado!",
        description: `${creditor.customerName} quitou a dívida.`,
      });
      
      loadCreditors();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o pagamento.",
        variant: "destructive",
      });
    }
  };

  const totalPendingDebt = creditors
    .filter(c => c.status !== 'pago')
    .reduce((sum, c) => sum + c.remainingAmount, 0);

  const overdueCount = creditors.filter(c => c.status === 'atrasado').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda de Credores</h1>
          <p className="text-muted-foreground">Gerencie clientes com pagamentos pendentes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Credor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCreditor ? 'Editar Credor' : 'Adicionar Credor'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente *</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id!.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalDebt">Valor Total *</Label>
                <Input
                  id="totalDebt"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={totalDebt}
                  onChange={(e) => setTotalDebt(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição do crediário"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingCreditor ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Total em Aberto</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(totalPendingDebt)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Em Atraso</p>
              <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Credores</p>
              <p className="text-2xl font-bold text-primary">{creditors.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="atrasado">Em atraso</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de credores */}
      <div className="space-y-4">
        {filteredCreditors.map((creditor) => (
          <Card key={creditor.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-lg">{creditor.customerName}</h3>
                  <Badge 
                    variant={getStatusVariant(creditor.status)}
                    className="flex items-center space-x-1"
                  >
                    {getStatusIcon(creditor.status)}
                    <span className="capitalize">{creditor.status}</span>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valor Total</p>
                    <p className="font-medium">{formatCurrency(creditor.totalDebt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Restante</p>
                    <p className="font-medium text-warning">
                      {formatCurrency(creditor.remainingAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vencimento</p>
                    <p className={cn(
                      "font-medium",
                      creditor.status === 'atrasado' && "text-destructive"
                    )}>
                      {formatDate(new Date(creditor.dueDate))}
                    </p>
                  </div>
                </div>
                
                {creditor.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {creditor.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {creditor.status !== 'pago' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsPaid(creditor)}
                    className="text-success hover:bg-success hover:text-success-foreground"
                  >
                    Marcar como Pago
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(creditor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(creditor.id!)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredCreditors.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum credor encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca.'
                : 'Adicione credores para começar a gerenciar pagamentos pendentes.'
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Credores;