# Parecer de Código — Tarefa 3

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no working tree:
- `npm test`: 9 arquivos, 88 de 88 testes passando. São 14 a mais que na Tarefa 2: 5 no `weekdays-count.spec.ts` novo e 9 no `route-form.spec.ts`. Os 9 são dois do CA5, um do CA6, quatro recusas e duas aceitações do CA7.
- `npm run lint`: "All files pass linting". A saída só apareceu com `rtk proxy`.
- `npx prettier --check` nos 7 arquivos, um comando que só confere e não grava: todos seguem o `.prettierrc` (§2.3).

Conferi o diff inteiro (`git diff e3f6cfe`) contra o `docs/architecture.md` (§2, §2.1, §2.2, §3 e §5.1) e a `.agents/rules/01-angular-strict-rules.md`. São 7 arquivos, todos previstos na tarefa.
- **Camadas (§3):**
  - `shared/ui/weekday-picker/` e `shared/validators/weekdays-count.ts` importam só de `@angular/core` e `@angular/forms`. Não injetam Service e não conhecem `core/data/` nem `features/`.
  - O §2.1 dá "pelo menos um dia da semana" como exemplo de validação que mora em `shared/validators/`. O `weekdaysCount(1, 5)` é esse validador, com o nome e a assinatura do plano.
  - A feature importa de `shared/`, o que a regra de dependência permite. O diff não toca Service nem HTTP.
- **Seletor de dias (plano, "Decisões técnicas"):**
  - O `WeekdayPicker` é o `ControlValueAccessor` que o plano decidiu.
  - O estado interno é um signal (`selected`) e o `[checked]` lê esse signal. Por isso a tela atualiza sem zone.js.
  - O valor segue o §5.1: a lista de dias pelo número ISO.
  - A lista de segunda a sábado saiu do `route-form` e foi para o seletor, sem deixar cópia.
  - O seletor chama `onTouched` a cada toque (`weekday-picker.ts:46-55`). Assim o aviso do CA5 aparece ao desmarcar, e o `errorOf` do `route-form` não precisa de um caso especial para os dias.
- **Vagas** (`route-form.ts:71-74`):
  - `required`, `min(1)`, `max(4)` e `pattern(/^\d+$/)` já vêm prontos no Angular.
  - Conferi no `@angular/forms` 22.2.4 como o 2,5 é recusado. O campo numérico entrega o `parseFloat` do texto, e o `pattern` testa esse número convertido em texto: o `"2.5"` é recusado e o `4` passa.
  - O validador de "número inteiro" que o plano pedia saiu sem criar um validador novo para um caso só.
- **Mensagens:**
  - Toda chave de erro possível tem frase no `ERROR_MESSAGES` (`route-form.ts:31-43`):
    - nas vagas, `required`, `min`, `max` e `pattern`;
    - nos dias, `tooFewWeekdays` e `tooManyWeekdays`;
    - no horário, `required`.
  - O `type="number"` não tem atributo `min` nem `max` no template. Então nenhum validador escondido entra pelo HTML, que era o risco da sugestão 1 da Tarefa 2.
- **Duplicação:**
  - Procurei `Segunda`, `isoDay`, `weekday` e a faixa de vagas em `apps/web/src`. A lista de dias e as regras de dias e de vagas só existem neste diff.
  - O `SEATS_RANGE_MESSAGE` aparece também no spec. É o texto esperado do CA7, e o teste deve escrevê-lo por conta própria.
- **Sintaxe:** o diff usa `@let`, `@if`, `@for` com `track`, `signal()`, Reactive Forms com `FormBuilder.nonNullable` e `ValidatorFn` tipado. Não há `any`, `*ng…`, `standalone: true`, decorator `@Input`/`@Output`, injeção pelo construtor nem `subscribe()`.
- **Estilo (§2.2):** só tokens (`text-caption`, `text-error`, `text-body`, `outline-focus`). Não há `.css` por componente nem `style=`.
- **Convenção da triagem da Tarefa 1:**
  - O horário e as vagas levam `aria-invalid` e `aria-describedby`, como os outros campos.
  - Nos dias, as duas marcas ficam no `fieldset`, e é ali que o `expectNoMessages()` as encontra.
- **Testes:**
  - Acham o grupo pela legenda, cada dia e cada campo pelo rótulo e o aviso pela descrição acessível. Não leem o `FormGroup` nem chamam método do componente.
  - O CA1 e o CA17 marcam dias e continuaram conferindo as mesmas coisas depois que o grupo de caixas da Tarefa 1 virou o seletor. Isso mostra que eles não dependem da implementação.
  - O `weekdays-count.spec.ts` chama o validador num `FormControl`, como os outros da pasta, e confere as chaves de erro. Elas são o contrato com o mapa de mensagens.
- **Processo:**
  - Além do diff, dos testes e do lint, usei o shell só para ler: `git status`, `git log`, `cat`, `grep` e `sed`, inclusive no `@angular/forms` do `node_modules`. Também rodei o `prettier --check`.
  - Nenhum arquivo foi alterado.

## Sugestões (não bloqueiam)
1. **Quem usa leitor de tela não fica sabendo do aviso dos dias** (`apps/web/src/app/features/driver/route-form/route-form.html:104-113`, `apps/web/src/app/shared/ui/weekday-picker/weekday-picker.html:3-8`).
   - Quando a pessoa desmarca o último dia, o foco continua na caixa que ela tocou. A caixa não aponta para o aviso e o `<p>` do aviso não é região viva, então nada é anunciado.
   - Nos outros campos o aviso nasce quando a pessoa sai do campo. Aqui ele nasce no toque, com o foco ainda dentro do grupo.
   - O `aria-invalid` no `fieldset` ajuda pouco. O ARIA 1.2 tornou obsoleto o uso global do `aria-invalid`, e o papel `group` (o do `fieldset`) não está entre os que o aceitam. O papel `checkbox` está.
   - Há um caminho que mantém o seletor burro. Ele recebe por `input()` o id do aviso e se há erro, e põe `aria-describedby` e `aria-invalid` em cada caixa. O `expectNoMessages()` continua achando `aria-invalid="true"`.
   - Não bloqueia, porque o PRD §7 cobra teclado, foco e contraste, e não o anúncio. Mas o seletor está em `shared/ui/` para ser reaproveitado, e cada uso novo vai herdar esse silêncio.
2. **O comportamento prometido pelo seletor não é todo testado, e uma parte nem está implementada** (`apps/web/src/app/shared/ui/weekday-picker/weekday-picker.ts:15-16`, `:34-36` e `:52`).
   - O comentário promete o valor "em ordem". Só o `toggle` ordena, e só ao marcar; o `writeValue` guarda a lista como ela chegou.
   - Nenhum teste marca dias fora de ordem, então tirar o `.sort` não quebra nada hoje. Mas o CA13 pede os dias "em ordem" na tela da rota, e o que for gravado na Tarefa 6 sai daqui.
   - Também não há `setDisabledState`. Se um dia o controle for desligado com `disable()`, as caixas continuam clicáveis. Hoje nenhuma tarefa deste plano desliga o controle.
   - Um `weekday-picker.spec.ts` ao lado do componente (ID33), com esses três casos, fixaria esse comportamento antes de a US11 reaproveitar o seletor com uma rota já gravada.
3. **O `shared/ui/` passa a ter um componente que não conversa por `input()`/`output()`** (`apps/web/src/app/shared/ui/weekday-picker/weekday-picker.ts:17-25`).
   - O item 3 da `01-angular-strict-rules.md` descreve o `shared/` como "componentes burros (só `input()`/`output()`)".
   - O seletor conversa com o pai pelo `ControlValueAccessor`, que foi decisão do plano, e não injeta nada. Está dentro do espírito da regra, mas o texto diz "só".
   - Vale registrar no §3, no fechamento da história, que um campo de formulário em `shared/ui/` pode ser um `ControlValueAccessor`. Assim o próximo revisor não reprova o próximo campo desse tipo, e o próximo implementador não troca o `ControlValueAccessor` por `model()`, o que tiraria o campo do formulário reativo.
   - Isso entra na mesma ratificação que o parecer da Tarefa 1 já pediu para o mapa do §3: o `weekday-picker` não está no mapa e, por enquanto, só a feature `driver` o usa.

## Observações fora do escopo deste diff
- **Nenhum aviso de campo do app é região viva** (`apps/web/src/app/features/auth/sign-up/sign-up.html:85-87` e os campos das Tarefas 1 e 2 do `route-form`).
  - O padrão vem da US01. Ao sair de um campo com erro, a pessoa que usa leitor de tela só descobre o aviso se voltar ao campo.
  - O diff só segue o padrão; a sugestão 1 cobre a parte nova.
  - É candidata a Issue de manutenção, a ser decidida junto com o `errorOf` comum que já ficou para o fechamento.
- As observações das Tarefas 1 e 2 continuam valendo, e o diff só segue esses padrões:
  - o §3 diverge do plano;
  - o anel de foco se repete em cada controle;
  - o botão desligado continua sem motivo visível.
