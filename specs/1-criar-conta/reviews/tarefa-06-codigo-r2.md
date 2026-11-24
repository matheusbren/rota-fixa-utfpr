# Parecer de Código — Tarefa 6 (rodada 2)

**Veredito:** APROVADO

Testes e lint passam. O `npm test` roda 6 arquivos e 40 testes, todos verdes. Na rodada 1 eram 39; o novo é o teste da conta pendente. O `npm run lint` responde "All files pass linting". Depois dos testes, o `git diff --stat` não mostrou nenhuma alteração fora do índice, então nada foi modificado.

Conferi o diff inteiro da tarefa (`git diff 4084ae2 -- apps/`), olhando primeiro o que mudou desde a rodada 1:

- **Apontamento B** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts:24-33`). Só `existing?.emailVerified` vira `'active'`. A conta pendente segue para o `create`, e o `TODO #1` agora descreve exatamente esse estado provisório. O `emailVerified` é `boolean` no modelo (`core/models/user.ts:9`), então o `?.` com conta ausente leva à gravação, como deve.
- **Apontamento C** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html:16`). O texto saiu sem ponto final. O teste confere o texto exato com `toBe` (`sign-up.spec.ts:190-192`), então um ponto final que volte é pego.
- **Apontamento A** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts:167-195`). O servidor simulado devolve `ANA@utfpr.edu.br` e a pessoa digita `ana@utfpr.edu.br`, como no texto do plano. A prova da busca normalizada continua no `auth.service.spec.ts:51-64`.
- **Camada (§2.1).** A tela não fala com o servidor. Só o `UsersService` conhece a URL `/users` e o parâmetro `email`. O mapeador `toUser` tira a senha. A decisão `created`/`active` fica no `AuthService`, como o plano manda.
- **Sintaxe (§2 e regra 01).** O diff usa `@else if`, `inject()`, o resultado como signal via `toSignal`, nenhum `subscribe()` no componente e o `RouterLink` em `imports`. Não há `standalone: true` nem `any` (o ajudante de teste usa `unknown[]`).
- **Tokens e segredos.** As classes saem só dos tokens (`rounded-md`, `border-base-300`, `bg-base-100`, `text-body-strong`, `btn btn-primary`, `outline-focus`). A URL vem de `environment.apiUrl`.
- **Duplicação.** A regra "conta ativa = `emailVerified: true`" e o `findByEmail` aparecem só em `core/auth/auth.service.ts` e `core/data/users.service.ts`. O `normalizeEmail` continua tendo uma única definição, em `shared/validators/institutional-email.ts`.
- **Erro.** Nenhum `catchError` engole falha. Se o GET falhar, o erro se propaga. Isso é assunto da Tarefa 9 (sugestão 4 da r1, não promovida).
- **Sugestão 3 da r1** (`sign-up.spec.ts:189`, URL exata na tela). A linha continua lá e não reabro, porque o usuário não a promoveu. Registro só um fato novo: com a decisão A, o e-mail digitado já está em minúsculas, então essa linha não testa mais a normalização na tela. O comentário das linhas 167-169 diz o mesmo. O que ela confere agora é o formato `?email=` do json-server, que o `auth.service.spec.ts:60-62` já cobre.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

1. **O seletor `[role="status"] p` prende o teste à tag e à posição** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts:190`). O resto do arquivo acha os elementos pelo texto que a pessoa vê (`field()`, `button()`, `link()`). Este pega o primeiro `<p>` da região. Se o título virar `<strong>` ou `<h2>`, ou se outro `<p>` entrar antes dele, o teste quebra ou confere o elemento errado sem que o comportamento mude. A Tarefa 7 é onde isso pode acontecer: ela traz o aviso de conta pendente e é onde a sugestão 1 da r1 manda decidir a variante do `app-banner`. Alternativa no padrão do arquivo: procurar, dentro de `[role="status"]`, o elemento cujo texto sem espaços seja exatamente a mensagem. A igualdade exata continua pegando o ponto final.

2. **Para a Tarefa 7: o teste da conta pendente fixa um comportamento provisório** (`sign-up.spec.ts:199-222`). A linha 221 (`expectOne` do `POST`) afirma que a conta pendente gera um segundo cadastro. É o que a decisão B pediu, e a linha é necessária por causa do `verify()` no `afterEach`. O teste da Tarefa 7 ("não gera `POST`") contradiz essa linha, então o RED da Tarefa 7 vai falhar nela. Isso é bom: a dívida não passa em silêncio. Quem implementar a Tarefa 7 deve inverter essa linha e remover o `TODO #1` (`auth.service.ts:24-25`), e não criar um teste ao lado dela. Um detalhe: como o `POST` nunca é respondido, o teste só prova que o aviso de conta ativa não aparece **antes** da resposta. O estado final da tela para a conta pendente fica para a Tarefa 7 provar.

## Observações fora do escopo deste diff

- Nenhuma candidata nova a Issue de manutenção.
- **Falha minha no processo.** O despacho limitava o Bash a `git diff` e testes. Rodei um `ls` só de leitura na pasta `specs/1-criar-conta/` e `reviews/` para listar os pareceres. Também usei `git diff --name-only -G<termo>` contra a árvore vazia para procurar duplicação de `emailVerified`, `normalizeEmail`, `findByEmail`, `role="status"` e `entrar`. Os dois só leem, e nenhum arquivo foi alterado.

Arquivos lidos:
- /home/guibondezan/rota-fixa-utfpr/.agents/agents/revisor-codigo.md
- /home/guibondezan/rota-fixa-utfpr/docs/architecture.md
- /home/guibondezan/rota-fixa-utfpr/.agents/rules/01-angular-strict-rules.md
- /home/guibondezan/rota-fixa-utfpr/specs/1-criar-conta/spec.md
- /home/guibondezan/rota-fixa-utfpr/specs/1-criar-conta/plan.md
- /home/guibondezan/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-06-codigo-r1.md, tarefa-06-conformidade-r1.md, tarefa-06-decisoes-r1.md, tarefa-02/03/04/05-decisoes-r1.md
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/data/users.service.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/models/user.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/ui/banner/banner.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/app.routes.ts
