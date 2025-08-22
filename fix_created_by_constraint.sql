-- Script para corrigir a constraint do campo created_by
-- Execute este script no SQL Editor do Supabase Dashboard

-- Remover a constraint NOT NULL do campo created_by
ALTER TABLE public.questionarios ALTER COLUMN created_by DROP NOT NULL;

-- Verificar a estrutura da tabela
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;
