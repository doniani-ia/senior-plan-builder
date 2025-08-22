import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart3, 
  Calendar,
  User,
  TrendingUp,
  FileText,
  Eye,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Avaliacao = Database['public']['Tables']['avaliacoes']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface AvaliacaoComDetalhes extends Avaliacao {
  avaliador: Profile;
  questionario: {
    id: string;
    titulo: string;
  };
}

export default function ColaboradorAvaliacoes() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComDetalhes[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar avaliações
  const loadAvaliacoes = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          avaliador:profiles!avaliacoes_avaliador_id_fkey(
            id,
            nome,
            email
          ),
          questionario:questionarios(
            id,
            titulo
          )
        `)
        .eq('avaliado_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvaliacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas avaliações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvaliacoes();
  }, [profile]);

  // Estatísticas
  const stats = {
    total: avaliacoes.length,
    media: avaliacoes.length > 0 
      ? (avaliacoes.reduce((sum, av) => sum + av.pontuacao_total, 0) / avaliacoes.length).toFixed(1)
      : '0',
    melhor: avaliacoes.length > 0 
      ? Math.max(...avaliacoes.map(av => av.pontuacao_total))
      : 0,
    ultima: avaliacoes.length > 0 
      ? avaliacoes[0].created_at
      : null
  };

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

  const getProgressColor = (pontuacao: number) => {
    if (pontuacao >= 70) return 'text-green-600';
    if (pontuacao >= 40) return 'text-blue-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Avaliações</h1>
          <p className="text-muted-foreground">
            Histórico completo de suas avaliações de senioridade
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Avaliações</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Média Geral</p>
                  <p className="text-2xl font-bold">{stats.media}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Melhor Pontuação</p>
                  <p className="text-2xl font-bold">{stats.melhor}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Avaliação</p>
                  <p className="text-lg font-bold">
                    {stats.ultima 
                      ? new Date(stats.ultima).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Avaliações */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Histórico de Avaliações</CardTitle>
            <CardDescription>
              Todas as suas avaliações de senioridade realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {avaliacoes.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                <p className="text-muted-foreground">
                  Você ainda não possui avaliações de senioridade.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Avaliador</TableHead>
                    <TableHead>Questionário</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {avaliacoes.map((avaliacao) => (
                    <TableRow key={avaliacao.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{avaliacao.avaliador.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>{avaliacao.questionario.titulo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${getProgressColor(avaliacao.pontuacao_total)}`}>
                            {avaliacao.pontuacao_total}/100
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getNivelBadge(avaliacao.nivel_calculado)}
                      </TableCell>
                      <TableCell>
                        {avaliacao.observacoes ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate" title={avaliacao.observacoes}>
                              {avaliacao.observacoes}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Evolução */}
        {avaliacoes.length > 1 && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Evolução da Pontuação</CardTitle>
              <CardDescription>
                Sua progressão ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {avaliacoes.slice(0, 5).map((avaliacao, index) => (
                  <div key={avaliacao.id} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-muted-foreground">
                      {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pontuação: {avaliacao.pontuacao_total}/100</span>
                        <span>{getNivelBadge(avaliacao.nivel_calculado)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(avaliacao.pontuacao_total).replace('text-', 'bg-')}`}
                          style={{ width: `${avaliacao.pontuacao_total}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
