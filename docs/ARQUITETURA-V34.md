# Arquitetura Norte Servic V34

## Estrutura de execução

- `server.js`: ponto de entrada usado pelo Railway.
- `src/server.js`: aplicação Express, integrações e rotas da API.
- `src/config/paths.js`: caminhos centrais do projeto.
- `public/assets/css`: estilos consolidados por área.
- `public/assets/js/core`: catálogo, API e interface compartilhada.
- `public/assets/js/features`: módulos público, profissional e administrativo.
- `public/assets/js/cidade`: módulos exclusivos da Cidade Parceira.
- `database/schema.sql`: estrutura principal do banco.
- `database/migrations`: alterações incrementais do banco, separadas do código de execução.

## Regra para próximas atualizações

Não anexar uma nova função com o mesmo nome no final do arquivo. A função existente deve ser alterada no módulo correto. Uma nova migração SQL deve ser adicionada em `database/migrations`, sem duplicar o schema principal.
