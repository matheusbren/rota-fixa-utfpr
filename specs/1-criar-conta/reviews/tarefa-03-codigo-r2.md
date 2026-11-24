# Parecer de Código — Tarefa 3

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no estado atual do working tree:
- `npm test`: 4 arquivos, 10 de 10 testes passando. Chegou o `core/auth/auth.service.spec.ts` (1 teste) aos 9 da rodada 1.
- `npm run lint`: "All files pass linting".

Revisei o diff inteiro (`git diff 68890af`, 16 arquivos) contra o `docs/architecture.md` (§2, §2.1, §3, §5.1 e §5.3), a `.agents/rules/01-angular-strict-rules.md` e o `docs/design-tokens.md`.

- **Apontamento aceito na rodada 1 (prova do `trim()`):** está resolvido em `auth.service.spec.ts:22-36`.
  - O teste chama `AuthService.signUp()` direto com `'  Ana.Souza@ALUNOS.UTFPR.edu.br '`. Ele exige, pelo `HttpTestingController`, um `POST` cujo `email` seja exatamente `'ana.souza@alunos.utfpr.edu.br'`.
  - Nenhum `<input type="email">` entra no caminho, então o navegador não tira os espaços antes. Se alguém apagar o `.trim()` de `auth.service.ts:15`, o corpo leva `'  ana.souza@alunos.utfpr.edu.br '` e o `toMatchObject` falha. Se apagar o `.toLowerCase()`, falha também. As duas partes da normalização agora têm prova.
  - O teste não fica preso à implementação. Ele entra pela API pública do `AuthService`, que o `plan.md` encarrega da normalização. Ele confere o contrato na fronteira HTTP, sem espiar o `UsersService` e sem ler estado interno. O `toMatchObject` olha só o `email` e deixa o resto do corpo para o teste da tela. O comentário de `:22-23` diz por que o teste fica no Service e não na tela. O `.subscribe()` está no teste, e a proibição do §2.1 vale só para componentes.
  - O arquivo fica ao lado de `auth.service.ts`, como pede a convenção de testes do §2 (ID33). Usa Vitest, sem `jasmine.*`, e fecha com `verify()`.
- **O resto do diff não mudou desde a rodada 1 e continua conforme:**
  - **Camadas (§2.1 e §3):** `SignUp` → `AuthService` → `UsersService` → `HttpClient`. Só o `UsersService` conhece a URL `/users` e o campo `password`. O mapeador `toUser` é uma função pura. `Banner` e `FormField` não injetam nada.
  - **Sintaxe:** `inject()`, signals, `input.required()`, `@if`/`@else` e Reactive Forms. O envio passa por `toObservable` → `exhaustMap` → `toSignal`, sem `subscribe()` no componente.
  - **URL e segredo:** a URL fica só nos dois `environment` (§5.3).
  - **Estilo:** só tokens do `design-tokens.md`.
- **Duplicação:** procurei `toLowerCase`, `trim()`, `apiUrl`, `localhost:3000`, `emailVerified` e `'member'` em `apps/web/src`. A normalização existe só em `auth.service.ts:14-16`. Os outros `trim()` são de `textContent`, nos testes.
- As cinco sugestões recusadas na rodada 1 (`tarefa-03-decisoes-r1.md`, itens 1, 2, 3, 5 e 6) não voltam aqui.

## Sugestões (não bloqueiam)
- Nenhuma nova.

## Observações fora do escopo deste diff
- **`withComponentInputBinding()` continua faltando** no `provideRouter(routes)` (`app.config.ts:10`), embora o §4 o exija. A pendência é anterior, já está no parecer da Tarefa 2 e foi lembrada na rodada 1. Este diff não toca nessa linha.
- **O §2.3 ainda não registra como os Services são criados.** Falta dizer que se usa `@Service()` no lugar de `@Injectable()` e que o arquivo e a classe levam o sufixo de tipo (`users.service.ts` / `UsersService`). O gerador da linha 22, por padrão, cria `users.ts` / `Users`. A pendência continua aberta desde a rodada 1. Cabe na mesma Issue de manutenção que vai ratificar a casca (itens a, b e c do `plan.md`).
