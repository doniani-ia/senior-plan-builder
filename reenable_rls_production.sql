-- Script para reabilitar RLS e políticas de segurança em produção
-- Execute este script APÓS o desenvolvimento estar concluído

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_pdi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdis ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para profiles
CREATE POLICY "Usuário pode ver seu próprio perfil" ON public.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Trigger pode inserir perfis" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuário pode atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 3. Criar políticas para questionarios
CREATE POLICY "Admin pode ver todos os questionários" ON public.questionarios
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode criar questionários" ON public.questionarios
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode atualizar questionários" ON public.questionarios
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode deletar questionários" ON public.questionarios
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Usuários autenticados podem ver questionários ativos" ON public.questionarios
  FOR SELECT TO authenticated USING (status = 'ativo');

-- 4. Criar políticas para perguntas
CREATE POLICY "Admin pode ver todas as perguntas" ON public.perguntas
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode criar perguntas" ON public.perguntas
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode atualizar perguntas" ON public.perguntas
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode deletar perguntas" ON public.perguntas
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Usuários autenticados podem ver perguntas" ON public.perguntas
  FOR SELECT TO authenticated USING (true);

-- 5. Criar políticas para avaliacoes
CREATE POLICY "Admin pode ver todas as avaliações" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Gestor pode ver avaliações de seus colaboradores" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.id = avaliado_id
    )
  );

CREATE POLICY "Colaborador pode ver suas próprias avaliações" ON public.avaliacoes
  FOR SELECT TO authenticated USING (avaliado_id = auth.uid());

CREATE POLICY "Gestor pode criar avaliações" ON public.avaliacoes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.id = avaliado_id
    )
  );

CREATE POLICY "Gestor pode atualizar suas avaliações" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.id = avaliado_id
    )
  );

CREATE POLICY "Gestor pode deletar suas avaliações" ON public.avaliacoes
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.id = avaliado_id
    )
  );

-- 6. Criar políticas para respostas
CREATE POLICY "Admin pode ver todas as respostas" ON public.respostas
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Gestor pode ver respostas de seus colaboradores" ON public.respostas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.gestor_id = p1.id AND a.id = avaliacao_id
    )
  );

CREATE POLICY "Colaborador pode ver suas próprias respostas" ON public.respostas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      WHERE a.avaliado_id = auth.uid() AND a.id = avaliacao_id
    )
  );

CREATE POLICY "Gestor pode criar respostas" ON public.respostas
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.gestor_id = p1.id AND a.id = avaliacao_id
    )
  );

CREATE POLICY "Gestor pode atualizar respostas" ON public.respostas
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.gestor_id = p1.id AND a.id = avaliacao_id
    )
  );

CREATE POLICY "Gestor pode deletar respostas" ON public.respostas
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.gestor_id = p1.id AND a.id = avaliacao_id
    )
  );

-- 7. Criar políticas para acoes_pdi
CREATE POLICY "Admin pode ver todas as ações PDI" ON public.acoes_pdi
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode criar ações PDI" ON public.acoes_pdi
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode atualizar ações PDI" ON public.acoes_pdi
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Admin pode deletar ações PDI" ON public.acoes_pdi
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Usuários autenticados podem ver ações PDI" ON public.acoes_pdi
  FOR SELECT TO authenticated USING (true);

-- 8. Criar políticas para pdis
CREATE POLICY "Admin pode ver todos os PDIs" ON public.pdis
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND papel = 'admin')
  );

CREATE POLICY "Gestor pode ver PDIs de seus colaboradores" ON public.pdis
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.id = colaborador_id
    )
  );

CREATE POLICY "Colaborador pode ver seus próprios PDIs" ON public.pdis
  FOR SELECT TO authenticated USING (colaborador_id = auth.uid());

CREATE POLICY "Sistema pode criar PDIs" ON public.pdis
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Gestor pode atualizar PDIs" ON public.pdis
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.id = colaborador_id
    )
  );

CREATE POLICY "Gestor pode deletar PDIs" ON public.pdis
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() AND p1.papel = 'gestor' AND p2.id = colaborador_id
    )
  );

-- 9. Verificar status final
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'questionarios', 'perguntas', 'avaliacoes', 'respostas', 'acoes_pdi', 'pdis')
ORDER BY tablename;

SELECT 'RLS reabilitado com sucesso! Todas as políticas de segurança estão ativas.' as status;
