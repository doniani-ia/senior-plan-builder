import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  User,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ColaboradorStats {
  total_avaliacoes: number;
  ultima_avaliacao: string | null;
  nivel_atual: string | null;
  pontuacao_media: number | null;
}

export default function Colaboradores() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [colaboradores, setColaboradores] = useState<Profile[]>([]);
  const [colaboradoresStats, setColaboradoresStats] = useState<Record<string, ColaboradorStats>>({});
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Partial<Profile>>({});

  // Carregar colaboradores
  const loadColaboradores = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gestor_id', profile.id)
        .eq('papel', 'colaborador')
        .order('nome', { ascending: true });

      if (error) throw error;
      setColaboradores(data || []);
      
      // Carregar estatísticas para cada colaborador
      await loadColaboradoresStats(data || []);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os colaboradores',
        variant: 'destructive',
      });
    }
  };

  // Carregar estatísticas dos colaboradores
  const loadColaboradoresStats = async (colaboradores: Profile[]) => {
    const stats: Record<string, ColaboradorStats> = {};
    
    for (const colaborador of colaboradores) {
      try {
        // Buscar última avaliação
        const { data: ultimaAvaliacao } = await supabase
          .from('avaliacoes')
          .select('pontuacao_total, nivel_calculado, created_at')
          .eq('avaliado_id', colaborador.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Buscar total de avaliações
        const { count: totalAvaliacoes } = await supabase
          .from('avaliacoes')
          .select('*', { count: 'exact', head: true })
          .eq('avaliado_id', colaborador.id);

        // Buscar pontuação média
        const { data: todasAvaliacoes } = await supabase
          .from('avaliacoes')
          .select('pontuacao_total')
          .eq('avaliado_id', colaborador.id);

        const pontuacaoMedia = todasAvaliacoes && todasAvaliacoes.length > 0
          ? todasAvaliacoes.reduce((sum, av) => sum + av.pontuacao_total, 0) / todasAvaliacoes.length
          : null;

        stats[colaborador.id] = {
          total_avaliacoes: totalAvaliacoes || 0,
          ultima_avaliacao: ultimaAvaliacao?.created_at || null,
          nivel_atual: ultimaAvaliacao?.nivel_calculado || null,
          pontuacao_media: pontuacaoMedia ? Math.round(pontuacaoMedia * 100) / 100 : null
        };
      } catch (error) {
        console.error(`Erro ao carregar stats para ${colaborador.nome}:`, error);
        stats[colaborador.id] = {
          total_avaliacoes: 0,
          ultima_avaliacao: null,
          nivel_atual: null,
          pontuacao_media: null
        };
      }
    }
    
    setColaboradoresStats(stats);
  };

  // Adicionar novo colaborador
  const adicionarColaborador = async () => {
    if (!editingColaborador.nome || !editingColaborador.email) {
      toast({
        title: 'Erro',
        description: 'Nome e email são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Criar apenas o perfil (sem auth por enquanto)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          nome: editingColaborador.nome,
          email: editingColaborador.email,
          papel: 'colaborador',
          gestor_id: profile!.id
        });

      if (profileError) throw profileError;

      toast({
        title: 'Sucesso',
        description: 'Colaborador adicionado com sucesso!',
      });

      setShowAddDialog(false);
      setEditingColaborador({});
      loadColaboradores();

    } catch (error) {
      console.error('Erro ao adicionar colaborador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o colaborador. Verifique se o email não está duplicado.',
        variant: 'destructive',
      });
    }
  };

  // Remover colaborador
  const removerColaborador = async (colaboradorId: string) => {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', colaboradorId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Colaborador removido com sucesso!',
      });

      loadColaboradores();
    } catch (error) {
      console.error('Erro ao remover colaborador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o colaborador',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadColaboradores();
    setLoading(false);
  }, []);

  const getNivelBadge = (nivel: string | null) => {
    if (!nivel) return <Badge variant="outline">Não avaliado</Badge>;
    
    const variants = {
      'junior': 'outline',
      'pleno': 'secondary',
      'senior': 'default'
    } as const;
    
    const colors = {
      'junior': 'bg-gray-100 text-gray-800',
      'pleno': 'bg-blue-100 text-blue-800',
      'senior': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge variant={variants[nivel as keyof typeof variants]} className={colors[nivel as keyof typeof colors]}>
        {nivel === 'junior' ? 'Júnior' : nivel === 'pleno' ? 'Pleno' : 'Sênior'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center justify-center py-12">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando colaboradores...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Meus Colaboradores
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua equipe e acompanhe o desenvolvimento
            </p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro à sua equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={editingColaborador.nome || ''}
                    onChange={(e) => setEditingColaborador({...editingColaborador, nome: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingColaborador.email || ''}
                    onChange={(e) => setEditingColaborador({...editingColaborador, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>O colaborador receberá um email com instruções para definir sua senha.</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={adicionarColaborador}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{colaboradores.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Avaliados</p>
                  <p className="text-2xl font-bold">
                    {Object.values(colaboradoresStats).filter(stats => stats.total_avaliacoes > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avaliações</p>
                  <p className="text-2xl font-bold">
                    {Object.values(colaboradoresStats).reduce((sum, stats) => sum + stats.total_avaliacoes, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sênior</p>
                  <p className="text-2xl font-bold">
                    {Object.values(colaboradoresStats).filter(stats => stats.nivel_atual === 'senior').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Colaboradores */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Colaboradores</CardTitle>
            <CardDescription>
              Lista de todos os colaboradores sob sua gestão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {colaboradores.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum colaborador</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem colaboradores na sua equipe.
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Colaborador
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nível Atual</TableHead>
                    <TableHead>Avaliações</TableHead>
                    <TableHead>Última Avaliação</TableHead>
                    <TableHead>Pontuação Média</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores.map((colaborador) => {
                    const stats = colaboradoresStats[colaborador.id];
                    
                    return (
                      <TableRow key={colaborador.id}>
                        <TableCell className="font-medium">{colaborador.nome}</TableCell>
                        <TableCell>{colaborador.email}</TableCell>
                        <TableCell>{getNivelBadge(stats?.nivel_atual)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {stats?.total_avaliacoes || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {stats?.ultima_avaliacao 
                            ? new Date(stats.ultima_avaliacao).toLocaleDateString('pt-BR')
                            : 'Nunca'
                          }
                        </TableCell>
                        <TableCell>
                          {stats?.pontuacao_media 
                            ? `${stats.pontuacao_media}/100`
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Navegar para avaliação
                                window.location.href = `/avaliar?colaborador=${colaborador.id}`;
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerColaborador(colaborador.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
