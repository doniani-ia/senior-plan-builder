-- Script para popular dados de exemplo
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos verificar se existe um admin ou criar um se necessário
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Tentar encontrar um admin existente
  SELECT id INTO admin_id FROM public.profiles WHERE papel = 'admin' LIMIT 1;
  
  -- Se não encontrar admin, usar o primeiro usuário disponível
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.profiles LIMIT 1;
  END IF;
  
  -- Se ainda não encontrar nenhum usuário, criar um questionário sem created_by (será atualizado depois)
  IF admin_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário encontrado. Criando questionário sem created_by.';
  END IF;

  -- Inserir questionário de exemplo
  INSERT INTO public.questionarios (titulo, descricao, versao, status, created_by) VALUES
  (
    'Avaliação de Senioridade Técnica 2024',
    'Questionário completo para avaliação de competências técnicas, processos e comportamentais',
    1,
    'ativo',
    admin_id
  );

  -- Obter o ID do questionário criado
  DECLARE
    questionario_id UUID;
  BEGIN
    SELECT id INTO questionario_id FROM public.questionarios WHERE titulo = 'Avaliação de Senioridade Técnica 2024' LIMIT 1;

    -- Inserir perguntas técnicas
    INSERT INTO public.perguntas (questionario_id, texto, peso, categoria, ordem) VALUES
    (questionario_id, 'Conhece e aplica padrões de projeto (Design Patterns) adequadamente?', 8.5, 'tecnico', 1),
    (questionario_id, 'Possui conhecimento sólido em estruturas de dados e algoritmos?', 7.0, 'tecnico', 2),
    (questionario_id, 'Consegue arquitetar soluções escaláveis e performáticas?', 9.0, 'tecnico', 3),
    (questionario_id, 'Mantém-se atualizado com as últimas tecnologias e tendências?', 6.5, 'tecnico', 4),
    (questionario_id, 'Possui experiência com múltiplas linguagens de programação?', 7.5, 'tecnico', 5),
    (questionario_id, 'Consegue otimizar código e identificar gargalos de performance?', 8.0, 'tecnico', 6),
    (questionario_id, 'Possui conhecimento em testes automatizados (unitários, integração)?', 7.0, 'tecnico', 7),
    (questionario_id, 'Conhece e aplica princípios SOLID e Clean Code?', 8.5, 'tecnico', 8);

    -- Inserir perguntas de processo
    INSERT INTO public.perguntas (questionario_id, texto, peso, categoria, ordem) VALUES
    (questionario_id, 'Participa ativamente de cerimônias ágeis (Daily, Planning, Retrospective)?', 6.0, 'processo', 9),
    (questionario_id, 'Consegue estimar esforço de desenvolvimento com precisão?', 7.5, 'processo', 10),
    (questionario_id, 'Utiliza ferramentas de controle de versão (Git) adequadamente?', 6.5, 'processo', 11),
    (questionario_id, 'Participa de code reviews e fornece feedback construtivo?', 7.0, 'processo', 12),
    (questionario_id, 'Documenta código e processos de forma clara e objetiva?', 6.0, 'processo', 13),
    (questionario_id, 'Conhece e aplica práticas de CI/CD?', 7.5, 'processo', 14),
    (questionario_id, 'Participa de reuniões técnicas e contribui com ideias?', 6.5, 'processo', 15),
    (questionario_id, 'Consegue trabalhar com metodologias ágeis (Scrum, Kanban)?', 7.0, 'processo', 16);

    -- Inserir perguntas comportamentais
    INSERT INTO public.perguntas (questionario_id, texto, peso, categoria, ordem) VALUES
    (questionario_id, 'Demonstra proatividade na resolução de problemas?', 8.0, 'comportamento', 17),
    (questionario_id, 'Comunica-se de forma clara e efetiva com a equipe?', 7.5, 'comportamento', 18),
    (questionario_id, 'Aceita feedback e busca constantemente melhorar?', 8.5, 'comportamento', 19),
    (questionario_id, 'Trabalha bem em equipe e colabora com outros desenvolvedores?', 8.0, 'comportamento', 20),
    (questionario_id, 'Demonstra liderança técnica e mentoria para desenvolvedores júnior?', 9.0, 'comportamento', 21),
    (questionario_id, 'Mantém-se organizado e cumpre prazos estabelecidos?', 7.0, 'comportamento', 22),
    (questionario_id, 'Demonstra curiosidade e vontade de aprender novas tecnologias?', 7.5, 'comportamento', 23),
    (questionario_id, 'Consegue lidar com pressão e prazos apertados?', 7.0, 'comportamento', 24);

  END;
END $$;

-- Verificar os dados inseridos
SELECT 
  q.titulo,
  q.status,
  COUNT(p.id) as total_perguntas,
  AVG(p.peso) as peso_medio
FROM public.questionarios q
LEFT JOIN public.perguntas p ON q.id = p.questionario_id
GROUP BY q.id, q.titulo, q.status;

-- Mostrar perguntas por categoria
SELECT 
  p.categoria,
  COUNT(*) as total,
  AVG(p.peso) as peso_medio
FROM public.perguntas p
JOIN public.questionarios q ON p.questionario_id = q.id
WHERE q.titulo = 'Avaliação de Senioridade Técnica 2024'
GROUP BY p.categoria
ORDER BY p.categoria;
