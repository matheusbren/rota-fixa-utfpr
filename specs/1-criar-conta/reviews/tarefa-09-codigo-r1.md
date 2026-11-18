# Parecer de Código — Tarefa 9

**Veredito:** APROVADO

Diff revisado: `git diff 4d0f65e6b0d65999f1b830bb5e7faf174a9a51ef`. São 4 arquivos, todos no índice e nenhum commitado:
- `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts`
- `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts`
- `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html`
- `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts`

Réguas usadas: `docs/architecture.md` (§2, §2.1, §3, §5.3), `.agents/rules/01-angular-strict-rules.md` e `docs/design-tokens.md` para as classes de cor.

## Apontamentos (bloqueiam)

Nenhum.

O que conferi e está conforme:
- **Camadas (§2.1 e §3).** A tela continua falando só com o `AuthService`, por `inject()`. Nenhum `HttpClient` novo. `core/` não importa de `features/`. Nenhuma URL escrita à mão.
- **Onde o erro é capturado.** O `catchError` está dentro do Observable que o `signUp` devolve (`auth.service.ts:37`), portanto dentro do `exhaustMap` interno. O fluxo de fora que alimenta o `toSignal` não termina com erro. Se o erro chegasse ao `toSignal`, o `result()` passaria a lançar exceção na leitura e o formulário ficaria morto depois da primeira falha. A nova tentativa funciona, e o teste prova isso.
- **Signals e assíncrono (§2.1, "Assíncrono ↔ reativo").** Nenhum `subscribe()` manual. O estado continua em `signal`/`computed`/`toSignal`. O `startWith(undefined)` (`sign-up.ts:43`) faz cada envio, inclusive o que vem depois de `failed`, recomeçar sem resultado. Com isso o `submitting` (`sign-up.ts:48-50`) vale também para a nova tentativa. Isso fecha a sugestão 1 da Tarefa 8, que ficou registrada como orientação em `tarefa-08-decisoes-r1.md`.
- **Gravação com retorno visível (§2.1, "Gravação").** O fluxo carregando → erro → nova tentativa existe. A tela não recebe código técnico (PRD §7).
- **Template.** O aviso usa `@if`, nada de `*ngIf`. As classes saem só de tokens: `bg-danger-soft` é o "fundo de aviso de falta ou erro" do `design-tokens.md:52`, e `border-error`, `text-error`, `rounded-md` e `text-body` também são tokens. O `role="alert"` serve para erro. O aviso fica dentro do `@else` que já mostrava o formulário, então o formulário não é recriado e os campos mantêm o valor.
- **Teste.** Ele age pela interface: acha o campo pelo rótulo, o botão pelo texto e o aviso pelo `role`. Responde como servidor pelo `HttpTestingController`. Não conhece signal nem método privado, então resiste a refatoração.
- **Duplicação.** O `grep` não achou outro `role="alert"`, outro `danger-soft` nem outro `catchError` no `apps/web/src`. O `app-banner` existente é só de sucesso (`banner.ts`), então não há regra repetida.

## Sugestões (não bloqueiam)

1. **O `catchError` não olha o tipo do erro** (`auth.service.ts:37`: `catchError(() => of<SignUpResult>('failed'))`). O plano fala em "qualquer erro de rede" (`plan.md:43`). O código converte qualquer erro, inclusive os que não vêm do HTTP, e descarta o objeto do erro. O prejuízo hoje é só hipotético. Na E3 o mapeador passa a traduzir snake_case (§2.1). Se ele tiver um bug que lance `TypeError` depois de um `POST` 201, a conta é gravada, a tela diz "Não foi possível criar a conta" e o console fica vazio: quem depura só vê uma resposta 201 na aba de rede. Para corrigir, basta capturar só o `HttpErrorResponse` e relançar o resto, ou registrar o erro antes de converter.

2. **O caminho "falha na busca" não tem teste.** O comentário em `auth.service.ts:21-22` diz que a falha "na busca ou na gravação" vira `failed`, mas o teste só derruba o `POST` (`sign-up.spec.ts:276`). O `auth.service.spec.ts` não testa `failed` em caso nenhum. Hoje o `catchError` depois do `switchMap` cobre os dois casos. Se alguém mover o `catchError` para dentro do `.pipe` do `create` (refatoração plausível, "só a gravação falha"), um erro no `GET` volta a chegar ao `toSignal` e mata o formulário, sem nenhum teste vermelho. Um caso com o `GET` falhando, na tela ou no service, protegeria esse comportamento.

3. **O desvio do `errorInterceptor` não está na lista de coisas a ratificar.** O §2.1 diz que o `errorInterceptor` é "o único lugar que traduz erro HTTP em mensagem de gente", que "falta de rede vira 'Sem conexão'" e que "a tela recebe a mensagem pronta" (`architecture.md:126-129`). Aqui quem traduz é o `AuthService`, com o código `failed`, e o texto está no template. O plano aprovado adiou o interceptor de propósito (`plan.md:43-45`), por isso não reprovo. Mas esse adiamento não entrou na lista "A ratificar" (`plan.md:47-52`), e o código não tem `TODO` com número de Issue. Quando o interceptor nascer, haverá duas traduções para a falta de rede ("Sem conexão" e o texto do CA9), e nada no código avisa quem chegar depois.

4. **Uma única caixa de erro, por ora** (`sign-up.html:85-92`). A caixa repete a estrutura do `app-banner` (`rounded-md border p-4 text-body`) no tom de erro. Com um uso só, criar uma variante seria abstração para um caso, e está certo não criar agora. Quando aparecer o segundo aviso de erro em outro domínio (por exemplo, "ficou sem vaga", §2.1), o lugar natural é um tom no `app-banner`, em `shared/ui/`, e não uma segunda cópia das classes.

## Observações fora do escopo deste diff

- Nenhuma nova. Os itens acima são todos do diff.

## Testes e lint

- `npm test`, da raiz: 6 arquivos, **43 testes passando**, nenhuma falha. Rodei também `npx ng test --reporters=verbose` em `apps/web` para ver os casos um a um. Os dois casos novos passaram:
  - `SignUp > avisa que não criou a conta sem conexão, mantém os campos e deixa confirmar de novo`
  - `SignUp > avisa que não criou a conta com erro do servidor, mantém os campos e deixa confirmar de novo`
- `npm run lint`, da raiz: "All files pass linting."

Não alterei nenhum arquivo. Usei o shell só para `git diff`, `git status`, `ls`, `cat`/`grep` de leitura e para rodar os testes e o lint. Não gravei o parecer em `specs/1-criar-conta/reviews/`: pela regra 7, isso cabe ao fluxo, no arquivo `tarefa-09-codigo-r1.md`.
