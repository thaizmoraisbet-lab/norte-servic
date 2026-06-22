NORTE SERVIC CIDADE PARCEIRA - INTEGRAÇÃO

O que foi integrado:
- Área separada em: public/cidade/index.html
- Consulta agrupada por profissão em: public/cidade/profissionais.html
- CSS próprio mantendo a identidade do site: public/cidade/cidade.css
- JS próprio: public/cidade/cidade.js
- Rotas no backend: /api/cidade/...
- Schema auxiliar: schema-cidade-parceira.sql
- Link no rodapé do site oficial: Painel Admin + Cidade Parceira

Senha da Cidade Parceira:
- Configure no .env / Railway / Render / Discloud:
  CIDADE_PARCEIRA_PASSWORD=cidade123
  CIDADE_JWT_SECRET=troque_por_uma_senha_grande_cidade
  CIDADE_MUNICIPIO_PADRAO=Muricilândia - TO

Coletores padrão criados automaticamente no Supabase pelo server.js:
- coletor.novacanaa@norteservic.com.br / Nova123 / setor Nova Canaã
- coletor.novamuricilandia@norteservic.com.br / Moricilandia123 / setor Nova Muricilândia
- coletor.centro@norteservic.com.br / Centro123 / setor Centro

Funcionamento:
1. O visitante entra no site oficial e clica em Cidade Parceira no rodapé.
2. A home da Cidade Parceira só abre após a senha definida em CIDADE_PARCEIRA_PASSWORD.
3. Dentro da home existe a aba do coletor.
4. O coletor faz login; o setor dele vem do Supabase.
5. O coletor cadastra o profissional em campo.
6. Se marcar “aceitou aparecer no site oficial”, o cadastro também é publicado na tabela profissionais com status aprovado.
7. Como o site oficial já busca profissionais aprovados em /api/profissionais, esse profissional passa a aparecer automaticamente na home principal.

Observação:
- O ZIP gerado não leva .env nem node_modules. Suba suas variáveis de ambiente no servidor e rode npm install antes do start, se necessário.

Atualização V3:
- A home da Cidade Parceira não mostra mais o formulário do coletor na mesma rolagem.
- O botão Área do coletor agora abre a página separada /cidade/coletor.html.
- A página /cidade/coletor.html possui login centralizado do coletor e, após entrar, mostra o questionário de coleta.
- O aviso do contador foi alterado para: Dados reais coletados pela Norte Servic em tempo real.
- O indicador verde possui animação pulsante para reforçar atualização automática.
- A home atualiza os números automaticamente a cada 12 segundos enquanto a página estiver aberta.


ATUALIZAÇÃO COMISSÃO DO COLETOR:
- Cada cadastro finalizado soma R$ 2,00.
- A barra de progresso acompanha a meta diária de R$ 50,00.
- O botão de saque só libera ao completar R$ 50,00 no dia.
- Ao tentar sacar antes da meta, o sistema mostra a regra: os cadastros são avaliados pelo time da Norte Servic antes do pagamento.
- Variáveis novas: CIDADE_COMISSAO_VALOR_CADASTRO=2 e CIDADE_COMISSAO_META_SAQUE=50.
