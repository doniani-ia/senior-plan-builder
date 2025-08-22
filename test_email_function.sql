-- Script para testar a Edge Function de email
-- Execute este script APÓS configurar o Resend e fazer deploy da função

-- 1. Verificar se há PDIs para testar
SELECT 
  p.id as pdi_id,
  p.created_at,
  c.nome as colaborador_nome,
  c.email as colaborador_email,
  g.nome as gestor_nome,
  g.email as gestor_email,
  a.pontuacao_total,
  a.nivel_calculado
FROM public.pdis p
JOIN public.avaliacoes a ON p.avaliacao_id = a.id
JOIN public.profiles c ON p.colaborador_id = c.id
JOIN public.profiles g ON a.avaliador_id = g.id
ORDER BY p.created_at DESC
LIMIT 5;

-- 2. Testar a Edge Function manualmente (substitua PDI_ID pelo ID real)
-- SELECT net.http_post(
--   url := 'https://' || current_setting('request.headers')['x-forwarded-host'] || '/functions/v1/send_pdi_email',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer ' || current_setting('request.headers')['authorization']
--   ),
--   body := jsonb_build_object('pdi_id', 'PDI_ID_AQUI')
-- );

-- 3. Verificar logs da Edge Function (se disponível)
-- SELECT * FROM supabase_functions.logs 
-- WHERE function_name = 'send_pdi_email'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- 4. Verificar se o trigger está ativo
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_pdi_email';

-- 5. Verificar se a função handle_pdi_created existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_pdi_created';

-- 6. Instruções para teste manual
SELECT 
  'Para testar manualmente:' as instrucao,
  '1. Copie um PDI_ID da consulta acima' as passo1,
  '2. Descomente a linha 2 do script' as passo2,
  '3. Substitua PDI_ID_AQUI pelo ID real' as passo3,
  '4. Execute a consulta' as passo4;
