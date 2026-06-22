NORTE SERVIC - ZIP AJUSTADO PARA BACKEND/SUPABASE

O que foi alterado:
- public/script.js foi substituído por uma versão conectada ao backend.
- A página inicial agora busca profissionais em /api/profissionais.
- O cadastro envia dados para /api/cadastro.
- O login usa /api/login.
- O painel profissional usa /api/me.
- O admin usa /api/admin/profissionais e aprova/remove pelo backend.

Como testar:
1. Abra o terminal na pasta do projeto.
2. Rode: npm install
3. Rode: npm run dev
4. Abra: http://localhost:3000/api/health
   Deve aparecer ok:true e banco:true.
5. Abra: http://localhost:3000/index.html
6. Aperte Ctrl + F5.
7. No DevTools > Network, deve aparecer a chamada /api/profissionais.

Teste importante:
- No Supabase, altere o nome João Silva para João Teste Supabase.
- Atualize o site com Ctrl + F5.
- Se o nome mudar na página inicial, está 100% conectado ao Supabase.

Admin:
- A senha continua vindo do .env em ADMIN_PASSWORD.
- Se estiver ADMIN_PASSWORD=indica123, use indica123 no admin.

Observação:
- Não use mais localStorage para profissionais. O banco agora é o Supabase.

SUPABASE STORAGE - FOTOS
1. No Supabase, vá em Storage.
2. Crie um bucket público chamado: norte-servic
3. No Railway, adicione as variáveis:
   SUPABASE_URL=https://SEU-PROJETO.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua service_role key do Supabase
   SUPABASE_STORAGE_BUCKET=norte-servic
4. Faça redeploy.
5. A partir daí, as fotos novas serão salvas no Storage, e o banco guardará apenas as URLs.

IMPORTANTE: a service_role key é secreta. Nunca coloque ela no front-end ou no GitHub.
