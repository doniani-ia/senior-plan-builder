-- Script para corrigir as políticas RLS da tabela avaliacoes
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar políticas RLS atuais da tabela avaliacoes
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
WHERE tablename = 'avaliacoes'
ORDER BY policyname;

-- 2. Remover políticas problemáticas
DROP POLICY IF EXISTS "Admin pode ver todas as avaliações" ON public.avaliacoes;
DROP POLICY IF EXISTS "Gestor pode ver avaliações de seus colaboradores" ON public.avaliacoes;
DROP POLICY IF EXISTS "Colaborador pode ver suas próprias avaliações" ON public.avaliacoes;
DROP POLICY IF EXISTS "Sistema pode inserir avaliações" ON public.avaliacoes;

-- 3. Criar políticas RLS corretas para avaliacoes
-- Política para SELECT (visualizar avaliações)
CREATE POLICY "Admin pode ver todas as avaliações" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Gestor pode ver avaliações de seus colaboradores" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.id = avaliado_id
    )
  );

CREATE POLICY "Colaborador pode ver suas próprias avaliações" ON public.avaliacoes
  FOR SELECT TO authenticated USING (
    avaliado_id = auth.uid()
  );

-- Política para INSERT (criar avaliações)
CREATE POLICY "Gestor pode criar avaliações" ON public.avaliacoes
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.id = avaliado_id
    )
  );

-- Política para UPDATE (atualizar avaliações)
CREATE POLICY "Gestor pode atualizar suas avaliações" ON public.avaliacoes
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.id = avaliado_id
    )
  );

-- Política para DELETE (deletar avaliações)
CREATE POLICY "Gestor pode deletar suas avaliações" ON public.avaliacoes
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.id = avaliado_id
    )
  );

-- 4. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'avaliacoes';

-- 5. Habilitar RLS se não estiver
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

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
WHERE tablename = 'avaliacoes'
ORDER BY policyname;
