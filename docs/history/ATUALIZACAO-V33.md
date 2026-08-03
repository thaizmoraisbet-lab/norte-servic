# Norte Servic — atualização visual e estabilização v33

Esta versão preserva as funções do projeto e adiciona uma camada final de interface para impedir que os estilos antigos e acumulados quebrem o layout.

## O que o sistema faz

A Norte Servic é uma plataforma regional de contratação de serviços. Clientes pesquisam profissionais, analisam perfis e entram em contato pelo WhatsApp. Profissionais podem se cadastrar, editar o perfil, contratar planos de destaque, acompanhar pagamentos e participar do programa de indicações.

O projeto também possui:

- painel administrativo para aprovar e gerenciar profissionais;
- controle de assinaturas, pagamentos Pix e faturamento;
- avaliações e moderação;
- indicações, comissões e solicitações de saque;
- módulo Cidade Parceira, com painel municipal e coletores de cadastros;
- Sala do Empreendedor, com informações de MEI, nota fiscal, cursos e formalização;
- solicitações de privacidade, exportação e exclusão de dados.

## Melhorias da v33

- nova camada visual `public/ui-v33.css`, carregada por último em todas as telas;
- cabeçalho responsivo com menu recolhível no celular;
- formulários, botões, cartões, modais, filtros e tabelas padronizados;
- home, cadastro, login, planos, painel profissional, perfil, documentos legais, admin e Cidade Parceira revisados;
- painel administrativo mais legível no desktop e no celular;
- tratamento automático de tabelas largas;
- proteção contra loader preso cobrindo a página;
- correção de links gerados com barra dupla, como `//completar-perfil` e `//perfil`;
- melhoria de foco por teclado e respeito à preferência de movimento reduzido;
- nova camada de comportamento em `public/ui-v33.js` sem substituir as regras de negócio existentes.

## Arquivos principais adicionados

- `public/ui-v33.css`
- `public/ui-v33.js`

## Publicação

As variáveis já usadas pelo projeto continuam necessárias. Copie `.env.example` para `.env`, preencha as credenciais e execute:

```bash
npm install
npm start
```

No Railway, confirme principalmente `DATABASE_URL`, `JWT_SECRET` e `ADMIN_SESSION_SECRET`, além das variáveis de Supabase, WhatsApp e Efí usadas no seu ambiente.
