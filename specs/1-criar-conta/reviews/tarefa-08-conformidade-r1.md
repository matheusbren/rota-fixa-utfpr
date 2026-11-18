# Parecer de Conformidade: Tarefa 8

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA8: "quando a gravação está em andamento, então o botão mostra 'Criando conta…'" | atendido | `apps/web/src/app/features/auth/sign-up/sign-up.html:90-95` (`@if (submitting())`), `apps/web/src/app/features/auth/sign-up/sign-up.ts:46-48` (`submitting` vale do envio até o resultado chegar). Teste em `sign-up.spec.ts:249`. As reticências são o caractere U+2026, igual à spec, conferido byte a byte no HTML e no teste. |
| CA8: "e fica bloqueado" | atendido | `sign-up.html:88` (`[disabled]="form.invalid \|\| submitting()"`). Teste em `sign-up.spec.ts:248`. |
| CA8: "e um segundo toque não cria uma segunda conta" | atendido | O botão desabilitado (`sign-up.html:88`) já impede o segundo toque. Por baixo disso, o `exhaustMap` que já existia (`sign-up.ts:41`) ignora um segundo envio enquanto há um em andamento. Teste em `sign-up.spec.ts:251-252`: o `expectNone` usa só a URL, sem filtrar o método, então não aceitaria nem um segundo GET nem um segundo POST. |
| Abandono no meio: "Toca duas vezes porque a resposta demora… o botão trava enquanto grava" | atendido | Os mesmos pontos das três linhas acima. |
| O teste prova o critério (não é asserção fraca) | atendido | `sign-up.spec.ts:237-253`. O teste responde à busca do e-mail e deixa o POST sem resposta (`:244-246`), que é o cenário que o plano pede. O botão é guardado antes do toque (`:242`), então as asserções valem para o mesmo elemento. Antes da mudança, o `[disabled]` dependia só de `form.invalid`, e por isso `:248` e `:249` falhariam, como o plano prevê. Só `:252` passaria antes, por causa do `exhaustMap`, mas a fase RED não depende dela. |
| Sem escopo inflado | atendido | Os arquivos alterados ficam todos em `features/auth/sign-up/`, como o plano prevê. O ícone girando (`sign-up.html:91`, `aria-hidden`) é o estado "carregando" do botão definido em `docs/design-tokens.md:142`: "mostra o ícone girando e o verbo no gerúndio… e bloqueia um segundo clique". Isso é aparência, não é comportamento novo. |
| Glossário do `docs/architecture.md` | atendido | Não aparece termo de domínio novo. `submitting` é estado de tela e já estava previsto em `plan.md:37` ("signal `submitting`"). |
| CA1 a CA7 | fora desta tarefa | São das tarefas 1 a 7. Os testes deles continuam verdes. |
| CA9 e a nova tentativa depois da falha | fora desta tarefa | É a Tarefa 9. Fica um aviso para ela, sem bloquear esta: `submitting` depende de `result() === undefined` (`sign-up.ts:47`). Quando a Tarefa 9 criar o resultado `failed` e o formulário voltar, `result()` continua `'failed'` durante a nova tentativa. Com isso, `submitting()` fica falso, e o botão não mostra "Criando conta…" nem fica bloqueado nesse segundo envio. Isso contraria o CA8, que vale para toda confirmação válida. O `exhaustMap` continua impedindo a requisição duplicada. O teste da Tarefa 9 deveria cobrir esse caso. Hoje o caso não existe, porque `SignUpResult` (`apps/web/src/app/core/auth/auth.service.ts:12`) não tem `failed`. |

## Apontamentos

## Testes executados
- `npm test` na raiz: 6 arquivos e 41 testes, todos passaram. Rodei também `npx ng test --reporters=verbose` em `apps/web` para confirmar que o teste do CA8 é executado. Ele aparece como "mostra "Criando conta…" e bloqueia o botão enquanto grava, sem gravar duas vezes" e passou.
- `npm run lint` na raiz: "All files pass linting."

Diff revisado (`git diff 0daf255678e494131a5fd2a7436277b7164522d0`), com três arquivos, todos no índice:
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts

Não alterei nenhum arquivo. Como o revisor é somente leitura, este parecer ainda não foi gravado em `/home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-08-conformidade-r1.md`. Quem grava é o fluxo.
