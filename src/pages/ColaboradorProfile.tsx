import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Shield, 
  TrendingUp, 
  FileText,
  Calendar,
  Target,
  Award
} from 'lucide-react';

export default function ColaboradorProfile() {
  const { profile } = useAuth();

  const profileStats = [
    {
      title: 'Avaliações Realizadas',
      value: '5',
      description: 'Total de avaliações',
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'Nível Atual',
      value: 'Pleno',
      description: 'Última avaliação',
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'PDIs Ativos',
      value: '2',
      description: 'Em desenvolvimento',
      icon: Target,
      color: 'text-warning'
    },
    {
      title: 'Pontuação Média',
      value: '7.8',
      description: 'Escala 1-10',
      icon: Award,
      color: 'text-accent'
    }
  ];

  const recentEvaluations = [
    {
      id: '1',
      data: '2024-01-15',
      avaliador: 'Carlos Mendes',
      nivel: 'Pleno',
      pontuacao: 78,
      status: 'PDI Criado'
    },
    {
      id: '2',
      data: '2023-11-20',
      avaliador: 'Carlos Mendes',
      nivel: 'Júnior',
      pontuacao: 65,
      status: 'Concluído'
    },
    {
      id: '3',
      data: '2023-08-10',
      avaliador: 'Carlos Mendes',
      nivel: 'Júnior',
      pontuacao: 58,
      status: 'Concluído'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <User className="w-8 h-8 text-primary" />
              <span>Meu Perfil</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe seu desenvolvimento profissional
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="shadow-professional-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">{profile?.nome}</CardTitle>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <Badge variant="outline" className="capitalize">
                      {profile?.papel}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profileStats.map((stat) => {
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

        {/* Recent Evaluations */}
        <Card className="shadow-professional-lg border-0">
          <CardHeader>
            <CardTitle>Histórico de Avaliações</CardTitle>
            <CardDescription>
              Suas avaliações de senioridade realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvaluations.map((evaluation) => (
                <div 
                  key={evaluation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Avaliação de {new Date(evaluation.data).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avaliador: {evaluation.avaliador}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{evaluation.pontuacao} pontos</p>
                      <Badge 
                        variant={evaluation.nivel === 'Sênior' ? 'default' : 
                                evaluation.nivel === 'Pleno' ? 'secondary' : 'outline'}
                      >
                        {evaluation.nivel}
                      </Badge>
                    </div>
                    <Badge 
                      variant={evaluation.status === 'PDI Criado' ? 'default' : 'outline'}
                      className={evaluation.status === 'PDI Criado' ? 'bg-success text-success-foreground' : ''}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-professional-md border-0 hover:shadow-professional-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Minhas Avaliações</span>
              </CardTitle>
              <CardDescription>
                Visualize todas as suas avaliações detalhadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Todas Avaliações
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-professional-md border-0 hover:shadow-professional-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Meus PDIs</span>
              </CardTitle>
              <CardDescription>
                Acompanhe seus Planos de Desenvolvimento Individual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Meus PDIs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}