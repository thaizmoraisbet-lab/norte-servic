-- V17 - Sala do Empreendedor, conclusão do coletor e edição admin
-- Rode no SQL Editor do Supabase se quiser garantir as colunas antes do deploy.

ALTER TABLE cidade_coleta_profissionais
  ADD COLUMN IF NOT EXISTS mei_status TEXT DEFAULT 'nao_informado',
  ADD COLUMN IF NOT EXISTS interesse_formalizacao TEXT DEFAULT 'nao_informado',
  ADD COLUMN IF NOT EXISTS necessidades_empreendedor JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS observacao_empreendedor TEXT;

ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS horario_atendimento TEXT;

CREATE INDEX IF NOT EXISTS idx_cidade_coleta_mei_status ON cidade_coleta_profissionais(mei_status);
CREATE INDEX IF NOT EXISTS idx_cidade_coleta_interesse_formalizacao ON cidade_coleta_profissionais(interesse_formalizacao);
