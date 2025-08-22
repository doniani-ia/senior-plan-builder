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
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Questionario = Database['public']['Tables']['questionarios']['Row'];
type Pergunta = Database['public']['Tables']['perguntas']['Row'];

export default function AdminQuestionarios() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionario, setSelectedQuestionario] = useState<Questionario | null>(null);
  const [showQuestionarioDialog, setShowQuestionarioDialog] = useState(false);
  const [showPerguntaDialog, setShowPerguntaDialog] = useState(false);
  const [editingQuestionario, setEditingQuestionario] = useState<Partial<Questionario>>({});
  const [editingPergunta, setEditingPergunta] = useState<Partial<Pergunta>>({});

  // Carregar questionários
  const loadQuestionarios = async () => {
    try {
      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar questionários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os questionários',
        variant: 'destructive',
      });
    }
  };

  // Carregar perguntas de um questionário
  const loadPerguntas = async (questionarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .eq('questionario_id', questionarioId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      setPerguntas(data || []);
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  };

  useEffect(() => {
    loadQuestionarios();
    setLoading(false);
  }, []);

  // Salvar questionário
  const saveQuestionario = async () => {
    if (!editingQuestionario.titulo) {
      toast({
        title: 'Erro',
        description: 'Título é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      const questionarioData = {
        ...editingQuestionario,
        created_by: profile?.id,
        versao: editingQuestionario.versao || 1,
        status: editingQuestionario.status || 'rascunho'
      };

      if (editingQuestionario.id) {
        // Atualizar
        const { error } = await supabase
          .from('questionarios')
          .update(questionarioData)
          .eq('id', editingQuestionario.id);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Questionário atualizado com sucesso',
        });
      } else {
        // Criar novo
        const { error } = await supabase
          .from('questionarios')
          .insert(questionarioData);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Questionário criado com sucesso',
        });
      }

      setShowQuestionarioDialog(false);
      setEditingQuestionario({});
      loadQuestionarios();
    } catch (error) {
      console.error('Erro ao salvar questionário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o questionário',
        variant: 'destructive',
      });
    }
  };

  // Salvar pergunta
  const savePergunta = async () => {
    if (!selectedQuestionario?.id || !editingPergunta.texto || !editingPergunta.peso || !editingPergunta.categoria) {
      toast({
        title: 'Erro',
        description: 'Todos os campos são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const perguntaData = {
        ...editingPergunta,
        questionario_id: selectedQuestionario.id,
        peso: parseFloat(editingPergunta.peso.toString()),
        ordem: editingPergunta.ordem || perguntas.length + 1
      };

      if (editingPergunta.id) {
        // Atualizar
        const { error } = await supabase
          .from('perguntas')
          .update(perguntaData)
          .eq('id', editingPergunta.id);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Pergunta atualizada com sucesso',
        });
      } else {
        // Criar nova
        const { error } = await supabase
          .from('perguntas')
          .insert(perguntaData);

        if (error) throw error;
        toast({
          title: 'Sucesso',
          description: 'Pergunta criada com sucesso',
        });
      }

      setShowPerguntaDialog(false);
      setEditingPergunta({});
      loadPerguntas(selectedQuestionario.id);
    } catch (error) {
      console.error('Erro ao salvar pergunta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a pergunta',
        variant: 'destructive',
      });
    }
  };

  // Ativar/Desativar questionário
  const toggleQuestionarioStatus = async (questionario: Questionario) => {
    try {
      const newStatus = questionario.status === 'ativo' ? 'inativo' : 'ativo';
      const { error } = await supabase
        .from('questionarios')
        .update({ status: newStatus })
        .eq('id', questionario.id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: `Questionário ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`,
      });
      
      loadQuestionarios();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive',
      });
    }
  };

  // Deletar questionário
  const deleteQuestionario = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este questionário?')) return;

    try {
      const { error } = await supabase
        .from('questionarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Questionário excluído com sucesso',
      });
      
      loadQuestionarios();
    } catch (error) {
      console.error('Erro ao deletar questionário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o questionário',
        variant: 'destructive',
      });
    }
  };

  // Deletar pergunta
  const deletePergunta = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    try {
      const { error } = await supabase
        .from('perguntas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Pergunta excluída com sucesso',
      });
      
      if (selectedQuestionario) {
        loadPerguntas(selectedQuestionario.id);
      }
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a pergunta',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'inativo':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inativo</Badge>;
      case 'rascunho':
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando...</p>
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
              Gerenciar Questionários
            </h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie questionários de avaliação
            </p>
          </div>
          <Dialog open={showQuestionarioDialog} onOpenChange={setShowQuestionarioDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Questionário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestionario.id ? 'Editar' : 'Novo'} Questionário
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do questionário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={editingQuestionario.titulo || ''}
                    onChange={(e) => setEditingQuestionario({...editingQuestionario, titulo: e.target.value})}
                    placeholder="Ex: Avaliação Técnica 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={editingQuestionario.descricao || ''}
                    onChange={(e) => setEditingQuestionario({...editingQuestionario, descricao: e.target.value})}
                    placeholder="Descrição do questionário..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="versao">Versão</Label>
                    <Input
                      id="versao"
                      type="number"
                      min="1"
                      value={editingQuestionario.versao || 1}
                      onChange={(e) => setEditingQuestionario({...editingQuestionario, versao: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={editingQuestionario.status || 'rascunho'}
                      onValueChange={(value) => setEditingQuestionario({...editingQuestionario, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowQuestionarioDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveQuestionario}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Questionários */}
        <Card>
          <CardHeader>
            <CardTitle>Questionários</CardTitle>
            <CardDescription>
              Lista de todos os questionários disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Perguntas</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionarios.map((questionario) => (
                  <TableRow key={questionario.id}>
                    <TableCell className="font-medium">{questionario.titulo}</TableCell>
                    <TableCell>v{questionario.versao}</TableCell>
                    <TableCell>{getStatusBadge(questionario.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedQuestionario(questionario);
                          loadPerguntas(questionario.id);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Perguntas
                      </Button>
                    </TableCell>
                    <TableCell>
                      {new Date(questionario.created_at!).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingQuestionario(questionario);
                            setShowQuestionarioDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleQuestionarioStatus(questionario)}
                        >
                          {questionario.status === 'ativo' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestionario(questionario.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Perguntas do Questionário Selecionado */}
        {selectedQuestionario && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Perguntas - {selectedQuestionario.titulo}</CardTitle>
                  <CardDescription>
                    Gerencie as perguntas deste questionário
                  </CardDescription>
                </div>
                <Dialog open={showPerguntaDialog} onOpenChange={setShowPerguntaDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Pergunta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPergunta.id ? 'Editar' : 'Nova'} Pergunta
                      </DialogTitle>
                      <DialogDescription>
                        Adicione uma nova pergunta ao questionário
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="texto">Pergunta *</Label>
                        <Textarea
                          id="texto"
                          value={editingPergunta.texto || ''}
                          onChange={(e) => setEditingPergunta({...editingPergunta, texto: e.target.value})}
                          placeholder="Digite a pergunta..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="peso">Peso (1-10) *</Label>
                          <Input
                            id="peso"
                            type="number"
                            min="1"
                            max="10"
                            step="0.01"
                            value={editingPergunta.peso || ''}
                            onChange={(e) => setEditingPergunta({...editingPergunta, peso: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoria">Categoria *</Label>
                          <Select
                            value={editingPergunta.categoria || ''}
                            onValueChange={(value) => setEditingPergunta({...editingPergunta, categoria: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tecnico">Técnico</SelectItem>
                              <SelectItem value="processo">Processo</SelectItem>
                              <SelectItem value="comportamento">Comportamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="ordem">Ordem</Label>
                        <Input
                          id="ordem"
                          type="number"
                          min="1"
                          value={editingPergunta.ordem || perguntas.length + 1}
                          onChange={(e) => setEditingPergunta({...editingPergunta, ordem: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowPerguntaDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={savePergunta}>
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Pergunta</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perguntas.map((pergunta) => (
                    <TableRow key={pergunta.id}>
                      <TableCell>{pergunta.ordem}</TableCell>
                      <TableCell className="max-w-md truncate">{pergunta.texto}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {pergunta.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell>{pergunta.peso}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPergunta(pergunta);
                              setShowPerguntaDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePergunta(pergunta.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
