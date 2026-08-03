# Norte Servic V36 — Redesign Premium Dark/Gold

## Objetivo
A V36 aplica uma nova identidade visual pública inspirada em marketplaces modernos, com fundo azul-preto, dourado como cor de destaque, bordas sutis e componentes compactos. O foco desta etapa é Home, navegação pública, busca, categorias, cards de profissionais, cadastro e login, sem reescrever os módulos administrativos ou da Cidade Parceira.

## Principais alterações
- Nova paleta `dark + gold` e novo símbolo visual da Norte Servic.
- Home reconstruída com hero responsivo, CTA principal, seção de categorias, profissionais em destaque, faixa de confiança, seção "Como funciona" e CTA para profissionais.
- Hero desktop com composição visual própria; no mobile a imagem é removida para priorizar velocidade e leitura.
- Busca pública ampliada para serviço, cidade/bairro e categoria.
- Backend de `/api/profissionais` atualizado para aceitar o filtro de localização também pelo bairro.
- Seletor de categorias carregado diretamente do catálogo real do sistema; não existem contagens fictícias de profissionais.
- Cards públicos reescritos em formato compacto, com foto/inicial, avaliação, localização, status do WhatsApp, plano/verificação e link de perfil.
- Cadastro simples da V35 mantido, mas totalmente redesenhado para o novo tema.
- Login profissional redesenhado com a mesma linguagem visual.
- Cabeçalho público atualizado também em Planos, Perfil, Painel Profissional, Editar Perfil, Recuperar Senha, Documentos Legais e Completar Perfil para manter continuidade visual.
- Menu mobile com botão hambúrguer e navegação rápida inferior na Home.
- Favicons, ícones PWA, `site.webmanifest` e imagem de compartilhamento atualizados para a nova identidade.
- Cache-busting dos arquivos públicos alterado para `?v=36`.

## Compatibilidade
- Fluxo de cadastro e login preservado.
- IDs utilizados pelo JavaScript e endpoints existentes foram mantidos.
- Não exige nova migração SQL.
- Railway continua iniciando por `npm start` / `node server.js`.
- Variáveis de ambiente existentes continuam válidas.

## Validações realizadas
- `npm run check` concluído sem erros.
- Sintaxe do backend validada com `node --check`.
- Referências locais verificadas pelo script do projeto.
- Renderização responsiva revisada em 1536 px e 390 px.
- Páginas públicas principais verificadas em 390 px sem largura horizontal excedente.
- Fluxo dinâmico da Home testado com API simulada: carregamento de profissionais, preenchimento de categorias, filtro por categoria, busca por serviço/cidade e menu mobile.

## Arquivos de destaque
- `public/index.html`
- `public/cadastro.html`
- `public/login.html`
- `public/assets/css/base.css`
- `public/assets/js/features/public.js`
- `src/server.js`
- `public/assets/img/v36/hero-profissionais.webp`
