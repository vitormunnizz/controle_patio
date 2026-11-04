-- Esquema inicial do JC Pneus. Seguro para executar mais de uma vez.
-- Execute no PostgreSQL hospedado antes de abrir o site na Netlify.

CREATE TABLE IF NOT EXISTS status (
  id serial PRIMARY KEY,
  nome varchar(50) NOT NULL UNIQUE,
  ordem integer NOT NULL
);

CREATE TABLE IF NOT EXISTS veiculos (
  id serial PRIMARY KEY,
  placa varchar(10) NOT NULL UNIQUE,
  modelo varchar(100) NOT NULL,
  cliente varchar(150) NOT NULL,
  data_entrada date NOT NULL,
  data_prevista_entrega date,
  status_id integer NOT NULL REFERENCES status(id),
  observacoes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fotos (
  id serial PRIMARY KEY,
  veiculo_id integer NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  url text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checklist_tecnico (
  id serial PRIMARY KEY,
  veiculo_id integer NOT NULL UNIQUE REFERENCES veiculos(id) ON DELETE CASCADE,
  itens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

INSERT INTO status (nome, ordem) VALUES
  ('Recebido', 1),
  ('Aguardando orçamento', 2),
  ('Aguardando aprovação', 3),
  ('Aguardando peças', 4),
  ('Em manutenção', 5),
  ('Finalizado', 6),
  ('Entregue', 7)
ON CONFLICT (nome) DO NOTHING;
