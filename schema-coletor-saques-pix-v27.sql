-- Norte Servic — Etapa 1 do saque dos coletores com dados Pix
-- Rode este arquivo no Supabase SQL Editor antes ou depois do deploy.

ALTER TABLE cidade_coletores
  ADD COLUMN IF NOT EXISTS pix_nome_titular TEXT,
  ADD COLUMN IF NOT EXISTS pix_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS pix_tipo_chave TEXT,
  ADD COLUMN IF NOT EXISTS pix_chave TEXT,
  ADD COLUMN IF NOT EXISTS banco_nome TEXT;

ALTER TABLE cidade_saques_coletores
  ADD COLUMN IF NOT EXISTS pix_nome_titular TEXT,
  ADD COLUMN IF NOT EXISTS pix_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS pix_tipo_chave TEXT,
  ADD COLUMN IF NOT EXISTS pix_chave TEXT,
  ADD COLUMN IF NOT EXISTS banco_nome TEXT,
  ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pago_por_admin_id INTEGER,
  ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS status_transacao TEXT,
  ADD COLUMN IF NOT EXISTS comprovante TEXT;

ALTER TABLE cidade_coleta_profissionais
  ADD COLUMN IF NOT EXISTS saque_coletor_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_cidade_coleta_saque_coletor
  ON cidade_coleta_profissionais(saque_coletor_id);

CREATE INDEX IF NOT EXISTS idx_cidade_saques_coletores_status
  ON cidade_saques_coletores(status);

CREATE INDEX IF NOT EXISTS idx_cidade_saques_coletores_coletor_data
  ON cidade_saques_coletores(coletor_id, data_referencia);
