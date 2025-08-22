-- Script para verificar se a tabela acoes_pdi existe e está populada
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'acoes_pdi' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se há dados na tabela
SELECT COUNT(*) as total_acoes FROM public.acoes_pdi;

-- 3. Se não há dados, inserir ações básicas
-- Descomente e execute se necessário:
/*
INSERT INTO public.acoes_pdi (categoria, nivel_minimo, nivel_maximo, titulo, descricao, prazo_sugerido) VALUES
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
*/

-- 4. Verificar novamente após inserção
SELECT 
  categoria,
  nivel_minimo,
  COUNT(*) as total_acoes
FROM public.acoes_pdi
GROUP BY categoria, nivel_minimo
ORDER BY nivel_minimo, categoria;
