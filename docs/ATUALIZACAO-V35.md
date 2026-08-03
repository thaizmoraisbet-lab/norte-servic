# Norte Servic V35 — Design e onboarding

## Cadastro profissional

O cadastro inicial foi reduzido para nome, profissão, cidade, WhatsApp, senha e aceite legal. Categoria e serviço inicial são derivados da profissão. Foto, descrição, bairro, Instagram, serviços detalhados e cidades atendidas passam para a etapa de completar perfil.

Após o cadastro, a API devolve uma sessão profissional e o usuário segue diretamente para `/completar-perfil`, sem precisar fazer login novamente.

## Completar perfil

A tela de onboarding agora atende dois fluxos: profissionais que acabaram de se cadastrar no site e profissionais cadastrados pela Cidade Parceira que acessam por código no WhatsApp. A tela possui indicador de força do perfil, checklist, foto opcional, serviços, apresentação, localização complementar e botão para continuar depois.

## Design system

Os estilos antigos acumulados foram substituídos por três folhas isoladas: `base.css`, `admin.css` e `cidade.css`. Foram padronizados tipografia, contraste, botões, inputs, cards, navegação, tabelas, modais, selos e comportamento responsivo.

Foram adicionadas regras específicas para elementos gerados por JavaScript, incluindo selos de plano/verificação, avaliações, cards administrativos de pagamento, gráficos, prévias de fotos e componentes da Cidade Parceira. Ícones e selos usam dimensões fixas/flexíveis sem ocupar o espaço do nome ou do número ao lado.

## Backend

A rota `POST /api/cadastro` retorna token da sessão após criar a conta. A rota autenticada `PATCH /api/me/completar` permite concluir o perfil pelo onboarding normal.

Não há nova migração obrigatória de banco nesta versão.

## Publicação

Antes de publicar, execute:

```bash
npm install
npm run check
npm start
```

No Railway, mantenha as variáveis existentes. As integrações Supabase, Efí e WhatsApp devem ser testadas no ambiente publicado, pois dependem das credenciais externas.
