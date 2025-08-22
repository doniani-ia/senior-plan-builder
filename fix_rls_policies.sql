-- Corrigir políticas RLS para permitir acesso ao próprio perfil
-- Execute este script no SQL Editor do Supabase Dashboard

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Admin pode ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gestor pode ver seus colaboradores" ON public.profiles;
DROP POLICY IF EXISTS "Colaborador pode ver apenas seu perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admin pode inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admin pode atualizar perfis" ON public.profiles;

-- Criar política simples que permite acesso ao próprio perfil
CREATE POLICY "Usuário pode ver seu próprio perfil" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Permitir inserção de perfis pelo trigger
CREATE POLICY "Trigger pode inserir perfis" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Permitir atualização do próprio perfil
CREATE POLICY "Usuário pode atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
