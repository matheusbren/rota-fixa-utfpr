# Parecer de Código — Tarefa 6

**Veredito:** APROVADO

O diff respeita a arquitetura e não tem apontamento que bloqueie. O teste e o lint passaram: `npm test` com 6 arquivos e 39 testes verdes, e `npm run lint` com "All files pass linting".

Conferi estes pontos:
- **Camada (§2.1).** Só o `UsersService` conhece a URL `/users` e o parâmetro `email`. O `findByEmail` devolve `User | undefined` pelo mapeador `toUser`, então a senha não sai do service. A decisão `created`/`active` fica no `AuthService`, como o plano manda. A tela continua sem falar com o servidor.
- **Sintaxe (§2).** O template usa `@else if`, a injeção é por `inject()`, o resultado é um signal via `toSignal` e não há `subscribe()` no componente. O `RouterLink` entra em `imports`, sem `standalone: true`.
- **Tokens.** A caixa nova usa `rounded-md` (o raio de aviso), `border-base-300` e `bg-base-100`. O link usa `btn btn-primary`, `text-button` e o anel `outline-focus`. Não há valor solto.
- **Escopo.** O diff mexe exatamente nos arquivos previstos para a tarefa e nos specs deles.
- **Testes.** Os testes CA4 e CA5 antigos usam `expectNone('/users')`, que não pegaria o novo `GET /users?email=…`. Mas o `afterEach(() => httpTesting.verify())` de `sign-up.spec.ts:24` pega qualquer GET que sobrar, então a garantia "nada é gravado" continua valendo.
- **`TODO #1`** em `auth.service.ts:24`. Ele marca um estado intermediário que a Tarefa 7, do mesmo plano, desfaz. Está registrado e não esconde nada.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

1. **A caixa de aviso agora existe em dois lugares.** São `sign-up.html:12-15` e o `host` de `shared/ui/banner/banner.ts`, os dois com `role="status"`, `rounded-md border p-4 text-body`. A cópia na página tem motivo: o `app-banner` só sabe ser de sucesso, com cores fixas de `success`. O ponto é que a Tarefa 7 traz o aviso de conta pendente e a Tarefa 9 traz o de falha (`bg-danger-soft`). Na Tarefa 7 já seriam três cópias. Vale decidir ali se o `app-banner` ganha uma variante por `input()`. Assim a decisão de foco e região viva adiada na Tarefa 3 (decisão 3) é tomada num lugar só.

2. **O e-mail normalizado só é garantido por um comentário** (`users.service.ts:22`). Se alguém chamar `findByEmail` com o e-mail como foi digitado, o retorno é `undefined` sem erro nenhum, ou seja, um falso "não existe conta". O próximo a chamar deve ser o "entrar" da US02 (#2). Se quem implementar esquecer o `normalizeEmail`, "Ana@UTFPR.edu.br" passa a não achar a conta. Duas saídas: normalizar dentro do próprio `findByEmail` (é idempotente, então o `AuthService` pode continuar normalizando) ou criar um `users.service.spec.ts` que fixe o contrato. Hoje nada quebra, porque o único chamador normaliza.

3. **A mesma conferência da URL de busca aparece duas vezes, e a da tela depende do formato do json-server.** `sign-up.spec.ts:189` confere a URL exata `…/users?email=ana@utfpr.edu.br`, e `auth.service.spec.ts:60-62` já prova a mesma busca normalizada. Na E3 a busca vira `?email=eq.…`, e o teste da tela quebra, embora o §2.1 diga que a troca de fonte não mexe em "nenhuma tela". O resto do `sign-up.spec.ts` já depende do contrato HTTP, no padrão aceito na Tarefa 3, então o problema não é novo. Esta linha, porém, repete o que o spec do service já prova. Sugestão: deixar a URL exata só no spec do service e, na tela, conferir o comportamento (aviso, link e nenhum POST).

4. **Para a Tarefa 9.** A decisão 1 da Tarefa 3 fala em transformar em resultado "o erro do POST". Agora o `signUp` faz um GET antes (`auth.service.ts:22-34`). Uma falha nesse GET também derruba o fluxo do `result`, e o signal do `toSignal` passa a lançar o erro quando a tela o lê. O tratamento de erro da Tarefa 9 precisa envolver a cadeia inteira (GET + POST), não só o `create`.

## Observações fora do escopo deste diff

- **O link "Entrar" parece não fazer nada até a US02 (#2).** Isso é comportamento, então é com o revisor de conformidade ou com a conferência no navegador. Não está coberto por teste; deduzi pelas rotas. Hoje `/entrar` cai no coringa `**` e é redirecionado para `criar-conta` (`app.routes.ts:18`), que é a rota onde a pessoa já está. O Angular reaproveita o componente `SignUp`, então o aviso "Este e-mail já tem conta" continua na tela e o clique não muda nada visível. A premissa da spec ("volta ao cadastro") se cumpre no endereço, mas não na tela.
- **Uma falha minha no processo.** O despacho limitava o Bash a `git diff` e testes, mas também usei `ls`, `cat`, `grep` e `sed`, só para ler o banner, o validador, o modelo, o `db.json`, os `environments` e o `design-tokens.md`. Nenhum arquivo foi alterado.

Arquivos lidos:
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/data/users.service.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/ui/banner/banner.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/app.routes.ts
