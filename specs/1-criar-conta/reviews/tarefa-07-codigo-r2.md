# Parecer de Código: Tarefa 7 (rodada 2)

**Veredito:** APROVADO

O apontamento aceito na rodada 1 foi corrigido. Ele dizia que `resendVerification()` não recebia o e-mail da conta, e que por isso a tela teria de mudar na E3. Ficou assim:
- **Service:** o contrato do método agora recebe o e-mail: `readonly resendVerification: (email: string) => Observable<void> = () => of(undefined);` (`/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts:43`).
- **Tela:** entrega o e-mail do envio que deu `pending` (`/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts:57-60`).
- **Teste:** prova isso com `vi.spyOn(...)` e `toHaveBeenCalledWith('ana@utfpr.edu.br')` (`/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts:203` e `:232`).

Com isso, na E3 só muda o corpo do método no Service, e `sign-up.ts` fica como está, que é o que o architecture.md §2.1 pede ("mexe só neles, nunca nas telas"). O aviso do `no-unused-vars`, que a rodada 1 tinha previsto, não aparece porque a função da E2 não declara o parâmetro.

## O que conferi no diff
- **Camada (§2.1):** a tela injeta só o `AuthService`. A decisão entre `created`, `active` e `pending` fica no service (`auth.service.ts:24-34`). Só o `UsersService` conhece `/users`. Nada em `core/` importa de `features/`.
- **Sintaxe (§2 e regra 01):** a tela usa `@if` e `@else if`, `inject()` e estado em `signal`. A conversão é `toObservable` → `exhaustMap` → `toSignal`, igual ao `submission`/`result`. Não há `subscribe()` manual, `any`, `standalone: true` nem `BehaviorSubject`.
- **Leitura do signal dentro do pipe:** `this.submission()` em `sign-up.ts:58` roda dentro do `subject.next` do `toObservable`, que é `untracked`. Então uma mudança no `submission` não dispara reenvio sozinha.
- **Segredos e URLs:** não há nenhum no diff. As classes do template vêm dos tokens.
- **Duplicação:** a normalização do e-mail continua só em `normalizeEmail` (`shared/validators/institutional-email`). O TODO #20 (`auth.service.ts:40-42`) avisa que, na E3, o service normaliza o e-mail recebido, em vez de a tela fazer isso.
- **Escopo:** só mudaram os arquivos previstos na tarefa (`core/auth/auth.service.ts` e `features/auth/sign-up/`). Os três `.md` de `specs/1-criar-conta/reviews/` são registros do fluxo.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

1. **`resendVerification` é um campo com arrow function, e as outras operações são métodos** (`auth.service.ts:43`, contra `signUp` em `:21` e `findByEmail`/`create` no `users.service.ts`). O formato existe para escapar do `no-unused-vars` declarando o parâmetro só no tipo. Funciona, e o comentário das linhas 38-39 explica. Mas quem lê a classe encontra um campo onde espera um método. Um método `resendVerification(email: string)` com `eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO #20` deixaria a forma igual à das outras operações e a exceção ainda mais explícita. Não bloqueia: na E3 a troca continua mexendo só no service, e o `vi.spyOn` na instância funciona com qualquer uma das duas formas.

2. **O teste não confere quantas vezes o reenvio é chamado.** `sign-up.spec.ts:232` usa `toHaveBeenCalledWith`. Se um toque chamasse o service duas vezes, o teste passaria, e na E3 isso viraria dois e-mails por toque. Um `toHaveBeenCalledTimes(1)` (ou `toHaveBeenCalledOnce()`) fecharia essa brecha. Isto é diferente da sugestão 2 da r1 (falta provar um segundo reenvio), que já foi triada.

3. **O `filter((email) => email !== undefined)` em `sign-up.ts:59` serve só para o TypeScript estreitar o tipo.** O botão só existe com `result() === 'pending'`, e esse estado só aparece depois de um `submit()`. O ramo `undefined` não acontece hoje. Se um dia acontecesse, o toque não faria nada e não haveria aviso. Fica registrado, sem pedido de mudança.

4. **Para o #20:** a tela entrega o e-mail como a pessoa digitou (`sign-up.ts:58`), e o TODO deixa para o service normalizar. O teste da tela usa um e-mail que já está normalizado, então ninguém prova essa normalização hoje. Quando o #20 chegar, vale um teste no `auth.service.spec.ts` igual aos das linhas 32-64 (e-mail com espaços e maiúsculas, pedindo o reenvio normalizado).

As sugestões 1 (caixa de aviso copiada em vez de usar o `app-banner`) e 2 (reenvio sem caminho de falha, `resent` que não volta a `false`, contador sem teste) da rodada 1 continuam como estavam. O usuário decidiu não promovê-las (`tarefa-07-decisoes-r1.md`, linhas 10-11), então não as levanto de novo.

## Observações fora do escopo deste diff
- Nenhuma candidata nova a Issue de manutenção.

## Testes e lint
- `npm test` na raiz: 6 arquivos e 40 testes, todos passando.
- `npm run lint` na raiz: "All files pass linting."
- Depois de rodar os dois, `git diff --stat` não mostrou nenhuma mudança fora do índice, e `git diff --cached --stat` mostrou os mesmos 7 arquivos da tarefa. Nenhum arquivo foi alterado.

## Como trabalhei
- Usei o Bash só para `git diff f803986e…`, `git diff --stat`, `git diff --cached --stat`, `npm test` e `npm run lint`. Li todos os arquivos com a ferramenta Read.
- Arquivos lidos:
  - /home/vinicius/Projetos/rota-fixa-utfpr/.agents/agents/revisor-codigo.md
  - /home/vinicius/Projetos/rota-fixa-utfpr/.agents/rules/01-angular-strict-rules.md
  - /home/vinicius/Projetos/rota-fixa-utfpr/docs/architecture.md
  - /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/spec.md
  - /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/plan.md
  - /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
  - /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.spec.ts
  - /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/data/users.service.ts
  - /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
  - /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
  - /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts
  - /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/eslint.config.js
  - Os três registros da rodada 1, pelo próprio diff.
- Não gravei este parecer. Pela constituição §7, quem o grava em `/home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-07-codigo-r2.md` é o fluxo, sem edição.
