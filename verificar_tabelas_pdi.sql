-- Script para verificar se as tabelas pdis e acoes_pdi existem e estão corretas
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela pdis existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pdis' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a tabela acoes_pdi existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'acoes_pdi' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há dados nas tabelas
SELECT 'pdis' as tabela, COUNT(*) as total_registros FROM public.pdis
UNION ALL
SELECT 'acoes_pdi' as tabela, COUNT(*) as total_registros FROM public.acoes_pdi;

-- 4. Verificar constraints das tabelas
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('pdis', 'acoes_pdi')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 5. Se a tabela acoes_pdi não existir, criar:
/*
CREATE TABLE IF NOT EXISTS public.acoes_pdi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria TEXT NOT NULL CHECK (categoria IN ('tecnico', 'processo', 'comportamento')),
  nivel_minimo TEXT NOT NULL CHECK (nivel_minimo IN ('junior', 'pleno', 'senior')),
  nivel_maximo TEXT NOT NULL CHECK (nivel_maximo IN ('junior', 'pleno', 'senior')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prazo_sugerido INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Se a tabela pdis não existir, criar:
CREATE TABLE IF NOT EXISTS public.pdis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plano_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Adicionar RLS se necessário:
ALTER TABLE public.acoes_pdi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdis ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para acoes_pdi (todos podem ler)
CREATE POLICY "Todos podem ler ações PDI" ON public.acoes_pdi
  FOR SELECT TO authenticated USING (true);

-- 9. Políticas RLS para pdis
CREATE POLICY "Admin pode ver todos os PDIs" ON public.pdis
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND papel = 'admin'
    )
  );

CREATE POLICY "Gestor pode ver PDIs de seus colaboradores" ON public.pdis
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      JOIN public.profiles p2 ON p1.id = p2.gestor_id
      WHERE p1.id = auth.uid() 
      AND p1.papel = 'gestor'
      AND p2.id = colaborador_id
    )
  );

CREATE POLICY "Colaborador pode ver seus próprios PDIs" ON public.pdis
  FOR SELECT TO authenticated USING (
    colaborador_id = auth.uid()
  );

CREATE POLICY "Sistema pode inserir PDIs" ON public.pdis
  FOR INSERT TO authenticated WITH CHECK (true);
*/
