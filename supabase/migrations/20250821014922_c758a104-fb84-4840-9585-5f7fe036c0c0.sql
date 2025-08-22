-- Corrigir funções para definir search_path adequadamente para segurança
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT papel FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_manager_of(colaborador_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p1.id = p2.gestor_id
    WHERE p1.user_id = auth.uid() AND p2.user_id = colaborador_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, papel)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    'colaborador'
  );
  RETURN NEW;
END;
$$;

-- Corrigir políticas RLS para permitir acesso ao próprio perfil
-- O problema é que as políticas dependem de get_user_role() que precisa do perfil

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Admin pode ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Gestor pode ver seus colaboradores" ON public.profiles;
DROP POLICY IF EXISTS "Colaborador pode ver apenas seu perfil" ON public.profiles;

-- Criar política simples que permite acesso ao próprio perfil
CREATE POLICY "Usuário pode ver seu próprio perfil" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Permitir que admins vejam todos os perfis (quando implementado)
-- CREATE POLICY "Admin pode ver todos os perfis" ON public.profiles
--   FOR SELECT TO authenticated
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE user_id = auth.uid() AND papel = 'admin'
--   ));

-- Permitir inserção de perfis pelo trigger
CREATE POLICY "Trigger pode inserir perfis" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Permitir atualização do próprio perfil
CREATE POLICY "Usuário pode atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());