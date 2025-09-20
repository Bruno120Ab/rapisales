import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { User, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Chamada ao Supabase só pra checar se o usuário existe
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message || "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    } else if (data.user) {
      // Força admin
      const adminUser = {
        id: Number(data.user.id),
        username: data.user.email || username,
        role: "admin", // tudo liberado
      };

      localStorage.setItem('currentUser', JSON.stringify(adminUser));

      toast({
        title: "Login realizado!",
        description: `Bem-vindo, ${adminUser.username}!`,
        variant: "default",
      });

      // Aqui você pode recarregar a página pra entrar no app
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
    toast({
      title: "Erro",
      description: "Não foi possível realizar o login.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">RapiSale</h1>
          <p className="text-muted-foreground">ERP Completo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>Estagiário:</strong> estagiario / estagiario123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;