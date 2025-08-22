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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Code,
  Settings,
  Users,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AcaoPDI = Database['public']['Tables']['acoes_pdi']['Row'];

export default function AdminAcoesPDI() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [acoes, setAcoes] = useState<AcaoPDI[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAcao, setEditingAcao] = useState<Partial<AcaoPDI>>({});
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterNivel, setFilterNivel] = useState<string>('todos');

  // Carregar ações
  const loadAcoes = async () => {
    try {
      const { data, error } = await supabase
        .from('acoes_pdi')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nivel_minimo', { ascending: true });

      if (error) throw error;
      setAcoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as ações do PDI',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcoes();
  }, []);

  // Adicionar ação
  const adicionarAcao = async () => {
    if (!editingAcao.titulo || !editingAcao.descricao || !editingAcao.categoria || !editingAcao.nivel_minimo) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('acoes_pdi')
        .insert({
          titulo: editingAcao.titulo,
          descricao: editingAcao.descricao,
          categoria: editingAcao.categoria,
          nivel_minimo: editingAcao.nivel_minimo,
          nivel_maximo: editingAcao.nivel_maximo || editingAcao.nivel_minimo
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ação criada com sucesso',
      });

      setShowAddDialog(false);
      setEditingAcao({});
      loadAcoes();
    } catch (error) {
      console.error('Erro ao criar ação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a ação',
        variant: 'destructive',
      });
    }
  };

  // Atualizar ação
  const atualizarAcao = async () => {
    if (!editingAcao.id || !editingAcao.titulo || !editingAcao.descricao || !editingAcao.categoria || !editingAcao.nivel_minimo) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('acoes_pdi')
        .update({
          titulo: editingAcao.titulo,
          descricao: editingAcao.descricao,
          categoria: editingAcao.categoria,
          nivel_minimo: editingAcao.nivel_minimo,
          nivel_maximo: editingAcao.nivel_maximo || editingAcao.nivel_minimo
        })
        .eq('id', editingAcao.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ação atualizada com sucesso',
      });

      setShowEditDialog(false);
      setEditingAcao({});
      loadAcoes();
    } catch (error) {
      console.error('Erro ao atualizar ação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a ação',
        variant: 'destructive',
      });
    }
  };

  // Remover ação
  const removerAcao = async (acaoId: string) => {
    if (!confirm('Tem certeza que deseja remover esta ação?')) return;

    try {
      const { error } = await supabase
        .from('acoes_pdi')
        .delete()
        .eq('id', acaoId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Ação removida com sucesso',
      });

      loadAcoes();
    } catch (error) {
      console.error('Erro ao remover ação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a ação',
        variant: 'destructive',
      });
    }
  };

  // Filtrar ações
  const acoesFiltradas = acoes.filter(acao => {
    const matchCategoria = filterCategoria === 'todas' || acao.categoria === filterCategoria;
    const matchNivel = filterNivel === 'todos' || acao.nivel_minimo === filterNivel;
    return matchCategoria && matchNivel;
  });

  // Estatísticas
  const stats = {
    total: acoes.length,
    tecnico: acoes.filter(a => a.categoria === 'tecnico').length,
    processo: acoes.filter(a => a.categoria === 'processo').length,
    comportamento: acoes.filter(a => a.categoria === 'comportamento').length
  };

  const getCategoriaBadge = (categoria: string) => {
    const variants = {
      tecnico: 'default',
      processo: 'secondary',
      comportamento: 'outline'
    } as const;

    const labels = {
      tecnico: 'Técnico',
      processo: 'Processo',
      comportamento: 'Comportamento'
    };

    return (
      <Badge variant={variants[categoria as keyof typeof variants] || 'outline'}>
        {labels[categoria as keyof typeof labels] || categoria}
      </Badge>
    );
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ações do PDI</h1>
            <p className="text-muted-foreground">
              Configure ações de desenvolvimento por categoria e nível
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Ação
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Técnico</p>
                  <p className="text-2xl font-bold">{stats.tecnico}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processo</p>
                  <p className="text-2xl font-bold">{stats.processo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comportamento</p>
                  <p className="text-2xl font-bold">{stats.comportamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="shadow-md border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="categoria">Filtrar por Categoria</Label>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="processo">Processo</SelectItem>
                    <SelectItem value="comportamento">Comportamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="nivel">Filtrar por Nível</Label>
                <Select value={filterNivel} onValueChange={setFilterNivel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Níveis</SelectItem>
                    <SelectItem value="junior">Júnior</SelectItem>
                    <SelectItem value="pleno">Pleno</SelectItem>
                    <SelectItem value="senior">Sênior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Ações */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Ações ({acoesFiltradas.length})</CardTitle>
            <CardDescription>
              Lista de todas as ações de desenvolvimento disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {acoesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma ação encontrada</h3>
                <p className="text-muted-foreground">
                  {filterCategoria !== 'todas' || filterNivel !== 'todos'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando a primeira ação'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Nível Mínimo</TableHead>
                    <TableHead>Nível Máximo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acoesFiltradas.map((acao) => (
                    <TableRow key={acao.id}>
                      <TableCell className="font-medium">{acao.titulo}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate" title={acao.descricao}>
                            {acao.descricao}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoriaBadge(acao.categoria)}</TableCell>
                      <TableCell>{getNivelBadge(acao.nivel_minimo)}</TableCell>
                      <TableCell>{getNivelBadge(acao.nivel_maximo)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAcao(acao);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerAcao(acao.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Adicionar Ação */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Ação</DialogTitle>
              <DialogDescription>
                Crie uma nova ação de desenvolvimento para o PDI
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={editingAcao.titulo || ''}
                  onChange={(e) => setEditingAcao({...editingAcao, titulo: e.target.value})}
                  placeholder="Título da ação"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={editingAcao.descricao || ''}
                  onChange={(e) => setEditingAcao({...editingAcao, descricao: e.target.value})}
                  placeholder="Descrição detalhada da ação"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria *</Label>
                <Select 
                  value={editingAcao.categoria || ''} 
                  onValueChange={(value) => setEditingAcao({...editingAcao, categoria: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="processo">Processo</SelectItem>
                    <SelectItem value="comportamento">Comportamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nivel_minimo">Nível Mínimo *</Label>
                  <Select 
                    value={editingAcao.nivel_minimo || ''} 
                    onValueChange={(value) => setEditingAcao({...editingAcao, nivel_minimo: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nível mínimo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Júnior</SelectItem>
                      <SelectItem value="pleno">Pleno</SelectItem>
                      <SelectItem value="senior">Sênior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nivel_maximo">Nível Máximo</Label>
                  <Select 
                    value={editingAcao.nivel_maximo || ''} 
                    onValueChange={(value) => setEditingAcao({...editingAcao, nivel_maximo: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nível máximo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Júnior</SelectItem>
                      <SelectItem value="pleno">Pleno</SelectItem>
                      <SelectItem value="senior">Sênior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={adicionarAcao}>
                Adicionar Ação
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Editar Ação */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Ação</DialogTitle>
              <DialogDescription>
                Atualize as informações da ação
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-titulo">Título *</Label>
                <Input
                  id="edit-titulo"
                  value={editingAcao.titulo || ''}
                  onChange={(e) => setEditingAcao({...editingAcao, titulo: e.target.value})}
                  placeholder="Título da ação"
                />
              </div>
              <div>
                <Label htmlFor="edit-descricao">Descrição *</Label>
                <Textarea
                  id="edit-descricao"
                  value={editingAcao.descricao || ''}
                  onChange={(e) => setEditingAcao({...editingAcao, descricao: e.target.value})}
                  placeholder="Descrição detalhada da ação"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-categoria">Categoria *</Label>
                <Select 
                  value={editingAcao.categoria || ''} 
                  onValueChange={(value) => setEditingAcao({...editingAcao, categoria: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="processo">Processo</SelectItem>
                    <SelectItem value="comportamento">Comportamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nivel-minimo">Nível Mínimo *</Label>
                  <Select 
                    value={editingAcao.nivel_minimo || ''} 
                    onValueChange={(value) => setEditingAcao({...editingAcao, nivel_minimo: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nível mínimo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Júnior</SelectItem>
                      <SelectItem value="pleno">Pleno</SelectItem>
                      <SelectItem value="senior">Sênior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-nivel-maximo">Nível Máximo</Label>
                  <Select 
                    value={editingAcao.nivel_maximo || ''} 
                    onValueChange={(value) => setEditingAcao({...editingAcao, nivel_maximo: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nível máximo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Júnior</SelectItem>
                      <SelectItem value="pleno">Pleno</SelectItem>
                      <SelectItem value="senior">Sênior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={atualizarAcao}>
                Atualizar Ação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
