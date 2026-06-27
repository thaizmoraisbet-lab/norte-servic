Correção da Cidade Parceira após URLs limpas

Problema encontrado:
- Ao acessar https://www.norteservic.com.br/cidade, os arquivos cidade.css e cidade.js eram procurados em /cidade.css e /cidade.js.
- O correto é /cidade/cidade.css e /cidade/cidade.js.
- Com isso, a página aparecia sem layout premium e o botão de senha não funcionava corretamente.

Correção feita:
- As páginas em public/cidade agora usam caminhos absolutos:
  /style.css
  /cidade/cidade.css
  /cidade/cidade.js

Arquivos corrigidos:
- public/cidade/index.html
- public/cidade/home.html
- public/cidade/coletor.html
- public/cidade/profissionais.html
- server.js com reforço para /cidade e /cidade/

Não precisa rodar SQL.
