NORTE SERVIC — ADMIN SEGURO V14

O que mudou:
- O Painel Admin saiu do login por senha única.
- Agora o login é por e-mail + senha.
- A sessão fica em cookie httpOnly, mais seguro que salvar senha no navegador.
- As rotas /api/admin/* agora dependem da sessão administrativa.
- Foi criada a tabela admin_users.
- Foi criada a tabela audit_logs.
- Foi adicionado limite de tentativas no login admin.
- Foram removidas senhas padrão do admin no backend.
- A rota /api/debug/efi agora também exige login admin.

PASSO OBRIGATÓRIO NO SUPABASE:
1. Abra o Supabase.
2. Vá em SQL Editor.
3. Rode o arquivo schema-admin-security.sql.

LOGIN INICIAL:
E-mail: admin@norteservic.com.br
Senha temporária: norte@servic26

IMPORTANTE:
- Troque essa senha depois que o primeiro acesso estiver funcionando.
- Na Railway, adicione uma variável ADMIN_SESSION_SECRET com uma chave grande.
  Exemplo para gerar no terminal:
  openssl rand -hex 32

VARIÁVEIS IMPORTANTES NA RAILWAY:
DATABASE_URL=
JWT_SECRET=
ADMIN_SESSION_SECRET=

Opcional:
ADMIN_BOOTSTRAP_EMAIL=
ADMIN_BOOTSTRAP_PASSWORD=
ADMIN_BOOTSTRAP_NAME=

Use as variáveis ADMIN_BOOTSTRAP_* apenas se quiser criar o primeiro admin automaticamente.
Depois remova essas variáveis.
