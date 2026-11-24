# Decisões — Tarefa 6, rodada 2

Os dois pareceres da rodada 2 vieram APROVADO, sem apontamento bloqueante, e confirmam
que os apontamentos A, B e C aceitos na rodada 1 foram atendidos. As observações e
sugestões desta rodada foram apresentadas ao usuário, que decidiu não promover nenhuma.

| # | Observação/sugestão (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | O teste da conta pendente fixa o `POST` provisório (`sign-up.spec.ts:221`); na Tarefa 7 ele precisa virar `expectNone` | conformidade (observação) | não promovida | Decisão do usuário: nenhuma promovida. Fica como orientação para a Tarefa 7 |
| 2 | Com o estado provisório, o banco pode ter duas linhas do mesmo e-mail e o `findByEmail` (`.at(0)`) olha só a primeira | conformidade (observação) | não promovida | Decisão do usuário: nenhuma promovida. Fica como orientação para a Tarefa 7 |
| 3 | O seletor `[role="status"] p` prende o teste à tag e à posição do texto | código (sugestão 1) | não promovida | Decisão do usuário: nenhuma promovida |
| 4 | Na Tarefa 7, inverter a linha do `POST` do teste da conta pendente e remover o `TODO #1`, em vez de criar teste ao lado | código (sugestão 2) | não promovida | Decisão do usuário: nenhuma promovida. Fica como orientação para a Tarefa 7 |
