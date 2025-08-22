-- Script para verificar a estrutura das tabelas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela profiles
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 3. Verificar se existe constraint unique no user_id
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public'
AND kcu.column_name = 'user_id';

-- 4. Verificar dados atuais
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN papel = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN papel = 'gestor' THEN 1 END) as gestores,
  COUNT(CASE WHEN papel = 'colaborador' THEN 1 END) as colaboradores
FROM public.profiles;

-- 5. Verificar se há user_id duplicados
SELECT 
  user_id,
  COUNT(*) as count
FROM public.profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 6. Verificar se há emails duplicados
SELECT 
  email,
  COUNT(*) as count
FROM public.profiles
GROUP BY email
HAVING COUNT(*) > 1;
