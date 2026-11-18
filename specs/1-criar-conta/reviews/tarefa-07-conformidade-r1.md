# Parecer de Conformidade — Tarefa 7

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA7: conta já existe e está pendente; ao confirmar o cadastro, vejo o aviso de verificação pendente | atendido | `apps/web/src/app/core/auth/auth.service.ts:24-27` (com conta achada, devolve `'pending'` quando `emailVerified` é falso); `apps/web/src/app/features/auth/sign-up/sign-up.html:23-32`; teste em `apps/web/src/app/features/auth/sign-up/sign-up.spec.ts:221-223` |
| CA7: o aviso traz o botão "Reenviar e-mail de verificação" | atendido | `sign-up.html:33-39`; teste em `sign-up.spec.ts:226` (o `tap` tem `expect(element).toBeDefined()`, em `sign-up.spec.ts:65`) |
| CA7: nenhuma conta duplicada é criada | atendido | `auth.service.ts:25-26` (retorna antes do `create`); teste em `sign-up.spec.ts:218` (`expectNone` do `POST /users`) e `sign-up.spec.ts:24` (o `httpTesting.verify()` derruba o teste se sobrar qualquer requisição) |
| CA7: ao tocar em "Reenviar e-mail de verificação", vejo "E-mail reenviado" | atendido | `sign-up.ts:52-65`, `sign-up.html:40-42`; teste em `sign-up.spec.ts:224` (ausente antes do toque) e `sign-up.spec.ts:228` (presente depois) |
| Abandono no meio, "Fecha a aba depois de confirmar": o novo cadastro do mesmo e-mail não pode gerar segunda conta nem um "já cadastrado" que empurre para a tela de entrar | atendido | `sign-up.spec.ts:218-220` (sem `POST`, sem "Este e-mail já tem conta", sem link "Entrar") |
| Assume que: o "Reenviar" só mostra a confirmação, sem envio, com `// TODO #20` | atendido | `auth.service.ts:38-42` |
| Fora de escopo: não limitar os reenvios | atendido (sem limite, nada além do pedido) | `sign-up.ts:49-51` |
| Glossário `architecture.md` §5.1, "Conta pendente": o `emailVerified` do `users` | atendido | `docs/architecture.md:474-477` contra `auth.service.ts:26` |
| CA1 a CA6, CA8, CA9 | fora desta tarefa | — |

## Apontamentos

---

## Testes e lint que rodei
- `npm test` na raiz: 6 arquivos e **40 testes, todos passando**. Rodei também com `--reporters=verbose` e confirmei que o teste do CA7 executa e passa: `SignUp > avisa que falta verificar o e-mail, não grava outra conta e reenvia o e-mail`.
- `npm run lint` na raiz: "All files pass linting."

## Como cheguei ao parecer
- **O teste prova o critério.** O componente roda com o `AuthService` e o `UsersService` de verdade sobre o `HttpTestingController`. Nada é mockado, então o teste não fica só conferindo um mock.
- **O teste falharia antes da mudança.** Com o código anterior, a conta pendente seguia para o `POST` (o antigo `TODO #1` em `auth.service.ts`). Isso derruba o `expectNone` da linha 218 e o `verify()`. Ele também distingue o aviso de pendente do banner do CA3: procura "Falta verificar o e-mail" com F maiúsculo, e o banner do CA3 diz "Agora falta verificar o e-mail".
- **Não sobrou pendência.** Não há `TODO #1` nem referência à Tarefa 7 esperando trabalho em `apps/web/src`.
- **Escopo:** a mudança fica nos arquivos que o plano prevê (`core/auth/auth.service.ts`, `features/auth/sign-up/`) e não acrescenta nada que a spec não peça.

Nenhum arquivo foi alterado. O Bash serviu só para `git diff`, `git status`, `grep`, `npm test` e `npm run lint`.
