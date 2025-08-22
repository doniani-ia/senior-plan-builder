-- Script para desabilitar todas as políticas RLS durante o desenvolvimento
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Desabilitar RLS em todas as tabelas principais
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_pdi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdis DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas RLS existentes
-- Profiles
DROP POLICY IF EXISTS "Usuário pode ver seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Trigger pode inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuário pode atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admin pode ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gestor pode ver seus colaboradores" ON public.profiles;

-- Questionarios
DROP POLICY IF EXISTS "Admin pode ver todos os questionários" ON public.questionarios;
DROP POLICY IF EXISTS "Admin pode criar questionários" ON public.questionarios;
DROP POLICY IF EXISTS "Admin pode atualizar questionários" ON public.questionarios;
DROP POLICY IF EXISTS "Admin pode deletar questionários" ON public.questionarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ver questionários ativos" ON public.questionarios;

-- Perguntas
DROP POLICY IF EXISTS "Admin pode ver todas as perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Admin pode criar perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Admin pode atualizar perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Admin pode deletar perguntas" ON public.perguntas;
DROP POLICY IF EXISTS "Usuários autenticados podem ver perguntas" ON public.perguntas;

-- Avaliacoes
DROP POLICY IF EXISTS "Admin pode ver todas as avaliações" ON public.avaliacoes;
DROP POLICY IF EXISTS "Gestor pode ver avaliações de seus colaboradores" ON public.avaliacoes;
DROP POLICY IF EXISTS "Colaborador pode ver suas próprias avaliações" ON public.avaliacoes;
DROP POLICY IF EXISTS "Gestor pode criar avaliações" ON public.avaliacoes;
DROP POLICY IF EXISTS "Gestor pode atualizar suas avaliações" ON public.avaliacoes;
DROP POLICY IF EXISTS "Gestor pode deletar suas avaliações" ON public.avaliacoes;

-- Respostas
DROP POLICY IF EXISTS "Admin pode ver todas as respostas" ON public.respostas;
DROP POLICY IF EXISTS "Gestor pode ver respostas de seus colaboradores" ON public.respostas;
DROP POLICY IF EXISTS "Colaborador pode ver suas próprias respostas" ON public.respostas;
DROP POLICY IF EXISTS "Gestor pode criar respostas" ON public.respostas;
DROP POLICY IF EXISTS "Gestor pode atualizar respostas" ON public.respostas;
DROP POLICY IF EXISTS "Gestor pode deletar respostas" ON public.respostas;

-- Acoes PDI
DROP POLICY IF EXISTS "Admin pode ver todas as ações PDI" ON public.acoes_pdi;
DROP POLICY IF EXISTS "Admin pode criar ações PDI" ON public.acoes_pdi;
DROP POLICY IF EXISTS "Admin pode atualizar ações PDI" ON public.acoes_pdi;
DROP POLICY IF EXISTS "Admin pode deletar ações PDI" ON public.acoes_pdi;
DROP POLICY IF EXISTS "Usuários autenticados podem ver ações PDI" ON public.acoes_pdi;

-- PDIs
DROP POLICY IF EXISTS "Admin pode ver todos os PDIs" ON public.pdis;
DROP POLICY IF EXISTS "Gestor pode ver PDIs de seus colaboradores" ON public.pdis;
DROP POLICY IF EXISTS "Colaborador pode ver seus próprios PDIs" ON public.pdis;
DROP POLICY IF EXISTS "Sistema pode criar PDIs" ON public.pdis;
DROP POLICY IF EXISTS "Gestor pode atualizar PDIs" ON public.pdis;
DROP POLICY IF EXISTS "Gestor pode deletar PDIs" ON public.pdis;

-- 3. Verificar status das tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'questionarios', 'perguntas', 'avaliacoes', 'respostas', 'acoes_pdi', 'pdis')
ORDER BY tablename;

-- 4. Verificar se ainda existem políticas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'questionarios', 'perguntas', 'avaliacoes', 'respostas', 'acoes_pdi', 'pdis')
ORDER BY tablename, policyname;

-- 5. Mensagem de confirmação
SELECT 'RLS desabilitado com sucesso! Agora você pode desenvolver sem restrições de permissão.' as status;
