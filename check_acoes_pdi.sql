-- Script para verificar e popular ações PDI
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se existem ações PDI
SELECT 
  COUNT(*) as total_acoes,
  COUNT(CASE WHEN categoria = 'tecnico' THEN 1 END) as tecnicas,
  COUNT(CASE WHEN categoria = 'processo' THEN 1 END) as processo,
  COUNT(CASE WHEN categoria = 'comportamento' THEN 1 END) as comportamento
FROM public.acoes_pdi;

-- 2. Verificar ações por nível
SELECT 
  nivel_minimo,
  nivel_maximo,
  categoria,
  COUNT(*) as total
FROM public.acoes_pdi
GROUP BY nivel_minimo, nivel_maximo, categoria
ORDER BY nivel_minimo, categoria;

-- 3. Se não existirem ações, inserir algumas de exemplo
-- Descomente e execute se necessário:
/*
INSERT INTO public.acoes_pdi (categoria, nivel_minimo, nivel_maximo, titulo, descricao, prazo_sugerido) VALUES
-- Ações Técnicas para Júnior
('tecnico', 'junior', 'junior', 'Estudar Fundamentos de Programação', 'Dedicar tempo para estudar conceitos básicos de programação, estruturas de dados e algoritmos simples.', 30),
('tecnico', 'junior', 'junior', 'Aprender uma Nova Linguagem', 'Escolher e aprender uma nova linguagem de programação para expandir conhecimentos técnicos.', 45),
('tecnico', 'junior', 'junior', 'Praticar Testes Unitários', 'Implementar testes unitários em projetos pessoais para melhorar a qualidade do código.', 20),
('tecnico', 'junior', 'junior', 'Estudar Padrões de Projeto', 'Aprender e aplicar padrões de projeto básicos como Singleton, Factory e Observer.', 40),
('tecnico', 'junior', 'junior', 'Melhorar Conhecimento de Git', 'Aprofundar conhecimentos em Git, incluindo branches, merges e resolução de conflitos.', 15),

-- Ações de Processo para Júnior
('processo', 'junior', 'junior', 'Participar de Code Reviews', 'Participar ativamente de code reviews, tanto como revisor quanto como autor.', 10),
('processo', 'junior', 'junior', 'Documentar Código', 'Criar documentação clara para código e processos desenvolvidos.', 15),
('processo', 'junior', 'junior', 'Aprender Metodologias Ágeis', 'Estudar e aplicar conceitos de metodologias ágeis como Scrum e Kanban.', 30),
('processo', 'junior', 'junior', 'Melhorar Estimativas', 'Trabalhar na precisão das estimativas de tempo para tarefas de desenvolvimento.', 25),
('processo', 'junior', 'junior', 'Participar de Cerimônias', 'Participar ativamente de daily standups, plannings e retrospectives.', 5),

-- Ações Comportamentais para Júnior
('comportamento', 'junior', 'junior', 'Desenvolver Comunicação', 'Melhorar habilidades de comunicação com a equipe e stakeholders.', 30),
('comportamento', 'junior', 'junior', 'Buscar Feedback', 'Proativamente solicitar feedback sobre trabalho e desenvolvimento.', 10),
('comportamento', 'junior', 'junior', 'Aprender com Erros', 'Analisar e aprender com erros cometidos para evitar repetição.', 15),
('comportamento', 'junior', 'junior', 'Desenvolver Proatividade', 'Tomar iniciativa em tarefas e projetos sem esperar direcionamento.', 20),
('comportamento', 'junior', 'junior', 'Melhorar Organização', 'Desenvolver habilidades de organização e gestão de tempo.', 25),

-- Ações Técnicas para Pleno
('tecnico', 'pleno', 'pleno', 'Arquitetar Soluções', 'Desenvolver habilidades para arquitetar soluções escaláveis e performáticas.', 60),
('tecnico', 'pleno', 'pleno', 'Otimizar Performance', 'Aprender técnicas de otimização de código e identificação de gargalos.', 45),
('tecnico', 'pleno', 'pleno', 'Implementar Testes Avançados', 'Desenvolver testes de integração e end-to-end além dos unitários.', 30),
('tecnico', 'pleno', 'pleno', 'Estudar Microserviços', 'Aprender sobre arquitetura de microserviços e suas implementações.', 50),
('tecnico', 'pleno', 'pleno', 'Dominar Ferramentas DevOps', 'Aprender ferramentas de CI/CD, containers e orquestração.', 40),

-- Ações de Processo para Pleno
('processo', 'pleno', 'pleno', 'Liderar Code Reviews', 'Assumir papel de liderança em code reviews e mentoria de juniores.', 20),
('processo', 'pleno', 'pleno', 'Melhorar Estimativas', 'Refinar habilidades de estimativa para projetos complexos.', 30),
('processo', 'pleno', 'pleno', 'Participar de Decisões Técnicas', 'Contribuir ativamente em decisões arquiteturais e técnicas.', 15),
('processo', 'pleno', 'pleno', 'Mentorar Desenvolvedores', 'Ajudar no desenvolvimento de desenvolvedores júnior da equipe.', 25),
('processo', 'pleno', 'pleno', 'Otimizar Processos', 'Identificar e implementar melhorias nos processos de desenvolvimento.', 35),

-- Ações Comportamentais para Pleno
('comportamento', 'pleno', 'pleno', 'Desenvolver Liderança', 'Cultivar habilidades de liderança técnica e de equipe.', 45),
('comportamento', 'pleno', 'pleno', 'Melhorar Comunicação', 'Aprimorar comunicação com stakeholders e apresentações técnicas.', 30),
('comportamento', 'pleno', 'pleno', 'Tomar Responsabilidade', 'Assumir responsabilidade por projetos e resultados da equipe.', 20),
('comportamento', 'pleno', 'pleno', 'Desenvolver Pensamento Crítico', 'Aplicar pensamento crítico em decisões técnicas e de negócio.', 25),
('comportamento', 'pleno', 'pleno', 'Cultivar Networking', 'Desenvolver rede profissional e participar de comunidades técnicas.', 40),

-- Ações Técnicas para Sênior
('tecnico', 'senior', 'senior', 'Arquitetar Sistemas Complexos', 'Desenvolver arquiteturas de sistemas complexos e distribuídos.', 90),
('tecnico', 'senior', 'senior', 'Otimizar Performance Global', 'Otimizar performance de sistemas em larga escala.', 60),
('tecnico', 'senior', 'senior', 'Implementar Segurança', 'Desenvolver e implementar práticas de segurança em aplicações.', 45),
('tecnico', 'senior', 'senior', 'Estudar Tecnologias Emergentes', 'Acompanhar e avaliar novas tecnologias e tendências.', 30),
('tecnico', 'senior', 'senior', 'Contribuir para Open Source', 'Contribuir ativamente para projetos open source relevantes.', 50),

-- Ações de Processo para Sênior
('processo', 'senior', 'senior', 'Definir Padrões Técnicos', 'Estabelecer padrões e melhores práticas para a organização.', 40),
('processo', 'senior', 'senior', 'Liderar Transformação Digital', 'Liderar iniciativas de transformação digital e inovação.', 75),
('processo', 'senior', 'senior', 'Mentorar Equipes', 'Desenvolver programas de mentoria e desenvolvimento de equipes.', 60),
('processo', 'senior', 'senior', 'Otimizar Processos Organizacionais', 'Identificar e implementar melhorias em processos organizacionais.', 50),
('processo', 'senior', 'senior', 'Participar de Decisões Estratégicas', 'Contribuir em decisões estratégicas de tecnologia e negócio.', 30),

-- Ações Comportamentais para Sênior
('comportamento', 'senior', 'senior', 'Liderança Executiva', 'Desenvolver habilidades de liderança executiva e estratégica.', 90),
('comportamento', 'senior', 'senior', 'Comunicação Executiva', 'Aprimorar comunicação com executivos e stakeholders de alto nível.', 45),
('comportamento', 'senior', 'senior', 'Pensamento Estratégico', 'Desenvolver pensamento estratégico e visão de longo prazo.', 60),
('comportamento', 'senior', 'senior', 'Influência Organizacional', 'Cultivar influência e credibilidade em toda a organização.', 75),
('comportamento', 'senior', 'senior', 'Desenvolvimento de Talentos', 'Focar no desenvolvimento e retenção de talentos na organização.', 50);
*/

-- 4. Verificar novamente após inserção
SELECT 
  categoria,
  nivel_minimo,
  COUNT(*) as total_acoes
FROM public.acoes_pdi
GROUP BY categoria, nivel_minimo
ORDER BY nivel_minimo, categoria;
