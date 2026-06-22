NORTE SERVIC v16 — WhatsApp Cloud API + Completar Perfil

O que foi adicionado:
- Webhook do WhatsApp:
  GET  /api/whatsapp/webhook
  POST /api/whatsapp/webhook

- Envio automático ao cadastrar profissional pelo coletor:
  Quando o coletor cadastra um profissional, se marcar "Aparecer no site oficial" e "Enviar WhatsApp automático",
  o sistema tenta enviar uma mensagem para o profissional com link para completar o perfil.

- Página nova:
  /completar-perfil.html

- Código de acesso por WhatsApp:
  POST /api/profissional-acesso/solicitar-codigo
  POST /api/profissional-acesso/validar-codigo

- Edição segura do próprio perfil:
  GET   /api/profissional-acesso/me
  PATCH /api/profissional-acesso/me

- Histórico de mensagens:
  tabela whatsapp_mensagens

PASSO 1 — RODAR SQL NO SUPABASE
Rode o arquivo:
schema-whatsapp-perfil.sql

PASSO 2 — VARIÁVEIS NA RAILWAY
Adicione:

WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=1232149849973535
WHATSAPP_BUSINESS_ACCOUNT_ID=4268099326743618
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v25.0
WHATSAPP_TEMPLATE_CADASTRO=cadastro_profissional_norte_servic
WHATSAPP_TEMPLATE_CODIGO=codigo_acesso_norte_servic
WHATSAPP_TEMPLATE_LANGUAGE=pt_BR
WHATSAPP_CODIGO_EXPIRA_MINUTOS=10
FRONTEND_URL=https://SEU-SITE.up.railway.app

Opcional para teste com texto livre dentro da janela de conversa:
WHATSAPP_PERMITIR_TEXTO_LIVRE=true

PASSO 3 — CONFIGURAR WEBHOOK NA META
Callback URL:
https://SEU-SITE.up.railway.app/api/whatsapp/webhook

Verify token:
o mesmo valor de WHATSAPP_WEBHOOK_VERIFY_TOKEN

Assinar o campo:
messages

PASSO 4 — TEMPLATES NA META
Crie estes modelos:

1) cadastro_profissional_norte_servic
Categoria sugerida: Utility
Idioma: pt_BR
Texto:
Olá, {{1}}! Aqui é da Norte Servic.

Você foi cadastrado no projeto Cidade Parceira de {{2}}.

Dados cadastrados:
Profissão: {{3}}
Setor: {{4}}

Para completar seu perfil com foto, descrição, Instagram e serviços oferecidos, acesse:
{{5}}

Caso não reconheça esse cadastro ou queira remover seus dados, responda esta mensagem.

2) codigo_acesso_norte_servic
Categoria sugerida: Utility ou Authentication, conforme a Meta aprovar.
Idioma: pt_BR
Texto:
Seu código de acesso Norte Servic é: {{1}}

Ele expira em {{2}} minutos.

Não compartilhe esse código com ninguém.

PASSO 5 — TESTE
1. Coletor cadastra profissional com WhatsApp válido.
2. Marque "Aparecer no site oficial".
3. Deixe marcado "Enviar WhatsApp automático".
4. Salve.
5. Veja na resposta se a mensagem foi enviada.
6. Profissional acessa /completar-perfil.html.
7. Digita o WhatsApp, solicita código, valida e completa o perfil.

IMPORTANTE
- Não coloque token da Meta no GitHub.
- O token vai somente nas variáveis da Railway.
- O ZIP foi limpo sem .env, .git e node_modules.
