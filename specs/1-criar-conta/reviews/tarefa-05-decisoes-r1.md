# Decisões — Tarefa 5, rodada 1

Os dois pareceres vieram APROVADO, sem apontamento bloqueante. As duas observações do
revisor de conformidade e as quatro sugestões do revisor de código foram apresentadas ao
usuário, que decidiu não promover nenhuma a apontamento aceito e confirmou a ordem
"tamanho primeiro" escolhida pelo implementador.

| # | Observação/sugestão (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| A | Quando faltam os dois requisitos (`abc`, `123`, vazio), aparece só a mensagem do tamanho; a ordem foi escolhida pelo implementador | conformidade (observação) | não promovida; ordem confirmada | Decisão do usuário: confirma a ordem "tamanho primeiro" |
| B | O tamanho é contado em unidades UTF-16 (`value.length`): um emoji conta como 2 | conformidade (observação) | não promovida | Decisão do usuário: nenhuma sugestão promovida |
| 1 | A marcação do aviso (`@let`, `aria-invalid`, `aria-describedby`, `<p id>`) agora existe duas vezes; abstrair num `error` do `app-form-field` | código (sugestão) | não promovida | Decisão do usuário: nenhuma sugestão promovida |
| 2 | O validador devolve só a primeira falha e decide o que a tela mostra; limita reúso numa tela que liste todos os requisitos | código (sugestão) | não promovida | Decisão do usuário: confirma a ordem "tamanho primeiro" (um requisito por vez) |
| 3 | O tamanho conta unidades UTF-16; `[...value].length` contaria pontos de código | código (sugestão) | não promovida | Decisão do usuário: nenhuma sugestão promovida |
| 4 | O valor `null` quebra o validador (mesmo padrão da sugestão 1 da Tarefa 4) | código (sugestão) | não promovida | Decisão do usuário: nenhuma sugestão promovida |
