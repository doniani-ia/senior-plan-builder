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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Star,
  Calculator,
  Save,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Questionario = Database['public']['Tables']['questionarios']['Row'];
type Pergunta = Database['public']['Tables']['perguntas']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface Resposta {
  pergunta_id: string;
  valor: number;
}

interface AvaliacaoForm {
  questionario_id: string;
  avaliado_id: string;
  observacoes: string;
  respostas: Resposta[];
}

export default function AvaliarColaborador() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionarioAtivo, setQuestionarioAtivo] = useState<Questionario | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [colaboradores, setColaboradores] = useState<Profile[]>([]);
  const [form, setForm] = useState<AvaliacaoForm>({
    questionario_id: '',
    avaliado_id: '',
    observacoes: '',
    respostas: []
  });
  const [pontuacaoAtual, setPontuacaoAtual] = useState(0);
  const [nivelCalculado, setNivelCalculado] = useState<'junior' | 'pleno' | 'senior'>('junior');

  // Carregar questionário ativo
  const loadQuestionarioAtivo = async () => {
    try {
      const { data, error } = await supabase
        .from('questionarios')
        .select('*')
        .eq('status', 'ativo')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao carregar questionário ativo:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o questionário ativo',
          variant: 'destructive',
        });
        return;
      }

      setQuestionarioAtivo(data);
      setForm(prev => ({ ...prev, questionario_id: data.id }));
      
      // Carregar perguntas do questionário
      await loadPerguntas(data.id);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // Carregar perguntas
  const loadPerguntas = async (questionarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('perguntas')
        .select('*')
        .eq('questionario_id', questionarioId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      
      setPerguntas(data || []);
      
      // Inicializar respostas
      const respostasIniciais = data?.map(pergunta => ({
        pergunta_id: pergunta.id,
        valor: 0
      })) || [];
      
      setForm(prev => ({ ...prev, respostas: respostasIniciais }));
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  };

  // Carregar colaboradores do gestor
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
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    }
  };

  // Calcular pontuação
  const calcularPontuacao = (respostas: Resposta[]) => {
    let pontuacaoTotal = 0;
    let pesoTotal = 0;

    respostas.forEach(resposta => {
      const pergunta = perguntas.find(p => p.id === resposta.pergunta_id);
      if (pergunta && resposta.valor > 0) {
        pontuacaoTotal += (resposta.valor * pergunta.peso);
        pesoTotal += pergunta.peso;
      }
    });

    const pontuacaoNormalizada = pesoTotal > 0 ? (pontuacaoTotal / pesoTotal) * 20 : 0;
    return Math.round(pontuacaoNormalizada * 100) / 100;
  };

  // Determinar nível baseado na pontuação
  const determinarNivel = (pontuacao: number): 'junior' | 'pleno' | 'senior' => {
    if (pontuacao < 40) return 'junior';
    if (pontuacao < 70) return 'pleno';
    return 'senior';
  };

  // Atualizar resposta
  const updateResposta = (perguntaId: string, valor: number) => {
    const novasRespostas = form.respostas.map(resposta =>
      resposta.pergunta_id === perguntaId ? { ...resposta, valor } : resposta
    );
    
    setForm(prev => ({ ...prev, respostas: novasRespostas }));
    
    // Calcular pontuação atual
    const pontuacao = calcularPontuacao(novasRespostas);
    setPontuacaoAtual(pontuacao);
    setNivelCalculado(determinarNivel(pontuacao));
  };

  // Gerar PDI
  const gerarPDI = async (avaliacaoId: string, colaboradorId: string, nivel: string) => {
    try {
      console.log('=== INICIANDO GERAÇÃO DE PDI ===');
      console.log('Avaliação ID:', avaliacaoId);
      console.log('Colaborador ID:', colaboradorId);
      console.log('Nível:', nivel);
      
      // 1. Buscar ações PDI baseadas no nível
      console.log('=== BUSCANDO AÇÕES PDI ===');
      const { data: acoesPDI, error: errorAcoes } = await supabase
        .from('acoes_pdi')
        .select('*')
        .eq('nivel_minimo', nivel)
        .order('categoria', { ascending: true });

      if (errorAcoes) {
        console.error('=== ERRO AO BUSCAR AÇÕES PDI ===');
        console.error('Código:', errorAcoes.code);
        console.error('Mensagem:', errorAcoes.message);
        console.error('Detalhes:', errorAcoes.details);
        throw errorAcoes;
      }

      console.log('Ações PDI encontradas:', acoesPDI?.length || 0);

      // Se não há ações PDI, retornar true (PDI será gerado sem ações)
      if (!acoesPDI || acoesPDI.length === 0) {
        console.log('=== NENHUMA AÇÃO PDI ENCONTRADA ===');
        console.log('Gerando PDI básico sem ações específicas');
        const planoHTML = gerarPlanoHTML([], nivel, pontuacaoAtual);
        
        console.log('=== SALVANDO PDI BÁSICO ===');
        const { error: errorPDI } = await supabase
          .from('pdis')
          .insert({
            avaliacao_id: avaliacaoId,
            colaborador_id: colaboradorId,
            plano_html: planoHTML
          });

        if (errorPDI) {
          console.error('=== ERRO AO SALVAR PDI BÁSICO ===');
          console.error('Código:', errorPDI.code);
          console.error('Mensagem:', errorPDI.message);
          console.error('Detalhes:', errorPDI.details);
          throw errorPDI;
        }
        
        console.log('=== PDI BÁSICO SALVO COM SUCESSO ===');
        return true;
      }

      // 2. Agrupar ações por categoria
      console.log('=== AGRUPANDO AÇÕES POR CATEGORIA ===');
      const acoesPorCategoria = acoesPDI.reduce((acc, acao) => {
        if (!acc[acao.categoria]) {
          acc[acao.categoria] = [];
        }
        acc[acao.categoria].push(acao);
        return acc;
      }, {} as Record<string, typeof acoesPDI>);

      console.log('Categorias encontradas:', Object.keys(acoesPorCategoria));

      // 3. Selecionar 3-5 ações por categoria
      const acoesSelecionadas = Object.entries(acoesPorCategoria).map(([categoria, acoes]) => {
        // Selecionar até 5 ações por categoria, priorizando as mais relevantes
        return acoes.slice(0, 5);
      }).flat();

      console.log('Ações selecionadas:', acoesSelecionadas.length);

      // 4. Gerar HTML do plano
      console.log('=== GERANDO HTML DO PLANO ===');
      const planoHTML = gerarPlanoHTML(acoesSelecionadas, nivel, pontuacaoAtual);
      console.log('HTML gerado com sucesso, tamanho:', planoHTML.length);

      // 5. Salvar PDI
      console.log('=== SALVANDO PDI ===');
      const { error: errorPDI } = await supabase
        .from('pdis')
        .insert({
          avaliacao_id: avaliacaoId,
          colaborador_id: colaboradorId,
          plano_html: planoHTML
        });

      if (errorPDI) {
        console.error('=== ERRO AO SALVAR PDI ===');
        console.error('Código:', errorPDI.code);
        console.error('Mensagem:', errorPDI.message);
        console.error('Detalhes:', errorPDI.details);
        console.error('Hint:', errorPDI.hint);
        throw errorPDI;
      }

                        console.log('=== PDI GERADO COM SUCESSO ===');
                  
                  // 6. Enviar email via Edge Function
                  console.log('=== ENVIANDO EMAIL ===');
                  try {
                    const { data: functionData, error: functionError } = await supabase.functions.invoke('send_pdi_email', {
                      body: { pdi_id: avaliacao.id }
                    });
                    
                    if (functionError) {
                      console.error('Erro ao enviar email:', functionError);
                    } else {
                      console.log('Email enviado com sucesso:', functionData);
                    }
                  } catch (emailError) {
                    console.error('Erro ao chamar função de email:', emailError);
                  }
                  
                  return true;
    } catch (error) {
      console.error('=== ERRO AO GERAR PDI ===');
      console.error('Tipo de erro:', typeof error);
      console.error('Erro completo:', error);
      return false;
    }
  };

  // Gerar HTML do plano
  const gerarPlanoHTML = (acoes: any[], nivel: string, pontuacao: number) => {
    const acoesPorCategoria = acoes.reduce((acc, acao) => {
      if (!acc[acao.categoria]) {
        acc[acao.categoria] = [];
      }
      acc[acao.categoria].push(acao);
      return acc;
    }, {} as Record<string, any[]>);

    const nivelDisplay = nivel === 'junior' ? 'Júnior' : nivel === 'pleno' ? 'Pleno' : 'Sênior';
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // Se não há ações, mostrar mensagem informativa
    const acoesHTML = Object.keys(acoesPorCategoria).length > 0 
      ? Object.entries(acoesPorCategoria).map(([categoria, acoesCategoria]) => `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #2563eb; text-transform: capitalize; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #2563eb;">
              ${categoria}
            </h3>
            ${acoesCategoria.map((acao, index) => `
              <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
                <h4 style="color: #374151; margin-bottom: 8px; font-size: 16px;">
                  ${index + 1}. ${acao.titulo}
                </h4>
                <p style="color: #6b7280; margin-bottom: 10px; line-height: 1.5;">
                  ${acao.descricao}
                </p>
                ${acao.prazo_sugerido ? `
                  <div style="background: #fef3c7; padding: 8px 12px; border-radius: 4px; display: inline-block;">
                    <strong style="color: #92400e;">Prazo Sugerido:</strong> ${acao.prazo_sugerido} dias
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')
      : `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center;">
            <h3 style="color: #92400e; margin-bottom: 10px;">Ações de Desenvolvimento</h3>
            <p style="color: #92400e; line-height: 1.6;">
              Nenhuma ação específica foi encontrada para o nível ${nivelDisplay}. 
              Recomenda-se consultar com o gestor para definir ações personalizadas de desenvolvimento.
            </p>
          </div>
        `;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Plano de Desenvolvimento Individual (PDI)</h1>
          <p style="color: #6b7280; font-size: 16px;">Gerado em ${dataAtual}</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Resumo da Avaliação</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <strong>Nível Atual:</strong> ${nivelDisplay}
            </div>
            <div>
              <strong>Pontuação:</strong> ${pontuacao}/100
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Ações de Desenvolvimento</h2>
          ${acoesHTML}
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <h3 style="color: #1f2937; margin-bottom: 10px;">Próximos Passos</h3>
          <ul style="color: #374151; line-height: 1.6;">
            <li>Revisar e priorizar as ações propostas</li>
            <li>Definir prazos específicos para cada ação</li>
            <li>Agendar acompanhamentos regulares com o gestor</li>
            <li>Documentar progresso e conquistas</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Este PDI foi gerado automaticamente com base na avaliação de competências.
          </p>
        </div>
      </div>
    `;
  };

  // Salvar avaliação
  const salvarAvaliacao = async () => {
    console.log('=== INICIANDO SALVAMENTO DE AVALIAÇÃO ===');
    
    if (!form.avaliado_id) {
      console.log('Erro: Nenhum colaborador selecionado');
      toast({
        title: 'Erro',
        description: 'Selecione um colaborador para avaliar',
        variant: 'destructive',
      });
      return;
    }

    const respostasValidas = form.respostas.filter(r => r.valor > 0);
    console.log('Respostas válidas encontradas:', respostasValidas.length);
    
    if (respostasValidas.length === 0) {
      console.log('Erro: Nenhuma resposta válida');
      toast({
        title: 'Erro',
        description: 'Responda pelo menos uma pergunta',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      console.log('=== DADOS DA AVALIAÇÃO ===');
      console.log('Questionário ID:', form.questionario_id);
      console.log('Avaliado ID:', form.avaliado_id);
      console.log('Avaliador ID:', profile!.id);
      console.log('Pontuação Total:', pontuacaoAtual);
      console.log('Nível Calculado:', nivelCalculado);
      console.log('Observações:', form.observacoes);

      // 1. Salvar avaliação
      console.log('=== SALVANDO AVALIAÇÃO ===');
      const { data: avaliacao, error: errorAvaliacao } = await supabase
        .from('avaliacoes')
        .insert({
          questionario_id: form.questionario_id,
          avaliado_id: form.avaliado_id,
          avaliador_id: profile!.id,
          pontuacao_total: pontuacaoAtual,
          nivel_calculado: nivelCalculado,
          observacoes: form.observacoes
        })
        .select()
        .single();

      if (errorAvaliacao) {
        console.error('=== ERRO AO SALVAR AVALIAÇÃO ===');
        console.error('Código:', errorAvaliacao.code);
        console.error('Mensagem:', errorAvaliacao.message);
        console.error('Detalhes:', errorAvaliacao.details);
        console.error('Hint:', errorAvaliacao.hint);
        throw errorAvaliacao;
      }

      console.log('=== AVALIAÇÃO SALVA COM SUCESSO ===');
      console.log('Avaliação ID:', avaliacao.id);

      // 2. Salvar respostas
      console.log('=== SALVANDO RESPOSTAS ===');
      const respostasParaSalvar = form.respostas
        .filter(r => r.valor > 0)
        .map(r => ({
          avaliacao_id: avaliacao.id,
          pergunta_id: r.pergunta_id,
          valor: r.valor
        }));

      console.log('Respostas para salvar:', respostasParaSalvar);

      const { error: errorRespostas } = await supabase
        .from('respostas')
        .insert(respostasParaSalvar);

      if (errorRespostas) {
        console.error('=== ERRO AO SALVAR RESPOSTAS ===');
        console.error('Código:', errorRespostas.code);
        console.error('Mensagem:', errorRespostas.message);
        console.error('Detalhes:', errorRespostas.details);
        console.error('Hint:', errorRespostas.hint);
        throw errorRespostas;
      }

      console.log('=== RESPOSTAS SALVAS COM SUCESSO ===');

      // 3. Gerar PDI automaticamente
      console.log('=== INICIANDO GERAÇÃO DE PDI ===');
      const pdiGerado = await gerarPDI(avaliacao.id, form.avaliado_id, nivelCalculado);

      if (pdiGerado) {
        console.log('=== PDI GERADO COM SUCESSO ===');
        toast({
          title: 'Sucesso',
          description: 'Avaliação salva e PDI gerado com sucesso!',
        });
      } else {
        console.log('=== PROBLEMA AO GERAR PDI ===');
        toast({
          title: 'Avaliação Salva',
          description: 'Avaliação salva, mas houve um problema ao gerar o PDI.',
          variant: 'default',
        });
      }

      // Resetar formulário
      console.log('=== RESETANDO FORMULÁRIO ===');
      setForm({
        questionario_id: form.questionario_id,
        avaliado_id: '',
        observacoes: '',
        respostas: form.respostas.map(r => ({ ...r, valor: 0 }))
      });
      setPontuacaoAtual(0);
      setNivelCalculado('junior');

    } catch (error) {
      console.error('=== ERRO GERAL ===');
      console.error('Tipo de erro:', typeof error);
      console.error('Erro completo:', error);
      
      let errorMessage = 'Não foi possível salvar a avaliação';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message as string;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      console.log('=== SALVAMENTO FINALIZADO ===');
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        loadQuestionarioAtivo(),
        loadColaboradores()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center justify-center py-12">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando formulário...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!questionarioAtivo) {
    return (
      <Layout>
        <div className="space-y-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span>Nenhum Questionário Ativo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Não há questionários ativos disponíveis para avaliação.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const perguntasPorCategoria = perguntas.reduce((acc, pergunta) => {
    if (!acc[pergunta.categoria]) {
      acc[pergunta.categoria] = [];
    }
    acc[pergunta.categoria].push(pergunta);
    return acc;
  }, {} as Record<string, Pergunta[]>);

  const colaboradorSelecionado = colaboradores.find(c => c.id === form.avaliado_id);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Avaliar Colaborador
            </h1>
            <p className="text-muted-foreground mt-1">
              Realize avaliações de senioridade para sua equipe
            </p>
          </div>
        </div>

        {/* Informações do Questionário */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>{questionarioAtivo.titulo}</span>
            </CardTitle>
            <CardDescription>
              {questionarioAtivo.descricao}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">v{questionarioAtivo.versao}</Badge>
                <span className="text-sm text-muted-foreground">Versão</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{perguntas.length}</span>
                <span className="text-sm text-muted-foreground">Perguntas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Colaborador */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Selecionar Colaborador</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="colaborador">Colaborador *</Label>
                <Select
                  value={form.avaliado_id}
                  onValueChange={(value) => setForm(prev => ({ ...prev, avaliado_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um colaborador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((colaborador) => (
                      <SelectItem key={colaborador.id} value={colaborador.id}>
                        {colaborador.nome} ({colaborador.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {colaboradorSelecionado && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Colaborador Selecionado:</h4>
                  <p className="text-sm text-muted-foreground">
                    {colaboradorSelecionado.nome} - {colaboradorSelecionado.email}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pontuação Atual */}
        {pontuacaoAtual > 0 && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span>Pontuação Atual</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{pontuacaoAtual}/100</span>
                  <Badge 
                    variant={
                      nivelCalculado === 'senior' ? 'default' :
                      nivelCalculado === 'pleno' ? 'secondary' : 'outline'
                    }
                    className={
                      nivelCalculado === 'senior' ? 'bg-green-100 text-green-800' :
                      nivelCalculado === 'pleno' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {nivelCalculado === 'senior' ? 'Sênior' :
                     nivelCalculado === 'pleno' ? 'Pleno' : 'Júnior'}
                  </Badge>
                </div>
                <Progress value={pontuacaoAtual} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-medium">Júnior</div>
                    <div className="text-muted-foreground">0-39</div>
                  </div>
                  <div>
                    <div className="font-medium">Pleno</div>
                    <div className="text-muted-foreground">40-69</div>
                  </div>
                  <div>
                    <div className="font-medium">Sênior</div>
                    <div className="text-muted-foreground">70-100</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Perguntas */}
        {form.avaliado_id && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-primary" />
                <span>Perguntas de Avaliação</span>
              </CardTitle>
              <CardDescription>
                Avalie cada pergunta usando a escala de 1 a 5, onde 1 = Discordo Totalmente e 5 = Concordo Totalmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(perguntasPorCategoria).map(([categoria, perguntasCategoria]) => (
                  <div key={categoria}>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold capitalize">{categoria}</h3>
                      <Separator className="mt-2" />
                    </div>
                    
                    <div className="space-y-6">
                      {perguntasCategoria.map((pergunta) => {
                        const resposta = form.respostas.find(r => r.pergunta_id === pergunta.id);
                        
                        return (
                          <div key={pergunta.id} className="p-4 border rounded-lg">
                            <div className="mb-4">
                              <div className="flex items-start justify-between mb-2">
                                <Label className="text-sm font-medium leading-relaxed">
                                  {pergunta.ordem}. {pergunta.texto}
                                </Label>
                                <Badge variant="outline" className="ml-2">
                                  Peso: {pergunta.peso}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Discordo Totalmente</span>
                                <span>Concordo Totalmente</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {[1, 2, 3, 4, 5].map((valor) => (
                                  <Button
                                    key={valor}
                                    type="button"
                                    variant={resposta?.valor === valor ? "default" : "outline"}
                                    size="sm"
                                    className="flex-1 h-10"
                                    onClick={() => updateResposta(pergunta.id, valor)}
                                  >
                                    {valor}
                                  </Button>
                                ))}
                              </div>
                              
                              {resposta?.valor && (
                                <div className="text-sm text-muted-foreground">
                                  Resposta selecionada: {resposta.valor}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {form.avaliado_id && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Observações Adicionais</CardTitle>
              <CardDescription>
                Adicione comentários ou observações sobre a avaliação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Digite suas observações..."
                value={form.observacoes}
                onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
                rows={4}
              />
            </CardContent>
          </Card>
        )}

        {/* Botão Salvar */}
        {form.avaliado_id && (
          <div className="flex justify-end">
            <Button 
              onClick={salvarAvaliacao}
              disabled={saving || pontuacaoAtual === 0}
              className="min-w-[200px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Avaliação
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}