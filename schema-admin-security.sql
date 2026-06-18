-- Segurança do Painel Admin Norte Servic
-- Execute este arquivo no Supabase SQL Editor antes de acessar o novo login do admin.
-- Login inicial:
--   E-mail: admin@norteservic.com.br
--   Senha temporária: a senha informada pelo proprietário do projeto.
-- A senha NÃO fica em texto puro; abaixo está apenas o hash bcrypt.

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER,
  usuario_email TEXT,
  usuario_role TEXT,
  acao TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  detalhes JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_audit_logs_criado_em ON audit_logs (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acao ON audit_logs (acao);

INSERT INTO admin_users (nome, email, senha_hash, role, ativo)
VALUES (
  'Administrador Norte Servic',
  'admin@norteservic.com.br',
  '$2b$12$wM4iw5jqmdUlOWMhuuxmv.bc8HQkhIKLY4YUkrQxJ9QhkZFtXr0t.',
  'super_admin',
  TRUE
)
ON CONFLICT (email) DO UPDATE
SET
  senha_hash = EXCLUDED.senha_hash,
  role = EXCLUDED.role,
  ativo = TRUE,
  atualizado_em = NOW();
