import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Clock } from 'lucide-react';

export default function AvaliarColaborador() {
  return (
    <Layout>
      <div className="space-y-8">
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

        <Card className="shadow-professional-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Funcionalidade em Desenvolvimento</span>
            </CardTitle>
            <CardDescription>
              O formulário de avaliação será implementado na próxima etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Em breve</h3>
              <p className="text-muted-foreground">
                Esta funcionalidade será implementada no item C do roadmap
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}