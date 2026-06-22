SISTEMA DE INDICAÇÕES - NORTE SERVIC

O que foi adicionado:
1. Link/código único para cada profissional.
2. Cadastro por indicação usando cadastro.html?ref=CODIGO.
3. Comissão de R$ 10,00 para o indicador quando o indicado pagar o plano Top de R$ 39,90.
4. Comissão só conta quando:
   - indicado paga o plano de R$ 39,90;
   - pagamento é confirmado;
   - perfil indicado está aprovado/publicado;
   - indicado não tem mesmo WhatsApp/e-mail do indicador;
   - comissão fica pendente por 5 dias antes de liberar.
5. Saldo interno no painel profissional.
6. Saque mínimo de R$ 100,00.
7. Solicitação de saque no painel profissional.
8. Aprovação manual do saque no painel admin.

Execute no Supabase:
- schema-indicacoes.sql

Depois suba o projeto:
git add .
git commit -m "adiciona sistema de indicacoes"
git push

Variáveis opcionais no Railway:
INDICACAO_COMISSAO_TOP=10
INDICACAO_SAQUE_MINIMO=100
INDICACAO_DIAS_LIBERACAO=5
