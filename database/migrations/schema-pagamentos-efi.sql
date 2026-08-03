-- =====================================================
-- NORTE SERVIC - PAGAMENTOS PIX EFÍ
-- Rode este SQL no Supabase antes de testar o Pix automático.
-- Não apaga dados existentes.
-- =====================================================

CREATE TABLE IF NOT EXISTS pagamentos (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  plano_key TEXT NOT NULL,
  plano_nome TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'aguardando',
  txid TEXT UNIQUE NOT NULL,
  loc_id TEXT,
  pix_copia_cola TEXT,
  qr_code_imagem TEXT,
  raw_retorno JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  pago_em TIMESTAMPTZ
);

ALTER TABLE pagamentos
DROP CONSTRAINT IF EXISTS pagamentos_status_check;

ALTER TABLE pagamentos
ADD CONSTRAINT pagamentos_status_check
CHECK (status IN ('aguardando', 'pago', 'expirado', 'cancelado', 'erro'));

CREATE INDEX IF NOT EXISTS idx_pagamentos_profissional
ON pagamentos(profissional_id);

CREATE INDEX IF NOT EXISTS idx_pagamentos_status
ON pagamentos(status);

CREATE INDEX IF NOT EXISTS idx_pagamentos_txid
ON pagamentos(txid);

CREATE OR REPLACE FUNCTION atualizar_updated_at_pagamentos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_pagamentos
ON pagamentos;

CREATE TRIGGER trigger_atualizar_pagamentos
BEFORE UPDATE ON pagamentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at_pagamentos();
