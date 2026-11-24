# Parecer de Código — Tarefa 8

**Veredito:** APROVADO

O diff (`git diff 0daf255678e494131a5fd2a7436277b7164522d0`) muda três arquivos, todos em `features/auth/sign-up/`, como o plano previa: `sign-up.ts`, `sign-up.html` e `sign-up.spec.ts`. Comparei com o `docs/architecture.md` (§2, §2.1, §3) e com o `.agents/rules/01-angular-strict-rules.md`. Nenhum item da lista de reprovação aparece:

- **Camadas:** a tela não fala com o servidor. O estado de gravação vem só de signals da própria página (`submission`, `result`), e o `AuthService` continua sendo a única dependência (§2.1).
- **Sintaxe:** usa `computed()` como fonte de estado e `@if`/`@else` no template. Não aparece `*ngIf`, injeção por construtor, `subscribe()` manual nem `BehaviorSubject` (§2, "O que não se escreve").
- **Gravação (§2.1):** "a página mostra carregando". O botão mostra o spinner `loading loading-spinner` (com `aria-hidden`) e o gerúndio "Criando conta…". Como é `w-full`, a largura não muda, como pede o estado "carregando" do `design-tokens.md`.
- **Botão não vira componente (§3):** continua `btn btn-primary`, como deve.
- Não há segredo nem URL no código, nem erro engolido. Não há abstração para um caso só: `submitting` é o signal que o próprio plano nomeia ("Decisões técnicas", item Formulário) e o template o usa duas vezes. Também não há regra duplicada: procurei `loading`, `carregando` e `submitting` em `apps/web/src`, e só existem as linhas deste diff.
- **Proteção contra segundo toque:** são duas camadas que não se sobrepõem. O `[disabled]` impede o clique, e o `exhaustMap`, que já existia em `sign-up.ts:41`, descarta um segundo envio enquanto o primeiro está em curso.
- **Teste:** confere o que a pessoa vê, o botão desabilitado e o rótulo. Também confere o efeito: nenhuma nova requisição a `/users`, sem filtrar por método. Por isso pegaria tanto um segundo `GET` de busca quanto um segundo `POST`. Não depende de qual mecanismo bloqueia.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

1. **Atenção para a Tarefa 9: `submitting` só funciona no primeiro envio.** Está em `apps/web/src/app/features/auth/sign-up/sign-up.ts:46-48`:
   ```ts
   protected readonly submitting = computed(
     () => this.submission() !== undefined && this.result() === undefined,
   );
   ```
   A conta parte do princípio de que, quando chega um resultado, o formulário some. Hoje é verdade: `created`, `active` e `pending` trocam o formulário por aviso (`sign-up.html:3-44`). Mas o plano já prevê o resultado `failed` (CA9), em que o formulário fica e a pessoa confirma de novo.
   - **O que acontece:** na segunda tentativa, `result()` ainda vale `'failed'` até a nova resposta chegar. Então `submitting()` dá `false`, o botão continua "Criar conta" e fica habilitado durante o segundo `POST`. Ou seja, o CA8 deixa de valer justamente na nova tentativa.
   - **Por que o risco é real:** não sai requisição duplicada, porque o `exhaustMap` segura. Mas nenhum teste pegaria a falta do "Criando conta…": o teste desta tarefa cobre só o primeiro envio, e o teste previsto para a Tarefa 9 ("confirmar de novo envia outra requisição") não confere o rótulo.
   - **Por que não bloqueia agora:** o diff está correto para o escopo atual, e o `failed` só existe na Tarefa 9.
   - **Sugestão:** registrar na triagem que a Tarefa 9 refaça a conta do `submitting` para o estado "em curso" valer em todo envio, não só no primeiro, e que o teste dela confira "Criando conta…" também na nova tentativa.

2. **O teste guarda a referência ao botão antes do toque.** Está em `apps/web/src/app/features/auth/sign-up/sign-up.spec.ts:241-242` e é usado em `248-251`. O teste depende de o mesmo elemento `<button>` continuar no DOM depois que o rótulo muda. Se alguém refatorar o template para dois botões em `@if`/`@else`, o comportamento continua certo, mas o teste guarda um nó solto (ainda habilitado, com "Criar conta") e falha. Não chega a "quebrar em qualquer refatoração", por isso fica como sugestão. Uma forma mais firme e no espírito dos outros helpers (achar pelo que a pessoa vê): depois do `expectOne` do `POST`, buscar `button('Criando conta…')`, conferir que ele existe e está desabilitado, e tocar nele.

3. **Visual do "carregando" (conferir nos prints do PR).** Em `apps/web/src/app/features/auth/sign-up/sign-up.html:87-88`, as classes `disabled:bg-disabled disabled:text-text-disabled` também valem durante a gravação. Assim o botão "Criando conta…" fica com a aparência de "desabilitado" (cinza). O `design-tokens.md` trata "carregando" e "desabilitado" como estados separados, mas não diz a cor do carregando. Vale conferir com o protótipo se é isso mesmo que se quer.

## Observações fora do escopo deste diff

- `apps/web/src/app/features/auth/sign-up/sign-up.ts:38-43`: `result` vem de um `toSignal` sem tratamento de erro. Se o `signUp` falhar, o erro é relançado quando alguém lê `result()`, e agora também quando lê `submitting()`. Isso é a Tarefa 9 (CA9), que está no plano, então não vira Issue de manutenção. Registro só para quem implementar a Tarefa 9 saber que o `submitting` também lê esse signal.

## Testes e lint (rodados da raiz do repositório)

- `npm test`: 6 arquivos e 41 testes, todos passando (Vitest 5.1.0).
- `npm run lint`: "All files pass linting."

Arquivos revisados:
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts

Não gravei nenhum arquivo. Pela regra 7 da constituição, este parecer deve ser salvo pelo fluxo, sem edição, em `/home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-08-codigo-r1.md`.
