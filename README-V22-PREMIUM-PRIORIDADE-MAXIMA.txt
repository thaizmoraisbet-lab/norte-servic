NORTE SERVIC V22 — POLIMENTO PREMIUM / PRIORIDADE MÁXIMA

Principais ajustes:
- Favicon instalado em todas as páginas HTML.
- Loadings padronizados com ícone simples "NS", sem logo temporária.
- Loading forçado em position: fixed no viewport atual, para ficar no centro da tela mesmo com rolagem.
- Admin mais compacto e premium: pagamentos, profissionais, coletores, Cidade Parceira e Sala do Empreendedor.
- Espaçamentos entre gráficos, filtros, botões e listas ajustados.
- Cidade Parceira com abas internas: Coletas, Publicados e Relatório.
- Sala do Empreendedor com resumo, filtros, lista compacta e relatório PDF institucional.
- Botões de editar perfil mais visíveis no admin.
- Botão de enviar nota fiscal pelo WhatsApp nos pagamentos pagos.
- Botão auxiliar de reenviar WhatsApp/convocação em áreas administrativas.
- Coletor mobile melhorado: opções tocáveis, checkboxes corrigidos, tela final fixa e botões “Cadastrar próximo” e “Copiar link do perfil”.
- Lista de profissões ampliada com comércio local, alimentação, sacoleira, técnico de ar-condicionado e outros.

SQL:
- Esta atualização é principalmente visual/JS. Se você já rodou os SQL anteriores da Sala do Empreendedor, não precisa rodar SQL novo.

Deploy:
git add .
git commit -m "Polimento premium v22 Norte Servic"
git push origin main
