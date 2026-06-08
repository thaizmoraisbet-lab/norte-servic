-- Sistema de indicações Norte Servic
-- Execute este arquivo no SQL Editor do Supabase antes ou depois do deploy.

ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS codigo_indicacao TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicado_por_id BIGINT REFERENCES profissionais(id) ON DELETE SET NULL;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicado_por_codigo TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profissionais_codigo_indicacao
ON profissionais(codigo_indicacao)
WHERE codigo_indicacao IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profissionais_indicado_por
ON profissionais(indicado_por_id);

CREATE TABLE IF NOT EXISTS indicacoes (
  id BIGSERIAL PRIMARY KEY,
  indicador_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  indicado_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  pagamento_id BIGINT,
  saque_id BIGINT,
  codigo_indicacao TEXT,
  plano_key TEXT,
  valor_comissao NUMERIC(10,2) NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pendente',
  motivo TEXT,
  liberado_em TIMESTAMPTZ,
  confirmado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(indicado_id)
);

CREATE INDEX IF NOT EXISTS idx_indicacoes_indicador_status
ON indicacoes(indicador_id, status);

CREATE TABLE IF NOT EXISTS saques_indicacoes (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  chave_pix TEXT NOT NULL,
  tipo_chave_pix TEXT,
  status TEXT NOT NULL DEFAULT 'aguardando',
  indicacoes_ids JSONB DEFAULT '[]'::jsonb,
  observacao_admin TEXT,
  solicitado_em TIMESTAMPTZ DEFAULT NOW(),
  pago_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saques_indicacoes_profissional
ON saques_indicacoes(profissional_id, status);
