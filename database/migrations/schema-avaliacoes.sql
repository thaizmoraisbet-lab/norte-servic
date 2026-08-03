-- =========================================================
-- NORTE SERVIC - ADICIONAR SISTEMA DE AVALIAÇÕES
-- Cole este arquivo no Supabase: SQL Editor > New query > Run
-- Este SQL NÃO apaga dados existentes.
-- =========================================================

CREATE TABLE IF NOT EXISTS avaliacoes (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT REFERENCES profissionais(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_profissional ON avaliacoes(profissional_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_status ON avaliacoes(status);

CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_avaliacoes_updated_at ON avaliacoes;

CREATE TRIGGER trg_avaliacoes_updated_at
BEFORE UPDATE ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();
