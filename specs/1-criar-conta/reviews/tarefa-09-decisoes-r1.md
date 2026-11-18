# Decisões — Tarefa 9, rodada 1

Os dois pareceres da rodada 1 vieram APROVADO, sem apontamento bloqueante. As sugestões do
parecer de código, e a observação não bloqueante do parecer de conformidade, foram
apresentadas ao usuário, que decidiu não promover nenhuma.

| # | Sugestão (resumo) | Origem | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | O `catchError` converte qualquer erro, não só `HttpErrorResponse`, e descarta o erro sem registrá-lo (`auth.service.ts:37`) | código (sugestão 1) | não promovida | Decisão do usuário: não promovida |
| 2 | A falha na busca `GET` também vira `failed`, mas não tem teste próprio (`auth.service.ts:21-22`, `sign-up.spec.ts:276`) | código (sugestão 2); também observação do parecer de conformidade | não promovida | Decisão do usuário: não promovida |
| 3 | O adiamento do `errorInterceptor` não está na lista "A ratificar" do `plan.md` e o código não tem `TODO` com Issue | código (sugestão 3) | não promovida | Decisão do usuário: não promovida |
| 4 | A caixa de erro é escrita à mão no template (`sign-up.html:85-92`); no segundo uso, o lugar é um tom no `app-banner` | código (sugestão 4) | não promovida | Decisão do usuário: não promovida |
