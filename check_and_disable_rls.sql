-- Verificar status atual das políticas RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'questionarios', 'perguntas', 'avaliacoes', 'respostas', 'acoes_pdi', 'pdis');

-- Desabilitar RLS em todas as tabelas se necessário
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_pdi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdis DISABLE ROW LEVEL SECURITY;

-- Verificar novamente após desabilitar
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'questionarios', 'perguntas', 'avaliacoes', 'respostas', 'acoes_pdi', 'pdis');

-- Teste simples de consulta
SELECT COUNT(*) as total_usuarios FROM public.profiles;
