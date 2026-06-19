-- Norte Servic v16
-- WhatsApp Cloud API + completar perfil pelo profissional
-- Rode este arquivo no Supabase SQL Editor antes de testar a integração.

CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT,
  coleta_id BIGINT,
  whatsapp TEXT NOT NULL,
  tipo TEXT NOT NULL,
  template_nome TEXT,
  mensagem TEXT,
  status TEXT DEFAULT 'pendente',
  message_id TEXT,
  erro TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  resposta JSONB DEFAULT '{}'::jsonb,
  enviado_em TIMESTAMPTZ,
  entregue_em TIMESTAMPTZ,
  lido_em TIMESTAMPTZ,
  respondido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profissional_acessos_codigo (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT,
  whatsapp TEXT NOT NULL,
  codigo_hash TEXT NOT NULL,
  tentativas INTEGER DEFAULT 0,
  usado BOOLEAN DEFAULT FALSE,
  expira_em TIMESTAMPTZ NOT NULL,
  ip TEXT,
  user_agent TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  usado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_message_id ON whatsapp_mensagens(message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_profissional ON whatsapp_mensagens(profissional_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_status ON whatsapp_mensagens(status);
CREATE INDEX IF NOT EXISTS idx_profissional_acessos_whatsapp ON profissional_acessos_codigo(whatsapp);
CREATE INDEX IF NOT EXISTS idx_profissional_acessos_profissional ON profissional_acessos_codigo(profissional_id);

ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS autorizou_receber_mensagem BOOLEAN DEFAULT TRUE;
ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS whatsapp_mensagem_cadastro_id BIGINT;

ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS origem_cadastro TEXT DEFAULT 'site';
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS perfil_completo BOOLEAN DEFAULT FALSE;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS link_completar_perfil_enviado_em TIMESTAMPTZ;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS ultimo_acesso_perfil TIMESTAMPTZ;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS autorizou_receber_mensagem BOOLEAN DEFAULT TRUE;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS horario_atendimento TEXT;
