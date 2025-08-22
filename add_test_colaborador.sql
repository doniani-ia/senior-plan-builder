-- Script para adicionar um colaborador de teste
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos verificar se existe um gestor
SELECT 
  p.id,
  p.nome,
  p.email,
  p.papel
FROM public.profiles p
WHERE p.papel = 'gestor'
ORDER BY p.created_at DESC
LIMIT 1;

-- 2. Se você quiser adicionar um colaborador de teste, descomente e execute:
-- (Substitua o gestor_id pelo ID do gestor encontrado acima)
/*
INSERT INTO public.profiles (user_id, nome, email, papel, gestor_id) VALUES
(
  gen_random_uuid(), -- user_id temporário
  'João Silva',
  'joao.silva@exemplo.com',
  'colaborador',
  'ID_DO_GESTOR_AQUI' -- Substitua pelo ID real do gestor
);
*/

-- 3. Ou, se você quiser criar um usuário completo (incluindo auth):
-- Primeiro crie o usuário no auth.users manualmente no Supabase Dashboard
-- Depois execute:
/*
INSERT INTO public.profiles (user_id, nome, email, papel, gestor_id) VALUES
(
  'USER_ID_DO_AUTH', -- ID do usuário criado no auth
  'Maria Santos',
  'maria.santos@exemplo.com',
  'colaborador',
  'GESTOR_ID_AQUI'
);
*/

-- 4. Verificar se foi criado
SELECT 
  p.id,
  p.nome,
  p.email,
  p.papel,
  g.nome as gestor_nome
FROM public.profiles p
LEFT JOIN public.profiles g ON p.gestor_id = g.id
WHERE p.papel = 'colaborador'
ORDER BY p.created_at DESC;
