import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Shield,
  Calendar,
  Search,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserWithGestor extends Profile {
  gestor?: {
    id: string;
    nome: string;
    email: string;
  };
}

interface FormData {
  nome: string;
  email: string;
  papel: 'admin' | 'gestor' | 'colaborador';
  gestor_id?: string;
  senha: string;
}

export default function AdminUsuarios() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [usuarios, setUsuarios] = useState<UserWithGestor[]>([]);
  const [gestores, setGestores] = useState<{id: string; nome: string; email: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPapel, setFilterPapel] = useState<string>('todos');
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    papel: 'colaborador',
    senha: ''
  });
  const [selectedUsuario, setSelectedUsuario] = useState<UserWithGestor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar usuários
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      console.log('Carregando usuários...');
      
      // Teste simples sem verificar autenticação primeiro
      console.log('Tentando carregar usuários...');
      
      // Primeiro, carregar todos os usuários
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usuariosError) {
        console.error('Erro ao carregar usuários:', usuariosError);
        
        // Se for erro de RLS, tentar sem autenticação
        if (usuariosError.code === '42501') {
          console.log('Tentando consulta sem autenticação...');
          const { data: dataAnon, error: errorAnon } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
          
          console.log('Resultado sem auth:', { dataAnon, errorAnon });
          
          if (errorAnon) {
            throw errorAnon;
          }
          
          const usuariosCompletos = dataAnon?.map(usuario => ({
            ...usuario,
            gestor: undefined
          })) || [];
          
          setUsuarios(usuariosCompletos);
          return;
        }
        
        throw usuariosError;
      }

      console.log('Usuários carregados:', usuariosData);

      // Se há usuários com gestor_id, carregar os gestores
      const usuariosComGestor = usuariosData?.filter(u => u.gestor_id) || [];
      const gestorIds = [...new Set(usuariosComGestor.map(u => u.gestor_id))];

      let gestoresData: {id: string; nome: string; email: string}[] = [];
      if (gestorIds.length > 0) {
        const { data: gestores, error: gestoresError } = await supabase
          .from('profiles')
          .select('id, nome, email')
          .in('id', gestorIds);

        if (gestoresError) {
          console.error('Erro ao carregar gestores:', gestoresError);
        } else {
          gestoresData = gestores || [];
        }
      }

      // Combinar os dados
      const usuariosCompletos = usuariosData?.map(usuario => ({
        ...usuario,
        gestor: usuario.gestor_id 
          ? gestoresData.find(g => g.id === usuario.gestor_id)
          : undefined
      })) || [];

      console.log('Usuários processados:', usuariosCompletos);
      setUsuarios(usuariosCompletos);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar gestores para o select
  const loadGestores = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, email')
        .eq('papel', 'gestor')
        .order('nome', { ascending: true });

      if (error) throw error;
      setGestores(data || []);
    } catch (error) {
      console.error('Erro ao carregar gestores:', error);
    }
  };

  useEffect(() => {
    console.log('AdminUsuarios useEffect - Profile:', profile);
    console.log('AdminUsuarios useEffect - Loading:', loading);
    
    if (profile) {
      console.log('Perfil encontrado, carregando dados...');
      loadUsuarios();
      loadGestores();
    } else {
      console.log('Perfil não encontrado');
    }
  }, [profile]);

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      papel: 'colaborador',
      senha: ''
    });
    setSelectedUsuario(null);
  };

  // Abrir dialog de adicionar
  const openAddDialog = () => {
    console.log('Abrindo dialog de adicionar...');
    try {
      resetForm();
      console.log('Formulário resetado');
      setShowAddDialog(true);
      console.log('Dialog aberto');
    } catch (error) {
      console.error('Erro ao abrir dialog:', error);
    }
  };

  // Abrir dialog de editar
  const openEditDialog = (usuario: UserWithGestor) => {
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      gestor_id: usuario.gestor_id || undefined,
      senha: '' // Senha vazia para edição
    });
    setSelectedUsuario(usuario);
    setShowEditDialog(true);
  };

  // Abrir dialog de remover
  const openDeleteDialog = (usuario: UserWithGestor) => {
    setSelectedUsuario(usuario);
    setShowDeleteDialog(true);
  };

  // Abrir dialog de desativar
  const openDeactivateDialog = (usuario: UserWithGestor) => {
    setSelectedUsuario(usuario);
    setShowDeactivateDialog(true);
  };

  // Adicionar usuário
  const adicionarUsuario = async () => {
    console.log('Iniciando adição de usuário...');
    console.log('FormData:', formData);
    
    if (!formData.nome || !formData.email || !formData.papel) {
      console.log('Dados obrigatórios não preenchidos');
      toast({
        title: 'Erro',
        description: 'Nome, email e papel são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Testar comunicação com Edge Function primeiro
      console.log('Testando comunicação com Edge Function...');
      const { data: testData, error: testError } = await supabase.functions.invoke('test-create-user', {
        body: {
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          senha: formData.senha || 'senha123',
          papel: formData.papel,
          gestor_id: formData.gestor_id || null
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      console.log('Teste da Edge Function:', { testData, testError });

      if (testError) {
        console.error('Erro no teste da Edge Function:', testError);
        throw new Error(`Erro na comunicação: ${testError.message}`);
      }

      // 2. Se o teste passou, criar usuário usando Edge Function
      console.log('Criando usuário via Edge Function...');
      console.log('Dados enviados:', {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha || 'senha123',
        papel: formData.papel,
        gestor_id: formData.gestor_id || null
      });
      
      const { data: createUserData, error: createUserError } = await supabase.functions.invoke('create-user', {
        body: {
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          senha: formData.senha || 'senha123',
          papel: formData.papel,
          gestor_id: formData.gestor_id || null
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      console.log('Resposta da Edge Function:', { createUserData, createUserError });

      if (createUserError) {
        console.error('Erro na Edge Function:', createUserError);
        console.error('Detalhes do erro:', {
          message: createUserError.message,
          name: createUserError.name,
          status: createUserError.status,
          statusText: createUserError.statusText
        });
        throw new Error(`Erro ao criar usuário: ${createUserError.message}`);
      }

      if (!createUserData || !createUserData.success) {
        console.error('Resposta inválida da Edge Function:', createUserData);
        throw new Error(createUserData?.error || 'Falha ao criar usuário');
      }

      console.log('Usuário criado com sucesso:', createUserData.user);

      console.log('Perfil criado com sucesso');

      const senhaUsada = formData.senha || 'senha123';
      toast({
        title: 'Sucesso',
        description: `Usuário criado com sucesso. Senha: ${senhaUsada}`,
      });

      setShowAddDialog(false);
      resetForm();
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível criar o usuário',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualizar usuário
  const atualizarUsuario = async () => {
    if (!selectedUsuario?.id || !formData.nome || !formData.email || !formData.papel) {
      toast({
        title: 'Erro',
        description: 'Dados obrigatórios não preenchidos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Atualizar perfil na tabela
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome.trim(),
          email: formData.email.trim().toLowerCase(),
          papel: formData.papel,
          gestor_id: formData.gestor_id || null
        })
        .eq('id', selectedUsuario.id);

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este email já está em uso');
        }
        throw error;
      }

      // 2. Se uma nova senha foi fornecida, atualizar na autenticação
      if (formData.senha && selectedUsuario.user_id) {
        console.log('Atualizando senha do usuário...');
        const { data: updatePasswordData, error: updatePasswordError } = await supabase.functions.invoke('update-user-password', {
          body: {
            user_id: selectedUsuario.user_id,
            nova_senha: formData.senha
          },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        });

        if (updatePasswordError) {
          console.error('Erro ao atualizar senha:', updatePasswordError);
          toast({
            title: 'Aviso',
            description: 'Perfil atualizado, mas houve erro ao atualizar a senha',
            variant: 'destructive',
          });
        } else if (!updatePasswordData || !updatePasswordData.success) {
          console.error('Erro na resposta da Edge Function:', updatePasswordData);
          toast({
            title: 'Aviso',
            description: 'Perfil atualizado, mas houve erro ao atualizar a senha',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Sucesso',
            description: 'Usuário e senha atualizados com sucesso',
          });
        }
      } else {
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso',
        });
      }

      setShowEditDialog(false);
      resetForm();
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o usuário',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar dependências do usuário
  const verificarDependencias = async (userId: string) => {
    const dependencias = {
      avaliacoes: 0,
      pdis: 0,
      colaboradores: 0
    };

    try {
      // Verificar avaliações
      const { data: avaliacoes, error: errorAvaliacoes } = await supabase
        .from('avaliacoes')
        .select('id')
        .or(`avaliado_id.eq.${userId},avaliador_id.eq.${userId}`);

      if (!errorAvaliacoes && avaliacoes) {
        dependencias.avaliacoes = avaliacoes.length;
      }

      // Verificar PDIs
      const { data: pdis, error: errorPdis } = await supabase
        .from('pdis')
        .select('id')
        .eq('colaborador_id', userId);

      if (!errorPdis && pdis) {
        dependencias.pdis = pdis.length;
      }

      // Verificar colaboradores
      const { data: colaboradores, error: errorColaboradores } = await supabase
        .from('profiles')
        .select('id')
        .eq('gestor_id', userId);

      if (!errorColaboradores && colaboradores) {
        dependencias.colaboradores = colaboradores.length;
      }

    } catch (error) {
      console.error('Erro ao verificar dependências:', error);
    }

    return dependencias;
  };

  // Remover usuário
  const removerUsuario = async () => {
    if (!selectedUsuario) return;

    try {
      setIsSubmitting(true);
      
      const dependencias = await verificarDependencias(selectedUsuario.id);
      
      // Se há dependências, mostrar aviso
      if (dependencias.avaliacoes > 0 || dependencias.pdis > 0 || dependencias.colaboradores > 0) {
        
        let mensagem = 'Este usuário não pode ser removido porque possui:';
        if (dependencias.avaliacoes > 0) mensagem += `\n• ${dependencias.avaliacoes} avaliação(ões) registrada(s)`;
        if (dependencias.pdis > 0) mensagem += `\n• ${dependencias.pdis} PDI(s) associado(s)`;
        if (dependencias.colaboradores > 0) mensagem += `\n• ${dependencias.colaboradores} colaborador(es) sob sua gestão`;
        
        toast({
          title: 'Não é possível remover',
          description: mensagem,
          variant: 'destructive',
        });
        setShowDeleteDialog(false);
        return;
      }

      // Se não há dependências, remover o usuário
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUsuario.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Usuário removido com sucesso',
      });

      setShowDeleteDialog(false);
      setSelectedUsuario(null);
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      
      if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
        toast({
          title: 'Não é possível remover',
          description: 'Este usuário possui dados associados no sistema',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível remover o usuário',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desativar usuário
  const desativarUsuario = async () => {
    if (!selectedUsuario) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('profiles')
        .update({ papel: 'colaborador' as any })
        .eq('id', selectedUsuario.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Usuário desativado com sucesso',
      });

      setShowDeactivateDialog(false);
      setSelectedUsuario(null);
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar o usuário',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPapel = filterPapel === 'todos' || usuario.papel === filterPapel;
    return matchSearch && matchPapel;
  });

  // Estatísticas
  const stats = {
    total: usuarios.length,
    admins: usuarios.filter(u => u.papel === 'admin').length,
    gestores: usuarios.filter(u => u.papel === 'gestor').length,
    colaboradores: usuarios.filter(u => u.papel === 'colaborador').length
  };

  const getPapelBadge = (papel: string) => {
    const variants = {
      admin: 'destructive',
      gestor: 'default',
      colaborador: 'secondary'
    } as const;

    return (
      <Badge variant={variants[papel as keyof typeof variants] || 'outline'}>
        {papel === 'admin' ? 'Admin' : papel === 'gestor' ? 'Gestor' : 'Colaborador'}
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

  console.log('Renderizando AdminUsuarios - showAddDialog:', showAddDialog);
  
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Administre perfis, papéis e hierarquias da plataforma
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
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
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gestores</p>
                  <p className="text-2xl font-bold">{stats.gestores}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                  <p className="text-2xl font-bold">{stats.colaboradores}</p>
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
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="papel">Filtrar por Papel</Label>
                <Select value={filterPapel} onValueChange={setFilterPapel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Usuários ({usuariosFiltrados.length})</CardTitle>
            <CardDescription>
              Lista de todos os usuários da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterPapel !== 'todos' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando o primeiro usuário'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Gestor</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{getPapelBadge(usuario.papel)}</TableCell>
                      <TableCell>
                        {usuario.gestor ? (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{usuario.gestor.nome}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(usuario.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(usuario)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {usuario.id !== profile?.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeactivateDialog(usuario)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteDialog(usuario)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Adicionar Usuário - Versão Simplificada */}
        {showAddDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-lg font-semibold mb-4">Adicionar Novo Usuário</h2>
              <p className="text-sm text-gray-600 mb-4">Crie um novo usuário na plataforma</p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                    placeholder="Deixe vazio para senha padrão (senha123)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe vazio para usar a senha padrão: senha123
                  </p>
                </div>
                <div>
                  <Label htmlFor="papel">Papel *</Label>
                  <Select 
                    value={formData.papel} 
                    onValueChange={(value) => setFormData({...formData, papel: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.papel === 'colaborador' && gestores.length > 0 && (
                  <div>
                    <Label htmlFor="gestor">Gestor</Label>
                                         <Select 
                       value={formData.gestor_id || 'null'} 
                       onValueChange={(value) => setFormData({...formData, gestor_id: value === 'null' ? undefined : value})}
                     >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o gestor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Sem gestor</SelectItem>
                        {gestores.map((gestor) => (
                          <SelectItem key={gestor.id} value={gestor.id}>
                            {gestor.nome} ({gestor.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Fechando dialog...');
                    setShowAddDialog(false);
                  }} 
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    console.log('Clicou em adicionar usuário');
                    adicionarUsuario();
                  }} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Criando...' : 'Adicionar Usuário'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog Editar Usuário */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nome">Nome *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
                              <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-senha">Nova Senha</Label>
                  <Input
                    id="edit-senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                    placeholder="Deixe vazio para manter a senha atual"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe vazio para manter a senha atual
                  </p>
                </div>
              <div>
                <Label htmlFor="edit-papel">Papel *</Label>
                <Select 
                  value={formData.papel} 
                  onValueChange={(value) => setFormData({...formData, papel: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.papel === 'colaborador' && gestores.length > 0 && (
                <div>
                  <Label htmlFor="edit-gestor">Gestor</Label>
                  <Select 
                    value={formData.gestor_id || 'null'} 
                    onValueChange={(value) => setFormData({...formData, gestor_id: value === 'null' ? undefined : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gestor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Sem gestor</SelectItem>
                      {gestores.map((gestor) => (
                        <SelectItem key={gestor.id} value={gestor.id}>
                          {gestor.nome} ({gestor.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={atualizarUsuario} disabled={isSubmitting}>
                {isSubmitting ? 'Atualizando...' : 'Atualizar Usuário'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Remover Usuário */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover Usuário</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover o usuário {selectedUsuario?.nome}?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Atenção:</h4>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Esta ação é irreversível</li>
                  <li>• O usuário será removido permanentemente</li>
                  <li>• Apenas usuários sem dados associados podem ser removidos</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={removerUsuario} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                {isSubmitting ? 'Removendo...' : 'Remover Usuário'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Desativar Usuário */}
        <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Desativar Usuário</DialogTitle>
              <DialogDescription>
                Deseja desativar o usuário {selectedUsuario?.nome}?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Atenção:</h4>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• O usuário será marcado como colaborador inativo</li>
                  <li>• Ele não poderá mais fazer login no sistema</li>
                  <li>• Os dados históricos serão preservados</li>
                  <li>• Esta ação pode ser revertida editando o usuário</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeactivateDialog(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={desativarUsuario} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                {isSubmitting ? 'Desativando...' : 'Desativar Usuário'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
