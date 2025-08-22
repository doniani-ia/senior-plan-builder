-- Script que funciona sem problemas de constraint
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Inserir questionário (sem created_by)
INSERT INTO public.questionarios (titulo, descricao, versao, status) VALUES
(
  'Avaliação de Senioridade Técnica 2024',
  'Questionário completo para avaliação de competências técnicas, processos e comportamentais',
  1,
  'ativo'
);

-- 2. Inserir perguntas técnicas
INSERT INTO public.perguntas (questionario_id, texto, peso, categoria, ordem) 
SELECT 
  q.id,
  p.texto,
  p.peso,
  p.categoria,
  p.ordem
FROM public.questionarios q
CROSS JOIN (VALUES
  ('Conhece e aplica padrões de projeto (Design Patterns) adequadamente?', 8.5, 'tecnico', 1),
  ('Possui conhecimento sólido em estruturas de dados e algoritmos?', 7.0, 'tecnico', 2),
  ('Consegue arquitetar soluções escaláveis e performáticas?', 9.0, 'tecnico', 3),
  ('Mantém-se atualizado com as últimas tecnologias e tendências?', 6.5, 'tecnico', 4),
  ('Possui experiência com múltiplas linguagens de programação?', 7.5, 'tecnico', 5),
  ('Consegue otimizar código e identificar gargalos de performance?', 8.0, 'tecnico', 6),
  ('Possui conhecimento em testes automatizados (unitários, integração)?', 7.0, 'tecnico', 7),
  ('Conhece e aplica princípios SOLID e Clean Code?', 8.5, 'tecnico', 8)
) AS p(texto, peso, categoria, ordem)
WHERE q.titulo = 'Avaliação de Senioridade Técnica 2024';

-- 3. Inserir perguntas de processo
INSERT INTO public.perguntas (questionario_id, texto, peso, categoria, ordem) 
SELECT 
  q.id,
  p.texto,
  p.peso,
  p.categoria,
  p.ordem
FROM public.questionarios q
CROSS JOIN (VALUES
  ('Participa ativamente de cerimônias ágeis (Daily, Planning, Retrospective)?', 6.0, 'processo', 9),
  ('Consegue estimar esforço de desenvolvimento com precisão?', 7.5, 'processo', 10),
  ('Utiliza ferramentas de controle de versão (Git) adequadamente?', 6.5, 'processo', 11),
  ('Participa de code reviews e fornece feedback construtivo?', 7.0, 'processo', 12),
  ('Documenta código e processos de forma clara e objetiva?', 6.0, 'processo', 13),
  ('Conhece e aplica práticas de CI/CD?', 7.5, 'processo', 14),
  ('Participa de reuniões técnicas e contribui com ideias?', 6.5, 'processo', 15),
  ('Consegue trabalhar com metodologias ágeis (Scrum, Kanban)?', 7.0, 'processo', 16)
) AS p(texto, peso, categoria, ordem)
WHERE q.titulo = 'Avaliação de Senioridade Técnica 2024';

-- 4. Inserir perguntas comportamentais
INSERT INTO public.perguntas (questionario_id, texto, peso, categoria, ordem) 
SELECT 
  q.id,
  p.texto,
  p.peso,
  p.categoria,
  p.ordem
FROM public.questionarios q
CROSS JOIN (VALUES
  ('Demonstra proatividade na resolução de problemas?', 8.0, 'comportamento', 17),
  ('Comunica-se de forma clara e efetiva com a equipe?', 7.5, 'comportamento', 18),
  ('Aceita feedback e busca constantemente melhorar?', 8.5, 'comportamento', 19),
  ('Trabalha bem em equipe e colabora com outros desenvolvedores?', 8.0, 'comportamento', 20),
  ('Demonstra liderança técnica e mentoria para desenvolvedores júnior?', 9.0, 'comportamento', 21),
  ('Mantém-se organizado e cumpre prazos estabelecidos?', 7.0, 'comportamento', 22),
  ('Demonstra curiosidade e vontade de aprender novas tecnologias?', 7.5, 'comportamento', 23),
  ('Consegue lidar com pressão e prazos apertados?', 7.0, 'comportamento', 24)
) AS p(texto, peso, categoria, ordem)
WHERE q.titulo = 'Avaliação de Senioridade Técnica 2024';

-- 5. Verificar os dados inseridos
SELECT 
  q.titulo,
  q.status,
  COUNT(p.id) as total_perguntas,
  AVG(p.peso) as peso_medio
FROM public.questionarios q
LEFT JOIN public.perguntas p ON q.id = p.questionario_id
GROUP BY q.id, q.titulo, q.status;

-- 6. Mostrar perguntas por categoria
SELECT 
  p.categoria,
  COUNT(*) as total,
  AVG(p.peso) as peso_medio
FROM public.perguntas p
JOIN public.questionarios q ON p.questionario_id = q.id
WHERE q.titulo = 'Avaliação de Senioridade Técnica 2024'
GROUP BY p.categoria
ORDER BY p.categoria;
