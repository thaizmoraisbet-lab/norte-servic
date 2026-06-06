-- =========================================================
-- NORTE SERVIC - BANCO DE DADOS SUPABASE / POSTGRESQL
-- Cole este arquivo no Supabase: SQL Editor > New query > Run
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remove tabelas antigas somente se você quiser reiniciar tudo.
-- Para primeira instalação, pode deixar assim.
DROP TABLE IF EXISTS pagamentos CASCADE;
DROP TABLE IF EXISTS avaliacoes CASCADE;
DROP TABLE IF EXISTS profissionais CASCADE;

CREATE TABLE profissionais (
  id BIGSERIAL PRIMARY KEY,

  nome TEXT NOT NULL,
  email TEXT,
  senha_hash TEXT NOT NULL,

  tipo_profissional TEXT,
  categoria TEXT,
  profissao TEXT,
  servicos TEXT,
  palavras_chave TEXT,

  cidade TEXT,
  bairro TEXT,
  atende_outras_cidades TEXT,
  cidades_atendidas JSONB DEFAULT '[]'::jsonb,
  forma_atendimento TEXT,

  whatsapp TEXT NOT NULL UNIQUE,
  instagram TEXT,
  descricao TEXT,

  foto_perfil TEXT,
  fotos_trabalhos JSONB DEFAULT '[]'::jsonb,

  avaliacao TEXT DEFAULT 'Novo',
  avaliacoes INTEGER DEFAULT 0,
  verificado BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),

  plano_atual TEXT DEFAULT 'Gratuito',
  plano_status TEXT DEFAULT 'ativo',
  plano_vencimento TIMESTAMPTZ,

  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE avaliacoes (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT REFERENCES profissionais(id) ON DELETE CASCADE,
  nome_cliente TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pagamentos (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT REFERENCES profissionais(id) ON DELETE SET NULL,
  plano TEXT NOT NULL,
  valor_centavos INTEGER NOT NULL,
  status TEXT DEFAULT 'pendente',
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profissionais_status ON profissionais(status);
CREATE INDEX idx_profissionais_whatsapp ON profissionais(whatsapp);
CREATE INDEX idx_profissionais_categoria ON profissionais(categoria);
CREATE INDEX idx_profissionais_profissao ON profissionais(profissao);
CREATE INDEX idx_profissionais_cidade ON profissionais(cidade);
CREATE INDEX idx_profissionais_plano ON profissionais(plano_atual, plano_status);
CREATE INDEX idx_avaliacoes_profissional ON avaliacoes(profissional_id);
CREATE INDEX idx_avaliacoes_status ON avaliacoes(status);

CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profissionais_updated_at
BEFORE UPDATE ON profissionais
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_pagamentos_updated_at
BEFORE UPDATE ON pagamentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_avaliacoes_updated_at
BEFORE UPDATE ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();

-- Dados de exemplo aprovados para testar a tela inicial.
-- A senha dos exemplos é: 123456
INSERT INTO profissionais (
  nome,
  senha_hash,
  tipo_profissional,
  categoria,
  profissao,
  servicos,
  palavras_chave,
  cidade,
  bairro,
  atende_outras_cidades,
  cidades_atendidas,
  forma_atendimento,
  whatsapp,
  instagram,
  descricao,
  avaliacao,
  avaliacoes,
  verificado,
  status,
  plano_atual,
  plano_status
) VALUES
(
  'João Silva',
  crypt('123456', gen_salt('bf')),
  'Autônomo',
  'Construção e Reforma',
  'Pedreiro',
  'Reforma, Piso, Reboco, Calçada',
  'obra reforma construção piso reboco calçada banheiro cozinha',
  'Muricilândia',
  'Centro',
  'Sim',
  '["Muricilândia", "Santa Fé do Araguaia", "Araguanã"]'::jsonb,
  'Presencial',
  '5563999999999',
  '@joaopedreiro',
  'Faço reformas, piso, reboco, construção e pequenos reparos.',
  '4,9',
  23,
  true,
  'aprovado',
  'Gratuito',
  'ativo'
),
(
  'Maria Oliveira',
  crypt('123456', gen_salt('bf')),
  'Autônomo',
  'Casa e Manutenção',
  'Diarista',
  'Faxina residencial, Limpeza pós-obra, Organização',
  'limpeza faxina diarista organização casa',
  'Muricilândia',
  'Setor Novo',
  'Não',
  '["Muricilândia"]'::jsonb,
  'Presencial',
  '5563988888888',
  '@mariafaxina',
  'Trabalho com faxina residencial, limpeza pós-obra e organização.',
  '5,0',
  18,
  true,
  'aprovado',
  'Gratuito',
  'ativo'
);
