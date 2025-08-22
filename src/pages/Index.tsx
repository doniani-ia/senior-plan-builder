import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Shield, Users, FileText } from 'lucide-react';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user && profile) {
        // Redirect based on user role
        if (profile.papel === 'admin') {
          navigate('/admin');
        } else if (profile.papel === 'gestor') {
          navigate('/dashboard');
        } else {
          navigate('/colaborador');
        }
      } else {
        navigate('/auth');
      }
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
                          <span className="text-4xl font-bold text-foreground">Vendas Pro - PDI</span>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Avaliação de Senioridade & PDI
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Plataforma profissional para avaliação de competências e criação de 
          Planos de Desenvolvimento Individual.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-background shadow-md">
            <Shield className="w-8 h-8 text-primary" />
            <div className="text-left">
              <h3 className="font-semibold">Gestão Admin</h3>
              <p className="text-sm text-muted-foreground">Controle total do sistema</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-background shadow-md">
            <Users className="w-8 h-8 text-primary" />
            <div className="text-left">
              <h3 className="font-semibold">Dashboard Gestor</h3>
              <p className="text-sm text-muted-foreground">Avalie sua equipe</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-background shadow-md">
            <FileText className="w-8 h-8 text-primary" />
            <div className="text-left">
              <h3 className="font-semibold">PDI Automático</h3>
              <p className="text-sm text-muted-foreground">Planos personalizados</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
