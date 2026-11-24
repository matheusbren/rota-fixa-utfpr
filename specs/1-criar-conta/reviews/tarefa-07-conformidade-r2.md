# Parecer de Conformidade — Tarefa 7

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA7: a conta do e-mail já existe e está pendente; ao confirmar o cadastro, vejo o aviso de verificação pendente | atendido | `apps/web/src/app/core/auth/auth.service.ts:12` (`'pending'` entra no `SignUpResult`) e `:25-27` (com conta achada, devolve `'pending'` quando `emailVerified` é falso); `apps/web/src/app/features/auth/sign-up/sign-up.html:23-32`; teste em `apps/web/src/app/features/auth/sign-up/sign-up.spec.ts:225-227` |
| CA7: o aviso traz o botão "Reenviar e-mail de verificação" | atendido | `sign-up.html:33-39`; teste em `sign-up.spec.ts:230` (o `tap` faz `expect(element).toBeDefined()` em `sign-up.spec.ts:66`, então o teste cai se o botão não existir) |
| CA7: nenhuma conta duplicada é criada | atendido | `auth.service.ts:25-27` (retorna antes do `create`, que está em `:28-33`); teste em `sign-up.spec.ts:222` (`expectNone` do `POST /users`) e `sign-up.spec.ts:25` (o `httpTesting.verify()` derruba o teste se sobrar requisição) |
| CA7: ao tocar em "Reenviar e-mail de verificação", vejo "E-mail reenviado" | atendido | `sign-up.ts:52-68`, `sign-up.html:40-42`; teste em `sign-up.spec.ts:228` (o texto não aparece antes do toque) e `sign-up.spec.ts:233` (aparece depois) |
| Abandono no meio, "Fecha a aba depois de confirmar": cadastrar de novo o mesmo e-mail não pode gerar uma segunda conta nem um "já cadastrado" que mande a pessoa para a tela de entrar | atendido | `sign-up.spec.ts:222-224` (sem `POST`, sem "Este e-mail já tem conta", sem link "Entrar") |
| Abandono no meio, "A conexão cai": a nova tentativa não duplica a conta quando a primeira gravou | atendido na parte desta tarefa (a conta pendente é achada antes de gravar) | `auth.service.ts:23-27` |
| Assume que: o "Reenviar" só mostra a confirmação, sem envio | atendido | `auth.service.ts:40-43` (`of(undefined)` com `// TODO #20`) |
| Fora de escopo: não limitar os reenvios | atendido (não há limite e nada além do pedido) | `sign-up.ts:49-52`, `:66-68` |
| Glossário `docs/architecture.md` §5.1, "Conta pendente": o campo `emailVerified` de `users` | atendido | `docs/architecture.md:474-477` contra `auth.service.ts:26` |
| Apontamento aceito na rodada 1 (código, decisão 1): `resendVerification` recebe o e-mail | conferido, sem efeito sobre a conformidade | `auth.service.ts:43` (`(email: string) => Observable<void>`), `sign-up.ts:58-60` (manda o e-mail do envio que deu `pending`), teste em `sign-up.spec.ts:203` e `:232` |
| CA1 a CA6, CA8 e CA9 | fora desta tarefa | — |

## Apontamentos

---

## Testes e lint que rodei
- `npm test` na raiz deu **6 arquivos e 40 testes, todos passando**. Também pedi o reporter verbose com `npm test -- --reporter=verbose` na raiz, mas o npm ignorou o flag com um aviso. Por isso rodei `npm test -w apps/web -- --reporters=verbose`, que deu os mesmos 40 testes verdes. Com ele confirmei que o teste do CA7 roda e passa: `SignUp > avisa que falta verificar o e-mail, não grava outra conta e reenvia o e-mail`.
- `npm run lint` na raiz: "All files pass linting."
- Rodei `git diff --stat` antes e depois dos testes e ele veio vazio nas duas vezes: o working tree não mudou fora do que já estava no índice.

## Como cheguei ao parecer
- **O teste prova o critério e não só um mock.** O componente roda com o `AuthService` e o `UsersService` de verdade sobre o `HttpTestingController`. O `vi.spyOn` da linha 203 não troca a implementação, então a chamada passa para o `of(undefined)` real. Assim, a asserção de "E-mail reenviado" (linha 233) depende do fluxo verdadeiro, e a asserção do e-mail (linha 232) vem como prova a mais, sem substituir a da tela.
- **O teste falharia sem a mudança.** No código anterior, a conta pendente seguia para o `POST`, e isso derruba o `expectNone` da linha 222 e o `verify()`. O teste também distingue o aviso de pendente do banner do CA3: procura "Falta verificar o e-mail" com F maiúsculo, e o banner do CA3 diz "Agora falta verificar o e-mail".
- **A correção da rodada 1 não muda nada visível na tela e não infla o escopo.** Ela só muda o formato do contrato entre a tela e o service, que é o apontamento de código aceito na triagem. O comportamento que a spec pede continua igual.
- **O escopo bate com o plano.** O diff de código toca só os arquivos previstos (`core/auth/auth.service.ts` e `features/auth/sign-up/`). Os três arquivos em `specs/1-criar-conta/reviews/` são registros da rodada 1, não código da tarefa.

## Processo
Nenhum arquivo foi alterado. Li os arquivos com a ferramenta Read. O Bash serviu só para `git diff` (com e sem `--stat`), `npm test` e `npm run lint`.

Arquivos lidos:
- /home/vinicius/Projetos/rota-fixa-utfpr/.agents/agents/revisor-conformidade.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/spec.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/plan.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-07-conformidade-r1.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-07-codigo-r1.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-07-decisoes-r1.md
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.spec.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/docs/architecture.md (linhas 450-509, glossário e convenções do modelo)

Não gravei este parecer. Pela constituição §7, quem o registra em `/home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-07-conformidade-r2.md`, sem edição, é o fluxo.
