# Parecer de Código — Tarefa 4

**Veredito:** APROVADO

O diff da Tarefa 4 segue as regras do `architecture.md` e não há apontamento bloqueante. Ficam seis sugestões para a sua triagem, e as mais úteis são a 1 e a 2.

## Apontamentos (bloqueiam)
Nenhum.

**Testes e lint, rodados no working tree:**
- `npm test`: 5 arquivos, 22 de 22 testes passando. Eram 10 na Tarefa 3. Entraram 9 casos no novo `institutional-email.spec.ts` e 3 no `sign-up.spec.ts` (2 do `it.each` e o caso aceito).
- `npm run lint`: "All files pass linting".

**O que conferi:** li o diff inteiro (`git diff af07602`, 6 arquivos) contra o `docs/architecture.md` (§2, §2.1 e §3), a `.agents/rules/01-angular-strict-rules.md` e o `docs/design-tokens.md`.

- **Camadas (§2.1 e §3):**
  - O validador está em `shared/validators/`, como o §2.1 pede para o "domínio do e-mail".
  - É uma função pura (`ValidatorFn`), não injeta nada e não importa de `features/` nem de `core/data/`.
  - A tela só usa o `AuthService`. A regra de dependência do §3 não proíbe a importação de `core/auth/auth.service.ts:3` em `shared/validators/`, porque para o `core/` ela só veda importar de `features/`.
- **Sintaxe:** `@let` e `@if`, `inject(FormBuilder)`, Reactive Forms e `[disabled]` ligado a `form.invalid`. Nenhum `*ngIf`, `subscribe()` manual, `any` ou construtor.
- **Estilo:** `text-caption`, `text-error`, `bg-disabled` e `text-text-disabled` são tokens do §2.2 e do `design-tokens.md`. O estado desabilitado (fundo `disabled`, texto `text-disabled`) bate com a tabela "Estados de botão".
- **Duplicação:** procurei `utfpr.edu.br`, `normalizeEmail`, `toLowerCase` e `.trim()` em `apps/web/src`.
  - A normalização agora existe só em `shared/validators/institutional-email.ts:8-10`. O diff tirou a cópia do `AuthService`, como pedia a sugestão 5 da `tarefa-03-decisoes-r1.md`.
  - A prova do `trim()` continua em `auth.service.spec.ts:35`, que não mudou.
- **Testes:**
  - `institutional-email.spec.ts` chama o validador direto num `FormControl` e confere a chave `{ institutionalEmail: true }`. Essa chave é o contrato com o mapa de mensagens, então o teste não depende da implementação.
  - O comentário das linhas 4-5 explica por que o teste não passa pela tela.
  - `sign-up.spec.ts` confere que o aviso não existe antes do `blur` ("quando saio do campo"). Depois confere o aviso pelo `aria-describedby` do campo, que é contrato de acessibilidade e não detalhe interno, e fecha com `expectNone`.
  - Se alguém tirar o `[disabled]`, o clique passa a chamar `submit()` e o `expectNone` falha. Então o teste protege a regra.
- **Itens já decididos:** as sugestões recusadas nas Tarefas 2 e 3 (foco da casca, região viva do aviso, `fullName` sem validador) não voltam aqui.

## Sugestões (não bloqueiam)

1. **O validador quebra com valor `null`** (`institutional-email.ts:14-17`).
   - O parâmetro foi tipado como `AbstractControl<string>`, mas a atribuição a `ValidatorFn` apaga esse tipo. Por isso o TypeScript aceita o validador em qualquer controle, inclusive anulável.
   - Hoje está seguro porque o grupo é `nonNullable`. Mas a peça está em `shared/` para ser reaproveitada (a tela de entrar da #2 é a candidata óbvia).
   - Ali, `new FormControl(null, institutionalEmail)` ou um `reset()` num controle anulável lança `TypeError: Cannot read properties of null (reading 'trim')` dentro da validação.
   - Ler `control.value ?? ''`, ou recusar quando `typeof control.value !== 'string'`, evita o erro sem mudar o comportamento de hoje.

2. **Erro sem mensagem no mapa deixa o botão desabilitado sem explicação** (`sign-up.ts:11-13` e `46-52`).
   - O `errorOf` devolve `undefined` quando a chave não está em `ERROR_MESSAGES`. O formulário fica inválido, o botão desabilitado, e nenhum texto aparece.
   - Hoje não acontece, porque só existe uma chave. A Tarefa 5 acrescenta as chaves da senha, e esquecer uma delas no mapa só aparece no navegador.
   - Tipar o mapa pelas chaves conhecidas (uma união literal no lugar de `Record<string, string>`), ou ter um teste que percorra as chaves, pega o esquecimento na compilação ou na suíte.

3. **`submit()` não confere a validade** (`sign-up.ts:41-43`).
   - A regra "nada é gravado" (CA4) depende só do atributo `disabled` do botão.
   - Na Tarefa 8, o `[disabled]` vai virar uma expressão composta, algo como `form.invalid || submitting()`. Se alguém errar essa expressão, só o teste segura.
   - Um `if (this.form.invalid) return;` no começo de `submit()` deixa a regra no componente e não só no template.

4. **O botão já nasce desabilitado sem motivo visível** (`sign-up.html:46-52`).
   - Com o e-mail vazio e ainda não tocado, o formulário é inválido desde a primeira tela. O botão aparece cinza sem nenhum texto, e o campo não foi tocado, então o aviso do e-mail não aparece.
   - O `design-tokens.md` ("Estados de botão", linha 141), citado pelo §3 do `architecture.md`, diz que no estado desabilitado "o motivo aparece em texto perto do botão".
   - O `plan.md` aprovou exatamente esse comportamento (botão desabilitado com o formulário inválido, erro só depois de tocar). Por isso deixo como conflito entre documentos para você decidir, e não como apontamento.
   - Depois da Tarefa 5, a senha vazia também deixa o formulário inválido, então o caso continua.

5. **A marcação do aviso vai se repetir por campo** (`sign-up.html:22` e `30-35`).
   - O `<p id="…-error">`, o `aria-invalid` e o `aria-describedby` estão escritos à mão no campo de e-mail. A Tarefa 5 vai copiar as mesmas cinco linhas para a senha, e cada formulário futuro (`route-form`, `vehicle-form`, sign-in) também.
   - Um `error = input<string>()` no `app-form-field` (`shared/ui/form-field/`) concentraria o `<p>` e o padrão do `id`. Com um caso só ainda não vale abstrair, então fica para quando chegar o segundo.

6. **O nome do teste promete mais do que ele prova** (`sign-up.spec.ts:109-111`).
   - O título "aceita Ana@UTFPR.edu.br com espaço no fim" diz mais do que o teste da tela prova, porque o `<input type="email">` tira o espaço antes de o valor chegar ao Angular.
   - O comentário logo acima explica isso e aponta para o `institutional-email.spec.ts`, que prova o `trim()` de fato. Basta ajustar o título para "aceita Ana@UTFPR.edu.br (maiúsculas)".

## Observações fora do escopo deste diff
- **A direção `core/` → `shared/` não está escrita no §3.** O §3 do `architecture.md` diz o que `features/`, `shared/` e `core/` importam, mas não diz se `core/` pode importar de `shared/`. Este diff passa a fazer isso (`auth.service.ts:3`). Vale registrar a direção (por exemplo, "`core/` pode usar funções puras de `shared/validators/`") na Issue de manutenção que vai ratificar a casca (itens a, b e c do `plan.md`). Assim o próximo agente não lê o silêncio como proibição.
- **Pendências antigas, que este diff não toca:**
  - Falta o `withComponentInputBinding()` no `provideRouter(routes)` (`app.config.ts`), que o §4 exige.
  - O §2.3 ainda não registra a convenção `@Service()` e o sufixo `.service.ts`.
  - As duas já estão nos pareceres das Tarefas 2 e 3.

Arquivos revisados:
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/validators/institutional-email.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/validators/institutional-email.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
