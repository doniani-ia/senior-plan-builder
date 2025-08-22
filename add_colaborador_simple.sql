-- Script simples para adicionar colaboradores
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar gestores disponíveis
SELECT 
  p.id as gestor_id,
  p.nome as gestor_nome,
  p.email as gestor_email
FROM public.profiles p
WHERE p.papel = 'gestor'
ORDER BY p.created_at DESC;

-- 2. Adicionar colaboradores de teste (substitua o gestor_id pelo ID real)
-- Descomente e execute uma linha por vez:

-- Colaborador 1
INSERT INTO public.profiles (user_id, nome, email, papel, gestor_id) VALUES
(
  gen_random_uuid(),
  'João Silva',
  'joao.silva@exemplo.com',
  'colaborador',
  'SUBSTITUA_PELO_ID_DO_GESTOR'
);

-- Colaborador 2
INSERT INTO public.profiles (user_id, nome, email, papel, gestor_id) VALUES
(
  gen_random_uuid(),
  'Maria Santos',
  'maria.santos@exemplo.com',
  'colaborador',
  'SUBSTITUA_PELO_ID_DO_GESTOR'
);

-- Colaborador 3
INSERT INTO public.profiles (user_id, nome, email, papel, gestor_id) VALUES
(
  gen_random_uuid(),
  'Pedro Costa',
  'pedro.costa@exemplo.com',
  'colaborador',
  'SUBSTITUA_PELO_ID_DO_GESTOR'
);

-- 3. Verificar se foram criados
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
