-- Script para verificar o status atual das tabelas PDI
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as existe
FROM (VALUES ('acoes_pdi'), ('pdis')) as t(table_name);

-- 2. Verificar estrutura da tabela acoes_pdi
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'acoes_pdi' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela pdis
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pdis' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar se há dados nas tabelas
SELECT 
  'acoes_pdi' as tabela,
  COUNT(*) as total_registros
FROM public.acoes_pdi
UNION ALL
SELECT 
  'pdis' as tabela,
  COUNT(*) as total_registros
FROM public.pdis;

-- 5. Verificar políticas RLS
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
WHERE tablename IN ('acoes_pdi', 'pdis')
ORDER BY tablename, policyname;

-- 6. Verificar ações PDI por categoria e nível
SELECT 
  categoria,
  nivel_minimo,
  COUNT(*) as total_acoes
FROM public.acoes_pdi
GROUP BY categoria, nivel_minimo
ORDER BY nivel_minimo, categoria;

-- 7. Verificar algumas ações de exemplo
SELECT 
  id,
  categoria,
  nivel_minimo,
  titulo,
  prazo_sugerido
FROM public.acoes_pdi
LIMIT 5;
