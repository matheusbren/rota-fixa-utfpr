# Parecer de Código — Tarefa 5

**Veredito:** APROVADO

Não encontrei nada que bloqueie: o diff da Tarefa 5 respeita o `architecture.md` e a regra `01-angular-strict-rules.md`. Deixo quatro sugestões para a triagem. A que mais vale olhar é a 1.

## Apontamentos (bloqueiam)
Nenhum.

**Testes e lint, rodados no working tree:**
- `npm test`: 6 arquivos e 37 testes, todos passando. Na Tarefa 4 eram 22. Entraram 12 casos no novo `password.spec.ts` e 3 no `sign-up.spec.ts`.
- `npm run lint`: "All files pass linting".

**O que conferi.** Li o diff inteiro (`git diff 72ffd9b`, 5 arquivos, todos no índice e nenhum fora do diff) contra o `architecture.md` (§2, §2.1, §2.2 e §3), a `.agents/rules/01-angular-strict-rules.md` e as decisões de triagem das Tarefas 2, 3 e 4.

- **Camadas (§2.1 e §3):**
  - O validador fica em `shared/validators/`, como o §2.1 manda para validação reutilizável e como o `plan.md` (decisões técnicas, "Validadores") previu.
  - É uma `ValidatorFn` pura. Só importa de `@angular/forms`, não injeta nada e não importa de `features/` nem de `core/`.
  - A tela continua falando só com o `AuthService`.
- **Sintaxe:** usa `@let` e `@if`, `inject(FormBuilder)` e Reactive Forms. Não há `*ngIf`, `subscribe()` manual, `any`, injeção por construtor nem `standalone: true`.
- **Estilo:** o aviso usa `text-caption` e `text-error`, que são tokens do §2.2. Não há valor solto.
- **Duplicação:** procurei `password`, `MIN_LENGTH`, `minlength`, `\p{L}` e `\d` em `apps/web/src`. A regra "8 ou mais, com letra e número" só existe em `shared/validators/password.ts`. O `AuthService` e o `UsersService` só repassam a senha.
- **Mapa de mensagens:** as duas chaves novas (`passwordLength` e `passwordLetterAndNumber`) entraram em `ERROR_MESSAGES` (`sign-up.ts:14-15`). O `it.each` de `sign-up.spec.ts:126-146` confere cada mensagem na tela. Assim, o risco da sugestão 2 da Tarefa 4 (chave sem mensagem) fica coberto pela suíte para estas duas chaves.
- **Testes:**
  - `password.spec.ts` chama o validador num `FormControl` e confere as chaves de erro, que são o contrato com o mapa da tela, e não um detalhe interno.
  - `sign-up.spec.ts` prova que o aviso não existe antes do `blur` ("quando saio do campo"). Depois lê o aviso pelo `aria-describedby`, confere o botão desabilitado e fecha com `expectNone`.
  - Como nome e e-mail são válidos, quem invalida o formulário é a senha. Se alguém tirar o `[disabled]`, o `expectNone` falha.
- **O que já foi decidido e não volta:** a sugestão 3 da Tarefa 4 (`submit()` sem conferir a validade), a 4 (botão desabilitado sem motivo visível) e o `fullName` sem validador (Tarefa 3, decisão 6).

## Sugestões (não bloqueiam)

1. **A marcação do aviso agora existe duas vezes** (`sign-up.html:37` e `45-50`, cópia de `sign-up.html:22` e `30-35`).
   - A sugestão 5 da Tarefa 4 deixou a abstração "para quando chegar o segundo" caso. Ele chegou: o `@let`, o `aria-invalid`, o `aria-describedby` e o `<p id="…-error">` estão copiados, com o `id` do aviso escrito duas vezes por campo.
   - O prejuízo vem com o próximo formulário (sign-in da #2, `route-form`, `vehicle-form`): basta um `id` digitado diferente entre o `aria-describedby` e o `<p>` para o leitor de tela perder o aviso sem nenhum erro visível.
   - O `app-form-field` já recebe `controlId` (`shared/ui/form-field/form-field.ts:13`). Um `error = input<string>()` ali derivaria o `id` do aviso num lugar só.
   - Dentro desta tarefa a cópia é pequena e está testada, por isso fica como sugestão.

2. **O validador decide o que a tela mostra** (`password.ts:15-18` e o teste `password.spec.ts:27-33`).
   - Para `abc`, que é curta e não tem número, o validador devolve só `{ passwordLength: true }`. Ele descarta a outra falha.
   - O `errorOf` (`sign-up.ts:49-55`) já mostra só a primeira chave. Se o validador devolvesse as duas na ordem tamanho → letra e número, a tela mostraria a mesma coisa.
   - A política "um requisito por vez" fica, portanto, em dois lugares, e o teste a fixa no `shared/`.
   - Uma tela futura que queira listar todos os requisitos que faltam (por exemplo, trocar a senha) não conseguiria reaproveitar este validador. O prejuízo hoje é nulo. Registro só para o caso de reúso.

3. **O tamanho conta unidades UTF-16, não caracteres** (`password.ts:15`).
   - `value.length` conta emoji e outros caracteres fora do plano básico como 2. Assim, `😀😀😀a1` (5 caracteres visíveis) tem `length` 8 e passa, contra o "8 caracteres ou mais" do CA5.
   - É um caso raro e de prejuízo baixo. `[...value].length` conta pontos de código e chega mais perto do que a pessoa enxerga.

4. **O valor `null` quebra o validador** (`password.ts:14-15`).
   - É o mesmo padrão da sugestão 1 da Tarefa 4, que não foi promovida: `value.length` lança `TypeError` se o validador for usado num controle anulável.
   - Registro só para lembrar que, se um dia essa decisão mudar, agora há dois validadores para ajustar.

## Observações fora do escopo deste diff
- Nenhuma pendência nova. Continuam valendo as já registradas nos pareceres anteriores:
  - Falta o `withComponentInputBinding()` no `app.config.ts`, que o §4 exige.
  - A direção `core/` → `shared/validators/` não está escrita no §3.
  - Os itens a, b e c de ratificação do `plan.md`.

Arquivos revisados:
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/validators/password.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/validators/password.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/ui/form-field/form-field.ts (consulta, fora do diff)
- /home/guibondezan/rota-fixa-utfpr/apps/web/src/app/shared/validators/institutional-email.ts (consulta, fora do diff)
