import { useState, useEffect } from 'react';
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
  Award,
  BarChart3,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';

export default function ColaboradorProfile() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [pdis, setPdis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do colaborador
  const loadDadosColaborador = async () => {
    if (!profile) return;
    
    try {
      // Carregar avaliações
      const { data: avaliacoesData, error: avaliacoesError } = await supabase
        .from('avaliacoes')
        .select('*')
        .eq('avaliado_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (avaliacoesError) throw avaliacoesError;
      setAvaliacoes(avaliacoesData || []);

      // Carregar PDIs
      const { data: pdisData, error: pdisError } = await supabase
        .from('pdis')
        .select('*')
        .eq('colaborador_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (pdisError) throw pdisError;
      setPdis(pdisData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDadosColaborador();
  }, [profile]);

  // Estatísticas dinâmicas
  const profileStats = [
    {
      title: 'Avaliações Realizadas',
      value: avaliacoes.length.toString(),
      description: 'Total de avaliações',
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'Nível Atual',
      value: avaliacoes.length > 0 ? avaliacoes[0].nivel_calculado === 'junior' ? 'Júnior' : 
             avaliacoes[0].nivel_calculado === 'pleno' ? 'Pleno' : 'Sênior' : 'N/A',
      description: 'Última avaliação',
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'PDIs Ativos',
      value: pdis.length.toString(),
      description: 'Em desenvolvimento',
      icon: Target,
      color: 'text-warning'
    },
    {
      title: 'Pontuação Média',
      value: avaliacoes.length > 0 
        ? (avaliacoes.reduce((sum, av) => sum + av.pontuacao_total, 0) / avaliacoes.length).toFixed(1)
        : '0',
      description: 'Escala 0-100',
      icon: Award,
      color: 'text-accent'
    }
  ];

  const getNivelBadge = (nivel: string) => {
    const variants = {
      junior: 'secondary',
      pleno: 'default',
      senior: 'destructive'
    } as const;

    const labels = {
      junior: 'Júnior',
      pleno: 'Pleno',
      senior: 'Sênior'
    };

    return (
      <Badge variant={variants[nivel as keyof typeof variants] || 'outline'}>
        {labels[nivel as keyof typeof labels] || nivel}
      </Badge>
    );
  };

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
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
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
          <CardHeader>
            <CardTitle>Histórico de Avaliações</CardTitle>
            <CardDescription>
              Suas avaliações de senioridade realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {avaliacoes.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não possui avaliações de senioridade.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {avaliacoes.slice(0, 3).map((avaliacao) => (
                  <div 
                    key={avaliacao.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Avaliação de {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pontuação: {avaliacao.pontuacao_total}/100
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        {getNivelBadge(avaliacao.nivel_calculado)}
                      </div>
                    </div>
                  </div>
                ))}
                {avaliacoes.length > 3 && (
                  <div className="text-center pt-4">
                    <Link to="/colaborador/avaliacoes">
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Todas as Avaliações ({avaliacoes.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
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
              <Link to="/colaborador/avaliacoes">
                <Button className="w-full" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Todas Avaliações
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
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
              <Link to="/pdis">
                <Button className="w-full" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  Ver Meus PDIs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}