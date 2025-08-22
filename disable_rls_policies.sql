-- Desabilitar RLS temporariamente para desenvolvimento
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS em todas as tabelas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_pdi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdis DISABLE ROW LEVEL SECURITY;

-- Verificar se as políticas foram desabilitadas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'questionarios', 'perguntas', 'avaliacoes', 'respostas', 'acoes_pdi', 'pdis');
