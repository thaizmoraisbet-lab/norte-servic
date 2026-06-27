Norte Servic — URLs limpas sem .html

O que foi feito:
- server.js recebeu rotas limpas:
  /login
  /cadastro
  /planos
  /perfil
  /painel-profissional
  /editar-perfil
  /completar-perfil
  /recuperar-senha
  /documentos-legais
  /admin
  /cidade
  /cidade/home
  /cidade/coletor
  /cidade/profissionais

- URLs antigas com .html redirecionam automaticamente para a versão limpa:
  /login.html -> /login
  /planos.html -> /planos
  /cidade/coletor.html -> /cidade/coletor

- Links internos do site foram atualizados para usar URLs limpas.

Não precisa rodar SQL.
