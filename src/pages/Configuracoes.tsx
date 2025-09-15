import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { db, seedDatabase } from '@/lib/database';
import { 
  Settings, 
  Database, 
  Download, 
  Upload, 
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const Configuracoes = () => {
  const [loading, setLoading] = useState(false);

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      await seedDatabase();
      toast({
        title: "Dados exemplo carregados",
        description: "Produtos de exemplo foram adicionados ao sistema.",
      });
    } catch (error) {
      console.error('Erro ao carregar dados exemplo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados exemplo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleExportData = async () => {
  //   setLoading(true);
  //   try {
  //     const products = await db.products.toArray();
  //     const sales = await db.sales.toArray();
  //     const stockMovements = await db.stockMovements.toArray();
      
  //     const data = {
  //       products,
  //       sales,
  //       stockMovements,
  //       exportedAt: new Date().toISOString()
  //     };

  //     const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `backup-pdv-${new Date().toISOString().split('T')[0]}.json`;
  //     a.click();
  //     URL.revokeObjectURL(url);

  //     toast({
  //       title: "Backup criado",
  //       description: "Todos os dados foram exportados com sucesso.",
  //     });
  //   } catch (error) {
  //     console.error('Erro ao exportar dados:', error);
  //     toast({
  //       title: "Erro",
  //       description: "Não foi possível exportar os dados.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleExportData = async () => {
  setLoading(true);
  try {
    // Busca todos os dados do banco
    const products = await db.products.toArray();
    const sales = await db.sales.toArray();
    const stockMovements = await db.stockMovements.toArray();
    const users = await db.users.toArray();
    const customers = await db.customers.toArray();
    const creditors = await db.creditors.toArray();
    const creditSales = await db.creditSales.toArray();
    const returns = await db.returns.toArray();
    const expenses = await db.expenses.toArray();
    const exchanges = await db.exchanges.toArray();

    // Organiza tudo em um objeto único
    const data = {
      products,
      sales,
      stockMovements,
      users,
      customers,
      creditors,
      creditSales,
      returns,
      expenses,
      exchanges,
      exportedAt: new Date().toISOString()
    };

    // Converte para JSON e gera o arquivo
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pdv-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Backup criado",
      description: "Todos os dados foram exportados com sucesso.",
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    toast({
      title: "Erro",
      description: "Não foi possível exportar os dados.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      setLoading(true);
      const data = JSON.parse(e.target?.result as string);

      if (data.products) {
        await db.products.clear();
        await db.products.bulkAdd(data.products);
      }

      if (data.sales) {
        await db.sales.clear();
        await db.sales.bulkAdd(data.sales);
      }

      if (data.stockMovements) {
        await db.stockMovements.clear();
        await db.stockMovements.bulkAdd(data.stockMovements);
      }

      if (data.users) {
        await db.users.clear();
        await db.users.bulkAdd(data.users);
      }

      if (data.customers) {
        await db.customers.clear();
        await db.customers.bulkAdd(data.customers);
      }

      if (data.creditors) {
        await db.creditors.clear();
        await db.creditors.bulkAdd(data.creditors);
      }

      if (data.creditSales) {
        await db.creditSales.clear();
        await db.creditSales.bulkAdd(data.creditSales);
      }

      if (data.returns) {
        await db.returns.clear();
        await db.returns.bulkAdd(data.returns);
      }

      if (data.expenses) {
        await db.expenses.clear();
        await db.expenses.bulkAdd(data.expenses);
      }

      if (data.exchanges) {
        await db.exchanges.clear();
        await db.exchanges.bulkAdd(data.exchanges);
      }

      toast({
        title: "Backup restaurado",
        description: "Todos os dados foram importados com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível importar os dados. Verifique o arquivo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      await db.products.clear();
      await db.sales.clear();
      await db.stockMovements.clear();
      
      toast({
        title: "Dados apagados",
        description: "Todos os dados foram removidos do sistema.",
      });
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível apagar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Tem certeza que deseja resetar o banco de dados? Todos os dados serão perdidos.')) {
      return;
    }

    setLoading(true);
    try {
      await db.delete();
      window.location.reload();
    } catch (error) {
      console.error('Erro ao resetar banco:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar o banco de dados.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
      </div>

      <div className="space-y-6">
        {/* System Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informações do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label>ERP Completo</Label>
              <p className="text-muted-foreground">Versão 1.0.0</p>
            </div>
           
            <div>
              <Label>Última atualização</Label>
              <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="text-success">Online</p>
            </div>
          </div>
        </Card>

        {/* Database Management */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Gerenciamento de Dados</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleSeedDatabase} 
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Carregar Dados Exemplo
              </Button>
              
              <Button 
                onClick={handleExportData} 
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar Backup
              </Button>
            </div>

            <div>
              <Label htmlFor="import-file" className="cursor-pointer">
                <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Importar Backup</p>
                    <p className="text-xs text-muted-foreground">Clique para selecionar um arquivo .json</p>
                  </div>
                </div>
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Zona de Perigo</h2>
          </div>
          
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              As ações abaixo são irreversíveis. Certifique-se de ter um backup antes de prosseguir.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              onClick={handleClearData}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Apagar Todos os Dados
            </Button>
            
            <Button 
              onClick={handleResetDatabase}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Resetar Banco de Dados
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sobre</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Sistema PDV completo com controle de estoque integrado.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;