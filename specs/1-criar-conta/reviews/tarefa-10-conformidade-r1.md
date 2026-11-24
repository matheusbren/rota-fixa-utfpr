# Parecer de Conformidade — Tarefa 10

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| "Assume que", premissa 1 (`spec.md:114`): contas na coleção `users` do `db.json`, com a senha em texto → #20 | atendido | `apps/web/src/app/core/data/users.service.ts:8-9` (`TODO #20` sobre o campo `password` de `UserRecord`), `users.service.ts:31-33` (`TODO #20` sobre a gravação da senha em texto, acima de `create`), `apps/web/src/app/core/auth/auth.service.ts:23-26` (`TODO #20` acima de `signUp`: cadastro simulado na coleção `users`, vira Supabase Auth na E3). São os três pontos que o texto da tarefa nomeia |
| "Assume que", premissa 2 (`spec.md:115`): nenhum e-mail enviado, sem link de ativação, "Reenviar" só confirma → #20 | atendido | `auth.service.ts:23-26` (entrou agora: "nenhum e-mail é enviado" e a conta só deixa de ser pendente editando o `emailVerified` no `db.json`) e `auth.service.ts:47-49` (`resendVerification`, já existia) |
| "Assume que", premissa 3 (`spec.md:116`): o link "Entrar" do CA6 aponta para `/entrar`, que cai na rota coringa → #2 | atendido | `apps/web/src/app/features/auth/sign-up/sign-up.html:17-20`, logo acima do `<a routerLink="/entrar">` (`:21-25`). É comentário HTML (`<!-- TODO #2: … -->`) porque template não tem `//`; o `grep` de `TODO #2` acha. O que o comentário afirma confere com o código: `auth.routes.ts:4` só tem `criar-conta`, e `app.routes.ts:18` manda o resto para o cadastro |
| "Assume que", premissa 4 (`spec.md:117`): raiz e endereço desconhecido levam ao cadastro → #2, #5 | atendido (já existia, fora do diff) | `apps/web/src/app/app.routes.ts:5` (`TODO #2`) e `:17` (`TODO #5`) |
| Cada premissa tem Issue aberta | atendido | `gh issue view`: #2 OPEN (US02), #5 OPEN (US05), #20 OPEN (migração para o Supabase, E3) |
| Tarefa 10 (b): o §2.1 diz quando cada interceptor nasce | atendido | `docs/architecture.md:120-133`. `authInterceptor`: "nasce com o Supabase, na E3" (`:123`); `errorInterceptor`: "nasce com a primeira história que precise traduzir 401 ou falta de rede no app inteiro" (`:127-128`). Bate com o item "Falha" (`plan.md:43-45`) e com o item 2 de `reviews/tarefa-03-decisoes-r1.md:10`. A frase antiga "existe desde o início" saiu, e nenhum outro documento a repete (`grep` em `docs/`, `README`, `.agents/`) |
| Tarefa 10 (b): "A versão sobe no §7" | atendido | `docs/architecture.md:4-5` (1.1.1 → 1.1.2, 22/11/2026) e a linha nova do histórico em `:695` |
| "Sem mudar comportamento": suíte e lint verdes | atendido | o diff em `.ts` e `.html` só acrescenta linhas de comentário (13 linhas, nenhuma de código); nenhum `*.spec.ts` mudou. `npm test`: 43 testes passando; `npm run lint`: limpo |
| "O `grep` de `TODO #20` e `TODO #2` achar cada ponto" | atendido | `grep -rn "TODO" apps/web/src` devolve 7 linhas: `app.routes.ts:5` (#2), `app.routes.ts:17` (#5), `auth.service.ts:23` (#20), `auth.service.ts:47` (#20), `users.service.ts:8` (#20), `users.service.ts:31` (#20), `sign-up.html:18` (#2) |
| Escopo: arquivos previstos no plano | atendido | o diff mexe só nos quatro arquivos previstos: `core/data/users.service.ts`, `core/auth/auth.service.ts`, `features/auth/sign-up/sign-up.html`, `docs/architecture.md`. `git status` não mostra arquivo novo |
| Glossário (`docs/architecture.md` §5.1) | atendido | os comentários usam os termos do documento (coleção `users`, `password`, `emailVerified`, Supabase Auth, E2/E3). As remissões conferem: §5.2 não tem coluna de senha em `USERS` (`architecture.md:521-528`); §2.1 diz "senha em texto no `db.json` é aceitável só porque são dados fictícios" (`:113-114`) e "verificação de e-mail ligada" na E3 (`:115-116`) |
| CA1 a CA9 e "Abandono no meio" | fora desta tarefa | a tarefa não cobre critério de aceite novo e não muda comportamento; a suíte que prova os nove continua verde |

## Apontamentos

## Observações não bloqueantes
1. **O §2.1 generaliza a decisão da US01.** `docs/architecture.md:132-133` diz "Até ele nascer, o Service converte a falha no resultado que a tela espera, como o `AuthService` faz no cadastro (US01)". O item "Falha" do plano (`plan.md:43-45`) decidiu isso para o `AuthService` desta história; o texto novo vale para todo Service até o `errorInterceptor` nascer. Não reprovo: é a consequência direta de não haver interceptor somada à regra "componente não fala com o servidor", e responde à sugestão 3 de `reviews/tarefa-09-codigo-r1.md:32`. Mas é uma regra de arquitetura que a tarefa não pediu com essas palavras, então fica para o usuário confirmar na triagem.
2. **O `emailVerified` do modelo não tem `TODO` na declaração.** A Issue #20 diz que "o `emailVerified` sai do modelo `User`", e o campo `password`, que também só existe na simulação, ganhou `TODO #20` onde é declarado (`users.service.ts:8`). O `emailVerified` em `apps/web/src/app/core/models/user.ts:9` só é citado no `TODO` do `signUp`. Não é apontamento: o texto da tarefa nomeia os pontos, `core/models/user.ts` não está nos arquivos previstos, e a premissa 2 já tem dois `TODO #20`.

## Testes executados
- `npm test` (raiz): 6 arquivos, **43 testes passando, nenhuma falha**.
- `rtk proxy npm run lint` (raiz): "All files pass linting."
- `rtk proxy git diff 3880b84`: 4 arquivos, 29 inserções e 11 remoções (as remoções são todas do `architecture.md`).
- Não há RED a reproduzir: a tarefa declara "Teste primeiro: não há".
- As quatro alterações já estavam no índice (`M ` na primeira coluna do `git status`), sem commit, quando comecei.

## Arquivos relevantes
- /home/matheus/ATVroni/rota-fixa-utfpr/specs/1-criar-conta/spec.md
- /home/matheus/ATVroni/rota-fixa-utfpr/specs/1-criar-conta/plan.md
- /home/matheus/ATVroni/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-03-decisoes-r1.md
- /home/matheus/ATVroni/rota-fixa-utfpr/docs/architecture.md
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/users.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/app.routes.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/models/user.ts

Gravar o parecer em `/home/matheus/ATVroni/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-10-conformidade-r1.md` fica com o fluxo. Não gravei nem alterei nenhum arquivo: o Bash só rodou `git diff`, `git status`, `git log`, `grep`, `cat`, `ls`, `gh issue view`, os testes e o lint.
