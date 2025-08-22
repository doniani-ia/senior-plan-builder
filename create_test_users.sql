-- Script para criar usuários de teste
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos verificar se já existem usuários
SELECT 
  p.id,
  p.nome,
  p.email,
  p.papel,
  p.gestor_id,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- 2. Se não existir gestor, vamos criar um (substitua pelo email desejado)
-- Descomente e execute se necessário:
/*
UPDATE public.profiles 
SET papel = 'gestor' 
WHERE email = 'seu-email-gestor@exemplo.com';
*/

-- 3. Criar colaboradores de teste (se não existirem)
-- Descomente e execute se necessário:
/*
INSERT INTO public.profiles (user_id, nome, email, papel, gestor_id) VALUES
(
  (SELECT id FROM auth.users WHERE email = 'gestor@exemplo.com' LIMIT 1),
  'João Silva',
  'joao.silva@exemplo.com',
  'colaborador',
  (SELECT id FROM public.profiles WHERE papel = 'gestor' LIMIT 1)
),
(
  (SELECT id FROM auth.users WHERE email = 'maria.santos@exemplo.com' LIMIT 1),
  'Maria Santos',
  'maria.santos@exemplo.com',
  'colaborador',
  (SELECT id FROM public.profiles WHERE papel = 'gestor' LIMIT 1)
),
(
  (SELECT id FROM auth.users WHERE email = 'pedro.costa@exemplo.com' LIMIT 1),
  'Pedro Costa',
  'pedro.costa@exemplo.com',
  'colaborador',
  (SELECT id FROM public.profiles WHERE papel = 'gestor' LIMIT 1)
);
*/

-- 4. Verificar a estrutura atual
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN papel = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN papel = 'gestor' THEN 1 END) as gestores,
  COUNT(CASE WHEN papel = 'colaborador' THEN 1 END) as colaboradores
FROM public.profiles;

-- 5. Verificar relacionamentos gestor-colaborador
SELECT 
  g.nome as gestor,
  g.email as gestor_email,
  COUNT(c.id) as total_colaboradores
FROM public.profiles g
LEFT JOIN public.profiles c ON g.id = c.gestor_id AND c.papel = 'colaborador'
WHERE g.papel = 'gestor'
GROUP BY g.id, g.nome, g.email
ORDER BY g.nome;
