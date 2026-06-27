Norte Servic V27 — Saque do Coletor com Dados Pix (Etapa 1)

Implementado nesta etapa:
- Coletor pode cadastrar dados Pix:
  nome completo, CPF/CNPJ, tipo de chave Pix, chave Pix e banco opcional.
- Comissão considera cadastros disponíveis ainda não vinculados a saque.
- Meta padrão: R$ 50,00.
- Valor por cadastro padrão: R$ 2,00.
- Ao solicitar saque, os cadastros ficam reservados para aquela solicitação.
- Painel Admin mostra solicitações de saque com dados Pix.
- Admin pode copiar a chave Pix.
- Admin pode confirmar pagamento manual com senha de autorização opcional.
- Se recusar o saque, os cadastros voltam a ficar disponíveis para nova solicitação.
- Coletor vê status de saque aguardando, recusado ou pagamento enviado.

Importante:
- Esta etapa NÃO envia Pix automático pela Efí ainda.
- Ela prepara o fluxo seguro para a próxima etapa.
- Para exigir senha ao marcar pagamento, configure na Railway:
  CIDADE_SAQUE_ADMIN_PIN=sua_senha_interna_segura

SQL:
- Rode no Supabase:
  schema-coletor-saques-pix-v27.sql

Próxima etapa:
- Integrar botão do Admin com Pix automático da Efí usando as credenciais da API.
- Guardar e exibir comprovante/ID da transação.
