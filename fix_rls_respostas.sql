-- Script para corrigir as políticas RLS da tabela respostas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar políticas RLS atuais da tabela respostas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'respostas'
ORDER BY policyname;

-- 2. Remover políticas problemáticas
DROP POLICY IF EXISTS "Admin pode ver todas as respostas" ON public.respostas;
DROP POLICY IF EXISTS "Gestor pode ver respostas de seus colaboradores" ON public.respostas;
DROP POLICY IF EXISTS "Colaborador pode ver suas próprias respostas" ON public.respostas;
DROP POLICY IF EXISTS "Sistema pode inserir respostas" ON public.respostas;

-- 3. Criar políticas RLS corretas para respostas
-- Política para SELECT (visualizar respostas)
CREATE POLICY "Admin pode ver todas as respostas" ON public.respostas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Gestor pode ver respostas de seus colaboradores" ON public.respostas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.gestor_id = p1.id
      AND a.id = avaliacao_id
    )
  );

CREATE POLICY "Colaborador pode ver suas próprias respostas" ON public.respostas
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      WHERE a.avaliado_id = auth.uid()
      AND a.id = avaliacao_id
    )
  );

-- Política para INSERT (criar respostas)
CREATE POLICY "Gestor pode criar respostas" ON public.respostas
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.gestor_id = p1.id
      AND a.id = avaliacao_id
    )
  );

-- Política para UPDATE (atualizar respostas)
CREATE POLICY "Gestor pode atualizar respostas" ON public.respostas
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.gestor_id = p1.id
      AND a.id = avaliacao_id
    )
  );

-- Política para DELETE (deletar respostas)
CREATE POLICY "Gestor pode deletar respostas" ON public.respostas
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.avaliacoes a
      JOIN public.profiles p1 ON a.avaliador_id = p1.id
      JOIN public.profiles p2 ON a.avaliado_id = p2.id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.gestor_id = p1.id
      AND a.id = avaliacao_id
    )
  );

-- 4. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'respostas';

-- 5. Habilitar RLS se não estiver
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'respostas'
ORDER BY policyname;
