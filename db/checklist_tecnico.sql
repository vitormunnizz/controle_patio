CREATE TABLE IF NOT EXISTS checklist_tecnico (
  id serial PRIMARY KEY,
  veiculo_id integer NOT NULL UNIQUE
    REFERENCES veiculos(id) ON DELETE CASCADE,
  itens jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);