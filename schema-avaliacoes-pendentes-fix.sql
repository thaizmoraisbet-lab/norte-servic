-- =====================================================
-- NORTE SERVIC - FIX AVALIAÇÕES PENDENTES NO ADMIN
-- Rode no Supabase > SQL Editor > New Query > Run
-- Não apaga avaliações completas.
-- =====================================================

CREATE TABLE IF NOT EXISTS avaliacoes (
  id BIGSERIAL PRIMARY KEY
);

ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS profissional_id BIGINT;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS nome_cliente TEXT;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS nota INTEGER;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS comentario TEXT;
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();

UPDATE avaliacoes
SET status='pendente'
WHERE status IS NULL OR TRIM(status) = '';

UPDATE avaliacoes
SET status=LOWER(TRIM(status))
WHERE status IS NOT NULL;

DELETE FROM avaliacoes
WHERE profissional_id IS NULL
   OR nome_cliente IS NULL
   OR nota IS NULL;

ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_nota_check;
ALTER TABLE avaliacoes
ADD CONSTRAINT avaliacoes_nota_check
CHECK (nota BETWEEN 1 AND 5);

ALTER TABLE avaliacoes DROP CONSTRAINT IF EXISTS avaliacoes_status_check;
ALTER TABLE avaliacoes
ADD CONSTRAINT avaliacoes_status_check
CHECK (status IN ('pendente', 'aprovado', 'recusado'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'avaliacoes_profissional_id_fkey'
  ) THEN
    ALTER TABLE avaliacoes
    ADD CONSTRAINT avaliacoes_profissional_id_fkey
    FOREIGN KEY (profissional_id)
    REFERENCES profissionais(id)
    ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_avaliacoes_profissional ON avaliacoes(profissional_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_status ON avaliacoes(status);
