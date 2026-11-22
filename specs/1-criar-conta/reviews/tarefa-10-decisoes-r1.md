# Decisões — Tarefa 10, rodada 1

Os dois pareceres da rodada 1 vieram APROVADO, sem apontamento bloqueante. As duas
observações do parecer de conformidade e as três sugestões do parecer de código foram
triadas no fechamento da história: nenhuma foi promovida a apontamento aceito, com o
motivo abaixo.

| # | Observação/sugestão (resumo) | Origem | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | O §2.1 generaliza a decisão da US01: "até ele nascer, o Service converte a falha" passa a valer para todo Service (`architecture.md:132-133`) | conformidade (observação 1) | não promovida; texto confirmado | É a consequência direta de duas regras que o documento já tinha: não existe interceptor ainda e componente não fala com o servidor. Sem a frase, "o único lugar que traduz erro HTTP" contradiria o `AuthService` de hoje |
| 2 | O `emailVerified` do modelo (`core/models/user.ts:9`) não tem `TODO #20` na declaração | conformidade (observação 2) | não promovida | `core/models/user.ts` não está nos arquivos previstos da tarefa, e a premissa 2 já tem dois `TODO #20` (`signUp` e `resendVerification`). O texto da Issue #20 já cita o campo |
| 3 | O §2 ainda diz que a troca da E3 "atinge só os Services" (`architecture.md:60`); com o §2.1 novo, a E3 também cria `core/http/` e registra o interceptor no `app.config.ts` | código (sugestão 1) | recusada nesta tarefa | A tarefa manda mexer só no §2.1 e no §7. A frase do §2 entra na ratificação do `architecture.md` que a Issue #21 já carrega. A regra que importa (nenhuma tela muda na troca) continua verdadeira |
| 4 | O nascimento do `errorInterceptor` tem condição, mas não tem Issue dona; cada história pode repetir um `catchError` no seu Service | código (sugestão 2) | não promovida | O texto é o que o plano mandou escrever. Escolher qual história carrega o interceptor é decisão de backlog, não desta tarefa: fica como candidata a Issue de manutenção |
| 5 | `(spec, "Assume que")` não diz qual spec | código (sugestão 3) | não promovida | Os comentários novos seguem o padrão dos que já existiam (`auth.service.ts:47`, `sign-up.ts:58`), e o número da Issue já leva ao lugar certo. Trocar o padrão seria mexer em comentários fora do diff |

Observações fora do escopo do diff, registradas como candidatas a Issue de manutenção: o
`docs/architecture.md` não passa no `prettier --check` (já não passava em `3880b84`), e o
link "Entrar" não muda nada na tela até a US02 (confirmado na conferência no navegador;
coberto pela premissa 3 do "Assume que" e pela #2).
