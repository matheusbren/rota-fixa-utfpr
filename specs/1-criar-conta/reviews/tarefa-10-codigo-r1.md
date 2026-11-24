# Parecer de Código — Tarefa 10

**Veredito:** APROVADO

Diff revisado: `rtk proxy git diff 3880b84`, com 4 arquivos, 29 linhas acrescentadas e 11 removidas. Os quatro estão no índice e nenhum foi commitado. São exatamente os arquivos previstos na tarefa (caminhos completos no fim do parecer).

Testes e lint, rodados da raiz:
- `npm test`: 6 arquivos, 43 testes passando, nenhuma falha. É o mesmo número da Tarefa 9, coerente com uma tarefa que não acrescenta teste.
- `rtk proxy npm run lint`: "All files pass linting."

Réguas usadas: `docs/architecture.md` (§2, §2.1, §3, §5.1, §5.2 e §7) e `.agents/rules/01-angular-strict-rules.md`.

## Apontamentos (bloqueiam)

Nenhum.

O que conferi e está conforme:
- **Nenhuma linha executável mudou.** Nos três arquivos de `apps/web/src` o diff só acrescenta comentário. Camada, sintaxe, injeção, estado e tratamento de erro ficam como a Tarefa 9 deixou.
- **Cada premissa do "Assume que" tem o seu `TODO`, com o número da tabela da spec.**
  - Premissa 1 (senha em texto no `db.json`, #20): `users.service.ts:8-9` (o campo `password`) e `users.service.ts:31-33` (a gravação).
  - Premissa 2 (nenhum e-mail enviado, #20): `auth.service.ts:23-26`, novo, e `auth.service.ts:47-49`, que já existia.
  - Premissa 3 (link "Entrar", #2): `sign-up.html:17-20`.
  - Premissa 4 (raiz e endereço desconhecido, #2 e #5): `app.routes.ts:5` e `app.routes.ts:17`, que já existiam.
- **Os comentários dizem a verdade sobre a régua que citam.**
  - A tabela `USERS` do §5.2 não tem coluna de senha.
  - O §2.1 aceita a senha em texto só para dados fictícios de desenvolvimento (`architecture.md:112-114`).
  - O §2.1 põe o cadastro da E3 no Supabase Auth, com verificação de e-mail (`architecture.md:115-116`).
  - O coringa `**` redireciona para `criar-conta` (`app.routes.ts:18`).
- **Template.** O comentário HTML não chega à tela, porque o compilador do Angular descarta comentários. O teste que confere o `href` do link (`sign-up.spec.ts:198`) continua verde.
- **O §2.1 novo bate com as duas decisões que a tarefa cita.** São o item "Falha" do plano (`plan.md:43-45`) e o item 2 de `reviews/tarefa-03-decisoes-r1.md`.
- **O §2.1 novo bate com o código e com o resto do documento.**
  - O `app.config.ts:11` tem `provideHttpClient()` sem interceptor, e a pasta `core/http/` não existe.
  - A árvore do §3 continua listando `core/http/`, o que está certo: a nota "Pasta nasce com a história" (`architecture.md:363-365`) diz que a árvore é contrato.
  - Tirar o interceptor vazio alinha a régua com a regra "indireção sem ganho" deste revisor.
- **Versão.** Cabeçalho e §7 concordam em 1.1.2 e 22/11/2026. O `grep` não achou outro arquivo que cite a versão do documento, nem outro texto dizendo que o interceptor existe desde o início.
- **Formato.** Nenhuma linha acrescentada passa de 100 colunas, e `prettier --check` passa nos três arquivos de código.
- **Prova por `grep`.** `TODO #20` acha 4 pontos e `TODO #5` acha 1. Buscar `TODO #2` devolve também as linhas de `#20`; com os dois-pontos (`TODO #2:`) sobram os 2 pontos certos.

## Sugestões (não bloqueiam)

1. **O §2 ainda diz que a troca da E3 "atinge só os Services"** (`architecture.md:60`).
   - A frase que o diff removeu era o que sustentava isso para o interceptor: ele existia "desde o início para a troca não mexer em `app.config.ts`".
   - Com o §2.1 novo, a E3 também cria `core/http/` e registra o `withInterceptors([authInterceptor])` no `app.config.ts`.
   - A regra que importa, nenhuma tela muda (`architecture.md:88-91`), continua de pé.
   - Prejuízo: na #20, quem revisar contra a régua acha duas frases puxando para lados diferentes e uma linha do `app.config.ts` para justificar.
   - Uma oração resolve, em qualquer dos dois lugares.

2. **O nascimento do `errorInterceptor` tem condição, mas não tem dono.**
   - O texto é o que o plano mandou escrever (`plan.md:137-139`), então o diff está certo.
   - O diff também escreveu a regra do intervalo: "o Service converte a falha" (`architecture.md:132-133`). Cada história pode segui-la e repetir um `catchError` no seu Service, sem que nenhuma se declare "a primeira que precisa".
   - A ficha cobra o tratamento centralizado (ID23, `docs/checklist.md:91`).
   - Vale a equipe anotar qual Issue carrega o interceptor.
   - Procurei só nos arquivos do repositório. Não consultei as Issues no GitHub, porque o conector não conectou nesta sessão.

3. **`(spec, "Assume que")` não diz qual spec.**
   - Os comentários novos seguem o que já existia (`auth.service.ts:47`, `sign-up.ts:58`).
   - `UsersService` e `AuthService` ficam em `core/` e servem a todas as histórias. Em três semanas haverá vários `spec.md`.
   - O `#20` já leva ao lugar certo, então o prejuízo é só um passo a mais para quem lê.
   - Se a equipe quiser fechar, `specs/1-criar-conta/spec.md` ou "spec da US01" resolve, em todas as ocorrências de uma vez.

## Observações fora do escopo deste diff

- **O `docs/architecture.md` não passa no `prettier --check`, e já não passava no commit base `3880b84`.** O `npm run format` é `prettier --write .`, e o repositório não tem `.prettierignore`. Quem rodar o comando reescreve o documento inteiro dentro de um diff que não tem nada a ver com ele. É candidata a Issue de manutenção: formatar uma vez ou tirar `docs/` do Prettier.
- **O link "Entrar" provavelmente não muda nada na tela até a US02.** Concluí isso lendo `app.routes.ts`, sem conferir no navegador.
  - `/entrar` cai no coringa e volta para `criar-conta`, que é a rota já ativa. O Angular reaproveita o componente, e o aviso "Este e-mail já tem conta" continua onde estava.
  - A spec assumiu esse caminho (premissa 3) e a #2 o fecha, então não é Issue nova.
  - Fica o aviso para os prints e a demonstração do PR. O `TODO #2` novo repete o "volta ao cadastro" da spec.

Não alterei nenhum arquivo. Usei o terminal para `git diff`, `git status`, `git log`, `git show`, leitura com `ls`, `cat` e `grep`, `prettier --check` e para rodar os testes e o lint. O `git status` ficou igual antes e depois. Não gravei o parecer em `specs/1-criar-conta/reviews/`: isso cabe ao fluxo.

### Critical Files for Implementation

Não há plano de implementação neste parecer. Estes são os arquivos do diff, os que uma correção aceita na triagem tocaria:
- /home/matheus/ATVroni/rota-fixa-utfpr/docs/architecture.md
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/users.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
