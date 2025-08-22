-- Script para corrigir a tabela profiles
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos verificar a constraint atual
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%user_id%';

-- 2. Remover a constraint UNIQUE do user_id (se existir)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- 3. Remover a foreign key para auth.users (se existir)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 4. Alterar user_id para permitir NULL temporariamente
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- 5. Verificar se a alteração foi feita
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'user_id';

-- 6. Agora você pode inserir colaboradores sem user_id
-- Teste inserindo um colaborador:
INSERT INTO public.profiles (nome, email, papel, gestor_id) VALUES
(
  'João Silva',
  'joao.silva@exemplo.com',
  'colaborador',
  (SELECT id FROM public.profiles WHERE papel = 'gestor' LIMIT 1)
);

-- 7. Verificar se foi inserido
SELECT 
  p.id,
  p.nome,
  p.email,
  p.papel,
  p.user_id,
  g.nome as gestor_nome
FROM public.profiles p
LEFT JOIN public.profiles g ON p.gestor_id = g.id
WHERE p.papel = 'colaborador'
ORDER BY p.created_at DESC;
