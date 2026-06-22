V17 - Sala do Empreendedor + Bugs corrigidos

Principais mudanças:
1. Coletor: tela de conclusão virou modal premium fixo, sem rolagem gigante.
2. Coletor: envio trava enquanto está salvando, evitando duplo clique/travamento.
3. Coletor: novas perguntas para Sala do Empreendedor: MEI, formalização, nota fiscal, curso, DAS, declaração, vender para prefeitura, divulgação e precificação.
4. Coletor: lista de profissões ampliada, incluindo comércio local, dono de boteco, restaurante, sacoleira, técnicos, manutenção, rural, eventos e outros.
5. Admin: botão Editar no perfil do profissional para alterar dados direto pelo painel.
6. Admin: aba Pagamentos/Pix pagos ganhou botão Enviar nota fiscal pelo WhatsApp.
7. Admin: novo módulo Sala do Empreendedor com filtros e relatório.
8. Admin: profissionais do Cidade Parceira ficaram em cards compactos, com rolagem menor e visual mais premium.
9. Rodapé: contato agora abre WhatsApp da Norte Servic provisoriamente.
10. Documentos legais foram ampliados: Termos, Privacidade, Cookies, LGPD, Cidade Parceira e Indicações/Saques.
11. Loading global usa logo da Norte Servic e animação mais leve.

SQL recomendado no Supabase:
Rode o arquivo schema-sala-empreendedor-v17.sql no SQL Editor.

Deploy:
git add .
git commit -m "Atualiza bugs, Sala do Empreendedor e admin premium"
git push origin main

Observação:
Os textos jurídicos são uma base institucional inicial. Antes de usar em produção formal com prefeitura, recomenda-se revisão jurídica.
