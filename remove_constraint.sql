-- Script para remover a constraint problemática
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar as constraints existentes
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.questionarios'::regclass;

-- 2. Remover a constraint problemática (se existir)
ALTER TABLE public.questionarios DROP CONSTRAINT IF EXISTS questionarios_created_by_nullable;

-- 3. Verificar novamente as constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.questionarios'::regclass;

-- 4. Verificar se o campo created_by pode ser NULL
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
AND table_schema = 'public'
AND column_name = 'created_by';
