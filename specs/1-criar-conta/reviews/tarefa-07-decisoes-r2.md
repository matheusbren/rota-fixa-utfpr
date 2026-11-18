# Decisões — Tarefa 7, rodada 2

Os dois pareceres da rodada 2 vieram APROVADO, sem apontamento bloqueante, e confirmam
que o apontamento 1 aceito na rodada 1 foi atendido. As sugestões desta rodada foram
apresentadas ao usuário, que decidiu não promover nenhuma.

| # | Sugestão (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | `resendVerification` é um campo com arrow function enquanto as outras operações são métodos (`auth.service.ts:43`) | código (sugestão 1) | não promovida | Decisão do usuário: não promovida |
| 2 | O teste usa `toHaveBeenCalledWith` e não confere quantas vezes o reenvio é chamado (`sign-up.spec.ts:232`) | código (sugestão 2) | não promovida | Decisão do usuário: não promovida |
| 3 | O `filter((email) => email !== undefined)` só estreita o tipo; o ramo `undefined` não acontece hoje (`sign-up.ts:59`) | código (sugestão 3) | não promovida | Decisão do usuário: não promovida |
| 4 | Para o #20: nenhum teste prova a normalização do e-mail no reenvio | código (sugestão 4) | não promovida | Decisão do usuário: não promovida. Fica como orientação para a #20 |
