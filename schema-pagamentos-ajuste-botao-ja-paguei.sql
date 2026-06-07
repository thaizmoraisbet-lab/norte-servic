-- NORTE SERVIC - Ajustes da tabela pagamentos para Pix Efí sem webhook
-- Rode no Supabase SQL Editor se aparecer erro de coluna ausente ou NOT NULL.

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS plano_key TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS plano_nome TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS valor_centavos INTEGER;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS profissional_nome TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS profissional_whatsapp TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS efi_txid TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS efi_loc_id TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS efi_status TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS qr_code_imagem TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS pix_copia_cola TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS raw_retorno JSONB;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS raw_webhook JSONB;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS erro TEXT;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS tentativas INTEGER DEFAULT 0;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS ambiente TEXT DEFAULT 'producao';

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS expira_em TIMESTAMPTZ;

ALTER TABLE pagamentos
ALTER COLUMN plano DROP NOT NULL;

ALTER TABLE pagamentos
ALTER COLUMN valor DROP NOT NULL;

ALTER TABLE pagamentos
ALTER COLUMN valor_centavos DROP NOT NULL;

ALTER TABLE pagamentos
ALTER COLUMN status SET DEFAULT 'aguardando';

UPDATE pagamentos
SET plano = COALESCE(plano, plano_key, plano_nome, 'plano')
WHERE plano IS NULL;

UPDATE pagamentos
SET valor_centavos = COALESCE(valor_centavos, 0)
WHERE valor_centavos IS NULL;

UPDATE pagamentos
SET status = COALESCE(status, 'aguardando')
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_pagamentos_txid ON pagamentos(txid);
CREATE INDEX IF NOT EXISTS idx_pagamentos_efi_txid ON pagamentos(efi_txid);
CREATE INDEX IF NOT EXISTS idx_pagamentos_profissional_id ON pagamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_plano_key ON pagamentos(plano_key);
