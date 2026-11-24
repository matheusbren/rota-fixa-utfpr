# Decisões — Tarefa 7, rodada 1

O parecer de conformidade veio APROVADO, sem apontamento. O parecer de código trouxe um
apontamento bloqueante e duas sugestões. As sugestões foram apresentadas ao usuário, que
decidiu não promover nenhuma.

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | `resendVerification()` não recebe o e-mail da conta pendente (`auth.service.ts:38-42`, chamado em `sign-up.ts:57`); na E3 a troca obrigaria a mexer na tela, contra o §2.1 | código | aceito | — |
| 2 | A caixa de aviso pendente repete à mão a caixa do CA6 (`sign-up.html:24-27`), em vez de decidir as variantes do `app-banner` | código (sugestão 1) | não promovida | Decisão do usuário: não promovida |
| 3 | Para o #20: o reenvio não tem caminho de falha, o `resent` não volta a `false` e nenhum teste prova um segundo reenvio (`sign-up.ts:54-61`) | código (sugestão 2) | não promovida | Decisão do usuário: não promovida |
