-- Script simplificado para configurar o trigger de email
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar função simples para registrar criação de PDI
CREATE OR REPLACE FUNCTION public.handle_pdi_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar que o PDI foi criado (para logs)
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
SELECT 'Trigger simplificado configurado! O envio de email será feito via frontend.' as status;
