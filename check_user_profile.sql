-- Script para verificar o perfil do usuário atual
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar todos os usuários e seus perfis
SELECT 
  p.id,
  p.user_id,
  p.nome,
  p.email,
  p.papel,
  p.created_at,
  p.updated_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- 2. Verificar se existe algum admin
SELECT 
  COUNT(*) as total_admins,
  COUNT(CASE WHEN papel = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN papel = 'gestor' THEN 1 END) as gestores,
  COUNT(CASE WHEN papel = 'colaborador' THEN 1 END) as colaboradores
FROM public.profiles;

-- 3. Se não existir admin, criar um (substitua pelo seu email)
-- Descomente e execute se necessário:
/*
UPDATE public.profiles 
SET papel = 'admin' 
WHERE email = 'seu-email@exemplo.com';
*/
