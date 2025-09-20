import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings,
  Store,
  Users,
  LogOut,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const Layout = ({ children, onLogout }: LayoutProps) => {
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const { user , profile } = useAuth();

  const navigation = [
    { name: 'PDV', href: '/', icon: ShoppingCart, permission: 'vendas' },
    { name: 'RapiDelivery', href: '/estoque', icon: Package, permission: 'estoque' },
    { name: 'Relatórios', href: '/relatorios', icon: BarChart3, permission: 'relatorios' },
    { name: 'Devoluções', href: '/devolucoes', icon: RotateCcw, permission: 'vendas' },
    { name: 'Clientes', href: '/clientes', icon: Users, permission: 'configuracoes' },
    { name: 'Credores', href: '/credores', icon: Users, permission: 'configuracoes' },
    { name: 'Pagar/Receber', href: '/contaspagar', icon: Settings, permission: 'contaspagar' },
    { name: 'Configurações', href: '/configuracoes', icon: Settings, permission: 'configuracoes' },


  ].filter(item => authService.hasPermission(item.permission as any));

  // console.log(user.user_metadata.restaurantData.name)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
     <div className="flex items-center space-x-4">
  <img
    src="src/assets/logo.png"
    alt="Boutique da Thaina"
    className="h-16 w-16 rounded-full object-cover"
  />
  <h1 className="text-3xl font-bold text-foreground">
    {user?.user_metadata.restaurantData.name}
  </h1>
</div>


          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Usuário: <span className="font-medium">{profile?.name}</span>
              {currentUser?.role === 'admin' && <span className="text-primary"> (Admin)</span>}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-card border-r border-border min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;