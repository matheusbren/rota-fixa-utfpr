# Parecer de Código — Tarefa 3

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no estado atual do working tree:
- `npm test`: 3 arquivos, 9 de 9 testes passando. São os 3 do `app.spec.ts`, os 5 do `app-shell.spec.ts` e o novo do `sign-up.spec.ts`.
- `npm run lint`: "All files pass linting".

Conferi o diff inteiro (`git diff 68890af`, 15 arquivos) contra o `docs/architecture.md` (§2, §2.1, §3, §5.1 e §5.3), a `.agents/rules/01-angular-strict-rules.md` e o `docs/design-tokens.md`.
- **Camadas (§2.1 e §3):**
  - O `SignUp` injeta só o `AuthService`. O `AuthService` chega ao servidor pelo `UsersService`. Só o `UsersService` conhece o `HttpClient`, a URL `/users` e o campo `password`.
  - O mapeador `toUser` é uma função pura ao lado do Service e tira a senha da resposta.
  - `Banner` e `FormField` ficam em `shared/ui/`, como na tabela do §3. Não injetam nada e não importam nada do projeto.
  - A regra de dependência se mantém: a feature importa de `core/auth/` e de `shared/ui/`, e nada em `core/` importa de `features/`.
- **Sintaxe:**
  - O diff usa `inject()`, `signal()`, `input.required()`, `@if`/`@else` e Reactive Forms (`FormBuilder.nonNullable`).
  - Não há `standalone: true`, decorator `@Input`/`@Output`, injeção por construtor, `any` nem `subscribe()` manual. O envio passa por `toObservable` → `exhaustMap` → `toSignal`, o caminho que o §2.1 descreve.
  - O `@Service()` é API pública do `@angular/core` 22.2.4. É também o que o `ng g service` gera por padrão (`injectable: false` no schema do schematic).
- **URL e segredo (§5.3):**
  - O `apiUrl` aparece só nos dois `environment`. O `UsersService` e o teste leem `environment.apiUrl`.
  - O `fileReplacements` entrou na configuração `development`, que é a que o `ng serve` usa.
  - Não há chave nem segredo.
- **Modelo (§5.1):**
  - O `User` está em camelCase, com `id` string, `role` `member | admin` e `emailVerified`, como manda a convenção da conta pendente.
  - O `createdAt` sai em ISO 8601 com fuso (o `Z` do `toISOString()`). Ele é gerado no Service, que é quem conhece o formato da E2.
- **Estilo:**
  - Só tokens: `text-title-1`, `text-label`, `text-body`, `text-body-strong`, `text-button`, `bg-success-soft`, `text-success`, `border-success`, `outline-focus` e `rounded-md`.
  - `gap-3` entre os campos (12 px, como pede o `design-tokens.md`).
  - Não há `.css` por componente nem `style=`.
  - O par `success` sobre `success-soft` está entre os pares AA do documento.
- **Abstração:** o `SignUpResult` com um valor só é o começo da união que o `plan.md` já decidiu (`created`, `active`, `pending`, `failed`). `Banner` e `FormField` estão no §3 e no plano. Não é indireção sem uso.
- **Duplicação:** procurei `toLowerCase`, `apiUrl`, `localhost:3000`, `emailVerified` e `'member'` em `apps/web/src`. Cada regra aparece num lugar só.
- **Teste:**
  - Acha o campo pelo rótulo, o botão pelo texto e o aviso pelo `role="status"`.
  - Confere o `POST` pelo `HttpTestingController`, que representa o contrato com o json-server, e fecha com `verify()`.
  - Não espia Service nem lê estado interno: refatorar o `AuthService` ou o `UsersService` não o quebra.

## Sugestões (não bloqueiam)
- **Na Tarefa 9, o erro precisa ser convertido dentro do `signUp`, e não depois do `exhaustMap`** (`sign-up.ts:28-33`, `auth.service.ts:23-30`).
  - Hoje, se o `POST` falhar (com o json-server desligado, por exemplo), o `toSignal` guarda o erro. O `result()` passa a lançá-lo a cada leitura do template, o fluxo externo morre e os toques seguintes em "Criar conta" não disparam nada. O erro só aparece no console.
  - Esse é o estado esperado até a Tarefa 9 (CA9). O desenho do plano resolve ("o `AuthService` converte qualquer erro de rede em um único resultado de falha"), desde que o `catchError` fique no Observable interno.
  - Um `catchError` no `pipe` da página, depois do `exhaustMap`, encerraria o fluxo, e o "confirmar de novo" do CA9 deixaria de funcionar.
- **O `authInterceptor` não veio junto com o `provideHttpClient()`** (`app.config.ts:11`).
  - O §2.1 diz que ele "existe desde o início para a troca não mexer em `app.config.ts`".
  - O `plan.md` só adiou o `errorInterceptor`, e a autorização da equipe cobriu o `provideHttpClient()`, não a pasta `core/http/`. Então não é falha do implementador.
  - O prejuízo é pequeno: na E3, alguém edita uma linha do `app.config.ts`.
  - Para a triagem, duas saídas: a equipe autoriza um `authInterceptor` que não faz nada na E2, ou ratifica no §2.1 que ele nasce na E3.
  - Detalhe: no Angular 22 o `HttpClient` já vem provido na raiz. O `app.spec.ts` monta o `SignUp` sem `provideHttpClient()` e passa. Por isso, hoje essa linha só serve de gancho para o `withInterceptors`.
- **O foco se perde e o aviso pode não ser anunciado** (`sign-up.html:3-11`, `banner.ts:3-4` e `:9`).
  - Quem confirma está com o foco no botão "Criar conta", e o `@else` destrói esse botão. O foco cai no `<body>`, mas o PRD §7 pede "foco sempre visível".
  - A região `role="status"` entra no DOM junto com o texto. O anúncio só é confiável quando o conteúdo muda dentro de uma região viva que já existia. Por isso o comentário do `banner.ts` promete mais do que entrega.
  - Dois caminhos possíveis: levar o foco ao aviso (`tabindex="-1"` e `focus()`) ou manter a região viva fora do `@if`.
  - O jsdom não prova nenhum dos dois, então a conferência é no navegador.
  - Quando o banner ganhar a variante de erro (CA9), ela pede `role="alert"`.
- **O teste não prova o `trim()`** (`sign-up.spec.ts:57`).
  - Em `type="email"`, o próprio `<input>` tira os espaços das pontas. É o algoritmo de sanitização do HTML, e o jsdom o implementa (`form-controls.js`, `case "email"`).
  - Se alguém apagar o `.trim()` de `normalizeEmail` (`auth.service.ts:14-16`), o teste continua verde.
  - A pessoa não sofre nenhum defeito, porque o navegador faz o mesmo. Mas o teste diz provar o "e-mail normalizado" e só prova as minúsculas.
  - Vale lembrar disso na Tarefa 4, que testa `Ana@UTFPR.edu.br ` com espaço no fim.
- **A Tarefa 4 vai precisar da mesma normalização** (`auth.service.ts:14-16`).
  - O validador `institutionalEmail` também tem de ignorar maiúsculas e espaços (CA4).
  - Para a regra não existir em dois lugares, ela pode ser exportada pelo próprio validador em `shared/validators/` e importada pelo `AuthService`. O `core/` pode importar de `shared/`. O caminho inverso, `shared/` importando de `core/auth/`, a regra do §3 proíbe.
- **O nome completo não tem validador** (`sign-up.ts:18-22`).
  - As Tarefas 4 e 5 cuidam do e-mail e da senha, mas nenhuma tarefa do plano valida o `fullName`. Uma conta com nome vazio pode ser gravada mesmo depois delas.
  - Decidir se o nome é obrigatório cabe à spec, não a este parecer. Fica registrado porque o §2.1 pede formulários "com validação".

## Observações fora do escopo deste diff
- **`withComponentInputBinding()` continua faltando** no `provideRouter(routes)` (`app.config.ts:10`), embora o §4 o exija. A pendência é anterior e já está registrada no parecer da Tarefa 2. Este diff mexeu no arquivo, mas não nessa linha.
- **O §2.3 não ratifica a convenção dos Services.**
  - `auth.service.ts` e `users.service.ts`, com as classes `AuthService` e `UsersService`, seguem o `plan.md` e os nomes do §2.1.
  - Já o gerador da linha 22 cria `users.ts` com a classe `Users`: no schema do schematic, `type` vem vazio por padrão.
  - A escolha de `@Service()` no lugar de `@Injectable()` também não está registrada. Sem isso, cada Service novo depende da memória de quem o cria.
  - Cabe uma linha no §2.3, na mesma Issue de manutenção que já vai ratificar a casca (itens a, b e c do `plan.md`).
