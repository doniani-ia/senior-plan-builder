-- Script simples para configurar tabelas PDI
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela acoes_pdi existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'acoes_pdi'
) as acoes_pdi_exists;

-- 2. Se não existir, criar a tabela
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'acoes_pdi'
  ) THEN
    CREATE TABLE public.acoes_pdi (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      categoria TEXT NOT NULL CHECK (categoria IN ('tecnico', 'processo', 'comportamento')),
      nivel_minimo nivel_senioridade NOT NULL,
      nivel_maximo nivel_senioridade NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      prazo_sugerido INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Tabela acoes_pdi criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela acoes_pdi já existe';
  END IF;
END $$;

-- 3. Verificar se a tabela pdis existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pdis'
) as pdis_exists;

-- 4. Se não existir, criar a tabela
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pdis'
  ) THEN
    CREATE TABLE public.pdis (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      avaliacao_id UUID NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
      colaborador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      plano_html TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Tabela pdis criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela pdis já existe';
  END IF;
END $$;

-- 5. Habilitar RLS
ALTER TABLE public.acoes_pdi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdis ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
DO $$
BEGIN
  -- Política para acoes_pdi
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'acoes_pdi' 
    AND policyname = 'Todos podem ler ações PDI'
  ) THEN
    CREATE POLICY "Todos podem ler ações PDI" ON public.acoes_pdi
      FOR SELECT TO authenticated USING (true);
    RAISE NOTICE 'Política para acoes_pdi criada';
  END IF;
  
  -- Políticas para pdis
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pdis' 
    AND policyname = 'Sistema pode inserir PDIs'
  ) THEN
    CREATE POLICY "Sistema pode inserir PDIs" ON public.pdis
      FOR INSERT TO authenticated WITH CHECK (true);
    RAISE NOTICE 'Política de inserção para pdis criada';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pdis' 
    AND policyname = 'Admin pode ver todos os PDIs'
  ) THEN
    CREATE POLICY "Admin pode ver todos os PDIs" ON public.pdis
      FOR SELECT TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND papel = 'admin'
        )
      );
    RAISE NOTICE 'Política de admin para pdis criada';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pdis' 
    AND policyname = 'Gestor pode ver PDIs de seus colaboradores'
  ) THEN
    CREATE POLICY "Gestor pode ver PDIs de seus colaboradores" ON public.pdis
      FOR SELECT TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.profiles p1
          JOIN public.profiles p2 ON p1.id = p2.gestor_id
          WHERE p1.id = auth.uid() 
          AND p1.papel = 'gestor'
          AND p2.id = colaborador_id
        )
      );
    RAISE NOTICE 'Política de gestor para pdis criada';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pdis' 
    AND policyname = 'Colaborador pode ver seus próprios PDIs'
  ) THEN
    CREATE POLICY "Colaborador pode ver seus próprios PDIs" ON public.pdis
      FOR SELECT TO authenticated USING (
        colaborador_id = auth.uid()
      );
    RAISE NOTICE 'Política de colaborador para pdis criada';
  END IF;
END $$;

-- 7. Inserir ações PDI básicas (apenas se não existirem)
DO $$
BEGIN
  -- Verificar se já existem ações
  IF NOT EXISTS (SELECT 1 FROM public.acoes_pdi LIMIT 1) THEN
    INSERT INTO public.acoes_pdi (categoria, nivel_minimo, nivel_maximo, titulo, descricao, prazo_sugerido)
    VALUES
      -- Ações Técnicas para Júnior
      ('tecnico', 'junior', 'junior', 'Estudar Fundamentos de Programação', 'Dedicar tempo para estudar conceitos básicos de programação, estruturas de dados e algoritmos simples.', 30),
      ('tecnico', 'junior', 'junior', 'Aprender uma Nova Linguagem', 'Escolher e aprender uma nova linguagem de programação para expandir conhecimentos técnicos.', 45),
      ('tecnico', 'junior', 'junior', 'Praticar Testes Unitários', 'Implementar testes unitários em projetos pessoais para melhorar a qualidade do código.', 20),
      
      -- Ações de Processo para Júnior
      ('processo', 'junior', 'junior', 'Participar de Code Reviews', 'Participar ativamente de code reviews, tanto como revisor quanto como autor.', 10),
      ('processo', 'junior', 'junior', 'Documentar Código', 'Criar documentação clara para código e processos desenvolvidos.', 15),
      ('processo', 'junior', 'junior', 'Aprender Metodologias Ágeis', 'Estudar e aplicar conceitos de metodologias ágeis como Scrum e Kanban.', 30),
      
      -- Ações Comportamentais para Júnior
      ('comportamento', 'junior', 'junior', 'Desenvolver Comunicação', 'Melhorar habilidades de comunicação com a equipe e stakeholders.', 30),
      ('comportamento', 'junior', 'junior', 'Buscar Feedback', 'Proativamente solicitar feedback sobre trabalho e desenvolvimento.', 10),
      ('comportamento', 'junior', 'junior', 'Aprender com Erros', 'Analisar e aprender com erros cometidos para evitar repetição.', 15),
      
      -- Ações Técnicas para Pleno
      ('tecnico', 'pleno', 'pleno', 'Arquitetar Soluções', 'Desenvolver habilidades para arquitetar soluções escaláveis e performáticas.', 60),
      ('tecnico', 'pleno', 'pleno', 'Otimizar Performance', 'Aprender técnicas de otimização de código e identificação de gargalos.', 45),
      ('tecnico', 'pleno', 'pleno', 'Implementar Testes Avançados', 'Desenvolver testes de integração e end-to-end além dos unitários.', 30),
      
      -- Ações de Processo para Pleno
      ('processo', 'pleno', 'pleno', 'Liderar Code Reviews', 'Assumir papel de liderança em code reviews e mentoria de juniores.', 20),
      ('processo', 'pleno', 'pleno', 'Melhorar Estimativas', 'Refinar habilidades de estimativa para projetos complexos.', 30),
      ('processo', 'pleno', 'pleno', 'Participar de Decisões Técnicas', 'Contribuir ativamente em decisões arquiteturais e técnicas.', 15),
      
      -- Ações Comportamentais para Pleno
      ('comportamento', 'pleno', 'pleno', 'Desenvolver Liderança', 'Cultivar habilidades de liderança técnica e de equipe.', 45),
      ('comportamento', 'pleno', 'pleno', 'Melhorar Comunicação', 'Aprimorar comunicação com stakeholders e apresentações técnicas.', 30),
      ('comportamento', 'pleno', 'pleno', 'Tomar Responsabilidade', 'Assumir responsabilidade por projetos e resultados da equipe.', 20),
      
      -- Ações Técnicas para Sênior
      ('tecnico', 'senior', 'senior', 'Arquitetar Sistemas Complexos', 'Desenvolver arquiteturas de sistemas complexos e distribuídos.', 90),
      ('tecnico', 'senior', 'senior', 'Otimizar Performance Global', 'Otimizar performance de sistemas em larga escala.', 60),
      ('tecnico', 'senior', 'senior', 'Implementar Segurança', 'Desenvolver e implementar práticas de segurança em aplicações.', 45),
      
      -- Ações de Processo para Sênior
      ('processo', 'senior', 'senior', 'Definir Padrões Técnicos', 'Estabelecer padrões e melhores práticas para a organização.', 40),
      ('processo', 'senior', 'senior', 'Liderar Transformação Digital', 'Liderar iniciativas de transformação digital e inovação.', 75),
      ('processo', 'senior', 'senior', 'Mentorar Equipes', 'Desenvolver programas de mentoria e desenvolvimento de equipes.', 60),
      
      -- Ações Comportamentais para Sênior
      ('comportamento', 'senior', 'senior', 'Liderança Executiva', 'Desenvolver habilidades de liderança executiva e estratégica.', 90),
      ('comportamento', 'senior', 'senior', 'Comunicação Executiva', 'Aprimorar comunicação com executivos e stakeholders de alto nível.', 45),
      ('comportamento', 'senior', 'senior', 'Pensamento Estratégico', 'Desenvolver pensamento estratégico e visão de longo prazo.', 60);
    
    RAISE NOTICE 'Ações PDI inseridas com sucesso';
  ELSE
    RAISE NOTICE 'Ações PDI já existem, pulando inserção';
  END IF;
END $$;

-- 8. Verificar resultado
SELECT 
  'acoes_pdi' as tabela,
  COUNT(*) as total_registros
FROM public.acoes_pdi
UNION ALL
SELECT 
  'pdis' as tabela,
  COUNT(*) as total_registros
FROM public.pdis;

-- 9. Verificar ações por categoria e nível
SELECT 
  categoria,
  nivel_minimo,
  COUNT(*) as total_acoes
FROM public.acoes_pdi
GROUP BY categoria, nivel_minimo
ORDER BY nivel_minimo, categoria;
