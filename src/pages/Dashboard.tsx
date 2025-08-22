import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();

  const stats = [
    {
      title: 'Colaboradores',
      value: '8',
      description: 'Total sob sua gestão',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Avaliações Pendentes',
      value: '3',
      description: 'Aguardando realização',
      icon: Clock,
      color: 'text-warning'
    },
    {
      title: 'PDIs Criados',
      value: '12',
      description: 'Este mês',
      icon: FileText,
      color: 'text-success'
    },
    {
      title: 'Crescimento Médio',
      value: '+15%',
      description: 'Evolução da equipe',
      icon: TrendingUp,
      color: 'text-accent'
    }
  ];

  const recentEvaluations = [
    {
      id: '1',
      colaborador: 'João Silva',
      nivel: 'Pleno',
      data: '2024-01-20',
      status: 'Concluída'
    },
    {
      id: '2',
      colaborador: 'Maria Santos',
      nivel: 'Júnior',
      data: '2024-01-18',
      status: 'PDI Criado'
    },
    {
      id: '3',
      colaborador: 'Pedro Costa',
      nivel: 'Sênior',
      data: '2024-01-15',
      status: 'Concluída'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard - Gestor
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo, {profile?.nome}! Gerencie suas avaliações e equipe.
            </p>
          </div>
          <Link to="/avaliar">
            <Button className="bg-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="shadow-md border-0">
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

        {/* Recent Evaluations */}
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Avaliações Recentes</CardTitle>
              <CardDescription>
                Últimas avaliações realizadas pela sua equipe
              </CardDescription>
            </div>
            <Link to="/avaliacoes">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvaluations.map((evaluation) => (
                <div 
                  key={evaluation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {evaluation.colaborador.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{evaluation.colaborador}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(evaluation.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{evaluation.nivel}</Badge>
                    <Badge 
                      variant={evaluation.status === 'Concluída' ? 'default' : 'outline'}
                      className={evaluation.status === 'PDI Criado' ? 'border-success text-success' : ''}
                    >
                      {evaluation.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Avaliar Colaborador</span>
              </CardTitle>
              <CardDescription>
                Realize uma nova avaliação de senioridade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/avaliar">
                <Button variant="outline" className="w-full">
                  Iniciar Avaliação
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Minha Equipe</span>
              </CardTitle>
              <CardDescription>
                Visualize e gerencie seus colaboradores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/colaboradores">
                <Button variant="outline" className="w-full">
                  Ver Equipe
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Relatórios</span>
              </CardTitle>
              <CardDescription>
                Análise de desempenho e evolução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}