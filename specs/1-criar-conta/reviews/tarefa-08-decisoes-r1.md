# Decisões — Tarefa 8, rodada 1

Os dois pareceres da rodada 1 vieram APROVADO, sem apontamento bloqueante. As sugestões do
parecer de código, e uma divergência levantada pelo tutor na leitura do diff, foram
apresentadas ao usuário, que decidiu não promover nenhuma.

| # | Sugestão (resumo) | Origem | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | `submitting` depende de `result() === undefined` (`sign-up.ts:46-48`); com o `failed` da Tarefa 9, a nova tentativa não mostraria "Criando conta…" nem bloquearia o botão | código (sugestão 1); também no parecer de conformidade | não promovida | Decisão do usuário: não promovida. Fica como orientação para a Tarefa 9 |
| 2 | O teste guarda a referência ao botão antes do toque (`sign-up.spec.ts:241-251`) e quebraria se o template virasse dois botões em `@if`/`@else` | código (sugestão 2) | não promovida | Decisão do usuário: não promovida |
| 3 | Durante a gravação o botão usa o cinza de desabilitado (`sign-up.html:87-88`); conferir nos prints do PR | código (sugestão 3) | não promovida | Decisão do usuário: não promovida |
| 4 | O `expectNone` com critério em texto (`sign-up.spec.ts:252`) compara a URL com parâmetros, então pegaria um segundo `POST /users` mas não um segundo `GET /users?email=…`, ao contrário do que dizem os dois pareceres | tutor (modo passo) | não promovida | Decisão do usuário: não promovida |
