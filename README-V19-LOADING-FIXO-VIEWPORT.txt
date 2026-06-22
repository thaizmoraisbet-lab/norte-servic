V19 — CORREÇÃO DO CARREGAMENTO FIXO NO CENTRO DA TELA

Correções:
1. Removido body position: fixed durante loading, que jogava o carregamento para o topo em páginas longas.
2. Loading agora fica fixo no viewport atual com position: fixed + centro em 50dvh/50dvw.
3. Bloqueio de rolagem feito por overflow/touch-action, sem deslocar o documento.
4. Removido ícone duplicado no carregamento.
5. Removido arquivo public/logo-norte-servic.png. O loading fica com ícone normal/check até a logo final ficar pronta.
6. Atualizados cache-busters para v19.

Teste:
- Abra admin/cidade/coletor em uma página longa.
- Role até o meio/final.
- Acione troca de aba ou carregamento.
- O loading deve aparecer no centro exato da tela atual, no computador e no celular.
