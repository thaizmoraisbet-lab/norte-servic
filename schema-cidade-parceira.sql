-- =========================================================
-- NORTE SERVIC CIDADE PARCEIRA / COLETA DE PROFISSIONAIS
-- Cole no Supabase SQL Editor se quiser criar as tabelas manualmente.
-- O server.js também tenta criar/ajustar essas tabelas automaticamente.
-- =========================================================

CREATE TABLE IF NOT EXISTS cidade_coletores (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  setor_fixo TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cidade_coleta_profissionais (
  id BIGSERIAL PRIMARY KEY,
  coletor_id BIGINT REFERENCES cidade_coletores(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  email_profissional TEXT,
  instagram TEXT,
  categoria TEXT,
  profissao TEXT NOT NULL,
  servicos TEXT,
  cidade TEXT DEFAULT 'Muricilândia - TO',
  setor TEXT NOT NULL,
  bairro TEXT,
  descricao TEXT,
  aceita_site BOOLEAN DEFAULT false,
  profissional_site_id BIGINT REFERENCES profissionais(id) ON DELETE SET NULL,
  status_coleta TEXT DEFAULT 'coletado',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS email_profissional TEXT;
ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS instagram TEXT;

ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS origem_cidade_parceira BOOLEAN DEFAULT false;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS cidade_coleta_id BIGINT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS setor_coleta TEXT;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceita_aparecer_site BOOLEAN DEFAULT false;
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS perfil_coleta_pendente BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_cidade_coletores_email ON cidade_coletores(email);
CREATE INDEX IF NOT EXISTS idx_cidade_coleta_setor ON cidade_coleta_profissionais(setor);
CREATE INDEX IF NOT EXISTS idx_cidade_coleta_profissao ON cidade_coleta_profissionais(profissao);
CREATE INDEX IF NOT EXISTS idx_cidade_coleta_aceita_site ON cidade_coleta_profissionais(aceita_site);

-- IMPORTANTE:
-- Os 3 coletores padrão são criados automaticamente pelo server.js com bcryptjs:
-- coletor.novacanaa@norteservic.com.br / Nova123
-- coletor.novamuricilandia@norteservic.com.br / Moricilandia123
-- coletor.centro@norteservic.com.br / Centro123
--
-- Como o backend usa bcryptjs para validar senha, não preencha senha_hash manualmente com crypt() do PostgreSQL.


-- Comissão dos coletores:
-- Regra aplicada no backend: cada cadastro finalizado soma R$ 2,00.
-- O saque só é liberado ao completar R$ 50,00 no dia por coletor.
-- Todos os cadastros são avaliados pelo time da Norte Servic antes do pagamento.
