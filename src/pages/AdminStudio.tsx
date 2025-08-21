import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  FileText, 
  Users, 
  Settings,
  Plus,
  Eye,
  Database,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminStudio() {
  const { profile } = useAuth();

  const adminStats = [
    {
      title: 'Total de Usuários',
      value: '45',
      description: 'Usuários ativos na plataforma',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Questionários Ativos',
      value: '3',
      description: 'Questionários em uso',
      icon: FileText,
      color: 'text-success'
    },
    {
      title: 'Avaliações Realizadas',
      value: '127',
      description: 'Total histórico',
      icon: BarChart3,
      color: 'text-accent'
    },
    {
      title: 'PDIs Gerados',
      value: '89',
      description: 'Planos de desenvolvimento',
      icon: Database,
      color: 'text-warning'
    }
  ];

  const systemStatus = [
    {
      component: 'Banco de Dados',
      status: 'Operacional',
      lastCheck: '2 min atrás',
      variant: 'default' as const
    },
    {
      component: 'Sistema de Avaliação',
      status: 'Operacional',
      lastCheck: '5 min atrás',
      variant: 'default' as const
    },
    {
      component: 'Geração de PDI',
      status: 'Operacional',
      lastCheck: '1 min atrás',
      variant: 'default' as const
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <Shield className="w-8 h-8 text-primary" />
              <span>Admin Studio</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Painel administrativo completo - Bem-vindo, {profile?.nome}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link to="/admin/questionarios">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Questionários
              </Button>
            </Link>
            <Link to="/admin/usuarios">
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="shadow-professional-md border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <Card className="shadow-professional-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>Status do Sistema</span>
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real dos componentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{item.component}</p>
                    <p className="text-sm text-muted-foreground">
                      Última verificação: {item.lastCheck}
                    </p>
                  </div>
                  <Badge variant={item.variant} className="bg-success text-success-foreground">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-professional-md border-0 hover:shadow-professional-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Gerenciar Questionários</span>
              </CardTitle>
              <CardDescription>
                Criar, editar e ativar questionários de avaliação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/questionarios">
                <Button className="w-full mb-2">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Questionários
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Criar Questionário
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-professional-md border-0 hover:shadow-professional-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Gerenciar Usuários</span>
              </CardTitle>
              <CardDescription>
                Administrar perfis, papéis e hierarquias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/usuarios">
                <Button className="w-full mb-2">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Usuários
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Criar Usuário
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-professional-md border-0 hover:shadow-professional-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-primary" />
                <span>Ações do PDI</span>
              </CardTitle>
              <CardDescription>
                Configurar ações por categoria e nível
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full mb-2">
                <Eye className="w-4 h-4 mr-2" />
                Ver Ações PDI
              </Button>
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nova Ação
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-professional-lg border-0">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Questionário "Avaliação Técnica 2024" ativado', time: '2 horas atrás', user: 'Sistema' },
                { action: 'Usuário Maria Santos promovido a Gestor', time: '4 horas atrás', user: 'Admin' },
                { action: 'PDI gerado para João Silva', time: '6 horas atrás', user: 'Carlos Mendes' },
                { action: 'Nova avaliação realizada', time: '8 horas atrás', user: 'Ana Costa' }
              ].map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">por {activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}