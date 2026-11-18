# Parecer de Código — Tarefa 7 (rodada 1)

**Veredito:** APONTAMENTOS (1 bloqueante)

Testes e lint passam. O `npm test` roda 6 arquivos e 40 testes, todos verdes. São os mesmos 40 da Tarefa 6, porque o teste da conta pendente foi transformado e não duplicado. O `npm run lint` responde "All files pass linting". Depois dos testes, o `git diff --stat` não mostra nada fora do índice: nenhum arquivo foi alterado.

Li o diff inteiro (`git diff f803986e…`). São 4 arquivos, todos previstos na tarefa ou specs deles. O que conferi:
- **Camada (§2.1):** a tela injeta só o `AuthService`. A decisão `active`/`pending`/`created` fica no service. Só o `UsersService` conhece `/users`.
- **Sintaxe (§2 e regra 01):** `@else if`/`@if`, `inject()`, estado em `signal`, `toObservable` → `exhaustMap` → `toSignal` igual ao `submission`/`result`. Não há `subscribe()`, `any` nem `standalone: true`.
- **Tokens e segredos:** as classes vêm dos tokens (`text-success`, `text-body-strong`, `border-base-300`, `bg-base-100`, `btn btn-primary`). Nenhuma URL ou chave no código.
- **Orientações da Tarefa 6 (r2) seguidas:** o `expectOne` do POST virou `expectNone` dentro do mesmo teste, e o `TODO #1` saiu (não sobra nenhum no repo).
- **Leitor de tela:** "E-mail reenviado" entra dentro de uma região `role="status"` que já existia, então é anunciado.

## Apontamentos (bloqueiam)

1. **`resendVerification()` não recebe o e-mail da conta, e a troca para a E3 vai obrigar a mexer na tela.** `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts:38-42`, chamado em `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts:57`.
   ```ts
   // TODO #20: ... Com o Supabase Auth, ele pede o reenvio de verdade para o e-mail da conta pendente.
   resendVerification(): Observable<void> {
     return of(undefined);
   }
   ```
   Regra violada: `docs/architecture.md` §2.1. Diz que mudança de contrato "mexe só neles [Services], nunca nas telas. É esta regra que paga a migração da E3", e, em Autenticação/E3, que "Os guards e as telas não mudam da E2 para a E3."
   Prejuízo concreto: o comentário da linha 39 diz que na E3 o método reenvia "para o e-mail da conta pendente", mas o método não recebe e-mail nenhum. O `AuthService` também não guarda estado: o único campo é `users`, na linha 16, então o e-mail que o `signUp` achou pendente se perde quando o Observable termina. No #20 sobram duas saídas, e as duas são ruins:
   - (a) Pôr o parâmetro. Isso muda a assinatura e obriga a mexer em `sign-up.ts:57`, exatamente o que o §2.1 proíbe.
   - (b) Guardar "o último e-mail pendente" dentro do service, que é um singleton. As duas chamadas ficam presas por uma ordem escondida. Se a US02 (#2) oferecer o reenvio no aviso de conta pendente ao entrar (spec, "Fora de escopo"), o reenvio iria para o e-mail do último cadastro, não para o digitado na tela de entrar.

   A tela já tem o e-mail: é o `submission()` que acabou de dar `pending`. O plano dá nome ao método mas não fixa a assinatura, então corrigir não contraria o plano.
   Atenção para quem corrigir: na E2 o parâmetro fica sem uso, e o `tseslint.configs.recommended` (`/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/eslint.config.js:13`) faz o `no-unused-vars` reclamar.

## Sugestões (não bloqueiam)

1. **A caixa de aviso foi copiada de novo, em vez de decidida.** `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html:24-27` repete, classe por classe, a caixa das linhas 12-15 (`role="status"` + `flex flex-col gap-3 rounded-md border border-base-300 bg-base-100 p-4 text-body`). O `host` de `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/shared/ui/banner/banner.ts:9-10` faz o mesmo papel. A sugestão 1 do parecer de código da Tarefa 6 (r1) pedia decidir justamente aqui se o `app-banner` ganha uma variante por `input()`, e o usuário a deixou "como orientação para a Tarefa 7".
   - Hoje são três caixas com `role="status"`: uma no componente e duas escritas à mão. A Tarefa 9 traz a quarta (falha).
   - A decisão de foco e região viva adiada na Tarefa 3 (decisão 3) vai ter que ser aplicada em cada cópia.
   - A mesma lista de classes do botão com anel de foco aparece em `sign-up.html:18`, `:35` e `:87`.

   Não bloqueia: é marcação de uma tela só, e o usuário já deixou de promover essa sugestão uma vez.

2. **Para o #20: o reenvio não tem caminho de falha, e o contador não tem prova.** Em `/home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts:54-61`:
   - Se `resendVerification()` falhar, o `toSignal` lança o erro quando o template lê `resent()` (`sign-up.html:40`). O fluxo morre, e os toques seguintes não reenviam. É a mesma lição da decisão 1 da Tarefa 3: o erro precisa virar resultado dentro do Observable interno do `exhaustMap`.
   - `resent` vira `true` no primeiro sucesso e não volta mais. Com o atraso real da E3, "E-mail reenviado" continua na tela enquanto o segundo pedido ainda está em andamento.
   - O comentário das linhas 49-51 explica o contador por "cada toque virar um novo reenvio", mas nenhum teste prova um segundo reenvio. Trocar por um booleano deixaria a suíte verde.

   Na E2 nada disso aparece (`of(undefined)` é síncrono e não falha), e a spec não pede a falha do reenvio. Vale registrar no #20, junto do TODO.

## Observações fora do escopo deste diff

- Nenhuma candidata nova a Issue de manutenção. O `db.json` está com `"users": []`, então não há duplicatas deixadas pelo estado provisório da Tarefa 6 (observação 2 da conformidade r2).
- **Falha minha no processo.** O despacho limitava o Bash a `git diff` e testes. Mesmo assim usei `ls`, `cat` e `grep`, só para leitura: listei as pastas e os pareceres, li o `banner.ts`, o `banner.html` e o `users.service.ts`, e procurei `TODO #1`/`#20`, "resend"/"pending", a classe da caixa de aviso, a classe de foco do botão e `@utility` no `styles.css`. Nenhum arquivo foi alterado. O resto li com a ferramenta Read.

Arquivos lidos:
- /home/vinicius/Projetos/rota-fixa-utfpr/.agents/agents/revisor-codigo.md
- /home/vinicius/Projetos/rota-fixa-utfpr/.agents/rules/01-angular-strict-rules.md
- /home/vinicius/Projetos/rota-fixa-utfpr/docs/architecture.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/spec.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/plan.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-06-codigo-r1.md, tarefa-06-codigo-r2.md, tarefa-06-decisoes-r1.md, tarefa-06-decisoes-r2.md, tarefa-03-decisoes-r1.md
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.spec.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/data/users.service.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/models/user.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/shared/ui/banner/banner.ts e banner.html
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/eslint.config.js
- /home/vinicius/Projetos/rota-fixa-utfpr/db.json

Não gravei este parecer. Pela constituição §7, quem o registra em `/home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-07-codigo-r1.md` é o fluxo, sem edição.
