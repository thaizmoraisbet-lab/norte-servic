# Norte Servic — atualização visual v32

Esta versão reorganiza o projeto sem remover as funções existentes.

## Principais melhorias

- padrão visual único em todas as páginas, com azul, azul-marinho e branco;
- painel administrativo reconstruído para desktop e celular;
- navegação do admin sem recarregar a página inteira;
- cabeçalhos, formulários, botões, cartões, tabelas e espaçamentos alinhados;
- menu lateral recolhível no celular;
- módulos de profissionais, financeiro, indicações, coletores, Sala do Empreendedor, LGPD e avaliações preservados;
- estilos separados em `public/theme.css` e `public/admin.css` para facilitar futuras alterações.

## Executar localmente

1. Copie `.env.example` para `.env` e configure as credenciais do ambiente.
2. Execute `npm install`.
3. Execute `npm start`.
4. Acesse `http://localhost:3000` e `http://localhost:3000/admin`.

Antes de publicar, use senhas e chaves fortes no `.env`; não envie esse arquivo ao repositório.
