import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar,
  User,
  TrendingUp,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PDI = Database['public']['Tables']['pdis']['Row'];
type Avaliacao = Database['public']['Tables']['avaliacoes']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface PDIData extends PDI {
  avaliacao: Avaliacao;
  colaborador: Profile;
}

export default function VisualizarPDI() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [pdis, setPdis] = useState<PDIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPDI, setSelectedPDI] = useState<PDIData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Carregar PDIs
  const loadPDIs = async () => {
    try {
      let query = supabase
        .from('pdis')
        .select(`
          *,
          avaliacao:avaliacoes(*),
          colaborador:profiles!pdis_colaborador_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      // Filtrar baseado no papel do usuário
      if (profile?.papel === 'gestor') {
        // Gestor vê PDIs de seus colaboradores
        query = query.eq('colaborador.gestor_id', profile.id);
      } else if (profile?.papel === 'colaborador') {
        // Colaborador vê apenas seus PDIs
        query = query.eq('colaborador_id', profile.id);
      }
      // Admin vê todos os PDIs

      const { data, error } = await query;

      if (error) throw error;
      setPdis(data || []);
    } catch (error) {
      console.error('Erro ao carregar PDIs:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os PDIs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Imprimir PDI
  const imprimirPDI = (pdi: PDIData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PDI - ${pdi.colaborador.nome}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${pdi.plano_html}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print()">Imprimir</button>
              <button onclick="window.close()">Fechar</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Download PDI como PDF (simulado)
  const downloadPDI = (pdi: PDIData) => {
    toast({
      title: 'Funcionalidade em Desenvolvimento',
      description: 'Download em PDF será implementado em breve',
    });
  };

  useEffect(() => {
    loadPDIs();
  }, []);

  const getNivelBadge = (nivel: string) => {
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
              <p className="text-muted-foreground">Carregando PDIs...</p>
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
              Planos de Desenvolvimento Individual (PDI)
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie os PDIs gerados
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de PDIs</p>
                  <p className="text-2xl font-bold">{pdis.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold">
                    {pdis.filter(pdi => {
                      const pdiDate = new Date(pdi.created_at);
                      const now = new Date();
                      return pdiDate.getMonth() === now.getMonth() && 
                             pdiDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
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
                  <p className="text-sm font-medium text-muted-foreground">Sênior</p>
                  <p className="text-2xl font-bold">
                    {pdis.filter(pdi => pdi.avaliacao.nivel_calculado === 'senior').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Semana</p>
                  <p className="text-2xl font-bold">
                    {pdis.filter(pdi => {
                      const pdiDate = new Date(pdi.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return pdiDate >= weekAgo;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de PDIs */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>PDIs Gerados</CardTitle>
            <CardDescription>
              Lista de todos os planos de desenvolvimento individual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pdis.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum PDI encontrado</h3>
                <p className="text-muted-foreground">
                  {profile?.papel === 'gestor' 
                    ? 'Realize avaliações para gerar PDIs automaticamente.'
                    : 'Seus PDIs aparecerão aqui após avaliações.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pdis.map((pdi) => (
                  <div key={pdi.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{pdi.colaborador.nome}</h3>
                          {getNivelBadge(pdi.avaliacao.nivel_calculado)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <strong>Pontuação:</strong> {pdi.avaliacao.pontuacao_total}/100
                          </div>
                          <div>
                            <strong>Data:</strong> {new Date(pdi.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <strong>Email:</strong> {pdi.colaborador.email}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPDI(pdi);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => imprimirPDI(pdi)}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Imprimir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPDI(pdi)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Preview */}
        {showPreview && selectedPDI && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  PDI - {selectedPDI.colaborador.nome}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => imprimirPDI(selectedPDI)}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedPDI.plano_html }}
                  className="prose max-w-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
