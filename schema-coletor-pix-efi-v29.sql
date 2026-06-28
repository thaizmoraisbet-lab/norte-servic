-- Norte Servic V29 — Pix automático Efí para saque dos coletores
-- Rode no Supabase SQL Editor antes do deploy ou após o deploy.

ALTER TABLE cidade_saques_coletores
  ADD COLUMN IF NOT EXISTS efi_id_envio TEXT,
  ADD COLUMN IF NOT EXISTS efi_e2e_id TEXT,
  ADD COLUMN IF NOT EXISTS efi_resposta JSONB DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cidade_saques_efi_id_envio
  ON cidade_saques_coletores(efi_id_envio)
  WHERE efi_id_envio IS NOT NULL;
