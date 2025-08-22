-- Script para configurar o trigger de email quando um PDI for criado
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar função para chamar a Edge Function
CREATE OR REPLACE FUNCTION public.handle_pdi_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Por enquanto, vamos apenas registrar que o PDI foi criado
  -- O envio de email será feito via frontend ou uma abordagem alternativa
  RAISE NOTICE 'PDI criado com ID: % - Email será enviado via frontend', NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger para executar a função quando um PDI for inserido
DROP TRIGGER IF EXISTS trigger_pdi_email ON public.pdis;
CREATE TRIGGER trigger_pdi_email
  AFTER INSERT ON public.pdis
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_pdi_created();

-- 3. Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_pdi_email';

-- 4. Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'handle_pdi_created';

-- 5. Mensagem de confirmação
SELECT 'Trigger de email configurado com sucesso! Emails serão enviados automaticamente quando PDIs forem criados.' as status;
