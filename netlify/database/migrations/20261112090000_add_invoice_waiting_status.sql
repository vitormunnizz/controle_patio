UPDATE status
SET ordem = 8
WHERE nome = 'Entregue';

INSERT INTO status (nome, ordem)
VALUES ('Aguardando nota fiscal', 7)
ON CONFLICT (nome) DO UPDATE SET ordem = EXCLUDED.ordem;
