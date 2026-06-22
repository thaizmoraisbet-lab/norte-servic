NORTE SERVIC V18 — LOADING CENTRAL FIXO + ADMIN COMPACTO + RELATÓRIO PDF

Correções aplicadas:
1. Loading global realmente fixo no centro da tela, mesmo quando o usuário está no meio/fim da rolagem.
2. Travamento de tela sem pular para o topo; ao fechar o loading, volta para a posição em que o usuário estava.
3. Loading padronizado com ícone da marca Norte Servic, sem logo achatada/feia.
4. Correção dos cards invisíveis da Sala do Empreendedor.
5. Admin mais compacto e premium para ver mais registros por tela: pagamentos, coletores, profissionais, saques, avaliações e Sala do Empreendedor.
6. Botão Baixar relatório da Sala do Empreendedor agora baixa PDF personalizado, não TXT.
7. Cache busting atualizado para forçar navegador a carregar CSS/JS novos.

Depois de subir:
- Faça git add .
- git commit -m "Corrige loading central e admin compacto premium"
- git push origin main

Teste principalmente:
- rolar até o meio/fim e abrir outra aba do admin;
- carregar Cidade Parceira/coletor no celular;
- clicar em Baixar relatório na Sala do Empreendedor;
- abrir Pagamentos, Coletores, Profissionais e Sala do Empreendedor.
