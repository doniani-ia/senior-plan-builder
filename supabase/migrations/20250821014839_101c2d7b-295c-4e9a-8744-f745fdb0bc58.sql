-- Criar enum para papéis de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'gestor', 'colaborador');

-- Criar enum para status de questionário
CREATE TYPE public.questionario_status AS ENUM ('ativo', 'inativo', 'rascunho');

-- Criar enum para níveis de senioridade
CREATE TYPE public.nivel_senioridade AS ENUM ('junior', 'pleno', 'senior');

-- Tabela de perfis conectada ao Auth
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  papel user_role NOT NULL DEFAULT 'colaborador',
  gestor_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de questionários
CREATE TABLE public.questionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  versao INTEGER NOT NULL DEFAULT 1,
  status questionario_status NOT NULL DEFAULT 'rascunho',
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de perguntas
CREATE TABLE public.perguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionario_id UUID REFERENCES public.questionarios(id) ON DELETE CASCADE NOT NULL,
  texto TEXT NOT NULL,
  peso NUMERIC(3,2) NOT NULL CHECK (peso > 0 AND peso <= 10),
  categoria TEXT NOT NULL, -- 'tecnico', 'processo', 'comportamento'
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de avaliações
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionario_id UUID REFERENCES public.questionarios(id) NOT NULL,
  avaliado_id UUID REFERENCES public.profiles(id) NOT NULL,
  avaliador_id UUID REFERENCES public.profiles(id) NOT NULL,
  pontuacao_total NUMERIC(5,2) NOT NULL,
  nivel_calculado nivel_senioridade NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de respostas
CREATE TABLE public.respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID REFERENCES public.avaliacoes(id) ON DELETE CASCADE NOT NULL,
  pergunta_id UUID REFERENCES public.perguntas(id) NOT NULL,
  valor INTEGER NOT NULL CHECK (valor >= 1 AND valor <= 5), -- Escala Likert 1-5
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de ações do PDI
CREATE TABLE public.acoes_pdi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL, -- 'tecnico', 'processo', 'comportamento'
  nivel_minimo nivel_senioridade NOT NULL,
  nivel_maximo nivel_senioridade NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prazo_sugerido INTEGER, -- em dias
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de PDIs
CREATE TABLE public.pdis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID REFERENCES public.avaliacoes(id) NOT NULL,
  colaborador_id UUID REFERENCES public.profiles(id) NOT NULL,
  plano_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_pdi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdis ENABLE ROW LEVEL SECURITY;

-- Função para verificar papel do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT papel FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Função para verificar se é gestor de um colaborador
CREATE OR REPLACE FUNCTION public.is_manager_of(colaborador_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p1
    JOIN public.profiles p2 ON p1.id = p2.gestor_id
    WHERE p1.user_id = auth.uid() AND p2.user_id = colaborador_user_id
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Policies para profiles
CREATE POLICY "Admin pode ver todos os perfis" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Gestor pode ver seus colaboradores" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() = 'gestor' AND 
    (user_id = auth.uid() OR gestor_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Colaborador pode ver apenas seu perfil" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin pode inserir perfis" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admin pode atualizar perfis" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'admin');

-- Policies para questionários
CREATE POLICY "Admin pode tudo em questionários" ON public.questionarios
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Gestores podem ver questionários ativos" ON public.questionarios
  FOR SELECT TO authenticated
  USING (public.get_user_role() IN ('gestor', 'colaborador') AND status = 'ativo');

-- Policies para perguntas
CREATE POLICY "Admin pode tudo em perguntas" ON public.perguntas
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Gestores podem ver perguntas de questionários ativos" ON public.perguntas
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('gestor', 'colaborador') AND
    EXISTS(SELECT 1 FROM public.questionarios WHERE id = questionario_id AND status = 'ativo')
  );

-- Policies para avaliações
CREATE POLICY "Admin pode ver todas as avaliações" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Gestor pode ver avaliações de seus colaboradores" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() = 'gestor' AND
    public.is_manager_of((SELECT user_id FROM public.profiles WHERE id = avaliado_id))
  );

CREATE POLICY "Colaborador pode ver suas avaliações" ON public.avaliacoes
  FOR SELECT TO authenticated
  USING (avaliado_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Gestor pode criar avaliações" ON public.avaliacoes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_role() = 'gestor' AND
    avaliador_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    public.is_manager_of((SELECT user_id FROM public.profiles WHERE id = avaliado_id))
  );

-- Policies para respostas
CREATE POLICY "Respostas seguem política de avaliações" ON public.respostas
  FOR ALL TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM public.avaliacoes 
      WHERE id = avaliacao_id AND (
        public.get_user_role() = 'admin' OR
        (public.get_user_role() = 'gestor' AND public.is_manager_of((SELECT user_id FROM public.profiles WHERE id = avaliado_id))) OR
        avaliado_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
    )
  );

-- Policies para ações PDI
CREATE POLICY "Admin pode tudo em ações PDI" ON public.acoes_pdi
  FOR ALL TO authenticated
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Outros podem ver ações PDI" ON public.acoes_pdi
  FOR SELECT TO authenticated
  USING (public.get_user_role() IN ('gestor', 'colaborador'));

-- Policies para PDIs
CREATE POLICY "Admin pode ver todos os PDIs" ON public.pdis
  FOR SELECT TO authenticated
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Gestor pode ver PDIs de seus colaboradores" ON public.pdis
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() = 'gestor' AND
    public.is_manager_of((SELECT user_id FROM public.profiles WHERE id = colaborador_id))
  );

CREATE POLICY "Colaborador pode ver seus PDIs" ON public.pdis
  FOR SELECT TO authenticated
  USING (colaborador_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Gestor pode criar PDIs" ON public.pdis
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_role() = 'gestor' AND
    public.is_manager_of((SELECT user_id FROM public.profiles WHERE id = colaborador_id))
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questionarios_updated_at
  BEFORE UPDATE ON public.questionarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Popular ações PDI de exemplo
INSERT INTO public.acoes_pdi (categoria, nivel_minimo, nivel_maximo, titulo, descricao, prazo_sugerido) VALUES
-- Técnico
('tecnico', 'junior', 'junior', 'Fundamentos de Programação', 'Estudar conceitos básicos de lógica de programação e algoritmos', 30),
('tecnico', 'junior', 'pleno', 'Frameworks Modernos', 'Aprender frameworks atuais da stack tecnológica da empresa', 60),
('tecnico', 'pleno', 'senior', 'Arquitetura de Software', 'Estudar padrões de arquitetura e design patterns avançados', 90),
-- Processo
('processo', 'junior', 'junior', 'Metodologias Ágeis', 'Compreender Scrum e práticas ágeis de desenvolvimento', 45),
('processo', 'junior', 'pleno', 'DevOps e CI/CD', 'Implementar pipelines de integração e entrega contínua', 75),
('processo', 'pleno', 'senior', 'Gestão Técnica', 'Desenvolver habilidades de liderança técnica e mentoria', 120),
-- Comportamental
('comportamento', 'junior', 'junior', 'Comunicação Efetiva', 'Melhorar habilidades de comunicação técnica e apresentação', 30),
('comportamento', 'junior', 'pleno', 'Trabalho em Equipe', 'Fortalecer colaboração e resolução de conflitos', 60),
('comportamento', 'pleno', 'senior', 'Liderança', 'Desenvolver capacidade de inspirar e guiar equipes', 90);