-- Ajustes legais, LGPD e indicações Norte Servic
-- Execute no Supabase > SQL Editor > New Query > Run

ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceitou_termos BOOLEAN DEFAULT false;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceitou_privacidade BOOLEAN DEFAULT false;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS termos_versao TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS privacidade_versao TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceite_data TIMESTAMPTZ;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceite_ip TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceite_user_agent TEXT;

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

CREATE TABLE IF NOT EXISTS saques_indicacoes (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
  valor NUMERIC(10,2) NOT NULL,
  chave_pix TEXT NOT NULL,
  tipo_chave_pix TEXT,
  nome_titular TEXT,
  cpf_cnpj_titular TEXT,
  saldo_disponivel NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'aguardando',
  indicacoes_ids JSONB DEFAULT '[]'::jsonb,
  observacao_admin TEXT,
  solicitado_em TIMESTAMPTZ DEFAULT NOW(),
  pago_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saques_indicacoes ADD COLUMN IF NOT EXISTS nome_titular TEXT;
ALTER TABLE saques_indicacoes ADD COLUMN IF NOT EXISTS cpf_cnpj_titular TEXT;
ALTER TABLE saques_indicacoes ADD COLUMN IF NOT EXISTS saldo_disponivel NUMERIC(10,2);

CREATE TABLE IF NOT EXISTS solicitacoes_exclusao_conta (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT REFERENCES profissionais(id) ON DELETE SET NULL,
  motivo TEXT,
  status TEXT NOT NULL DEFAULT 'aguardando',
  observacao_admin TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  finalizado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profissionais_codigo_indicacao ON profissionais(codigo_indicacao) WHERE codigo_indicacao IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profissionais_indicado_por ON profissionais(indicado_por_id);
CREATE INDEX IF NOT EXISTS idx_indicacoes_indicador_status ON indicacoes(indicador_id, status);
CREATE INDEX IF NOT EXISTS idx_saques_indicacoes_profissional ON saques_indicacoes(profissional_id, status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_exclusao_profissional_status ON solicitacoes_exclusao_conta(profissional_id, status);

-- Dados Pix de indicação salvos antes do saque mínimo
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_tipo_chave_pix TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_chave_pix TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_nome_titular TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_cpf_cnpj_titular TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_pix_atualizado_em TIMESTAMPTZ;
