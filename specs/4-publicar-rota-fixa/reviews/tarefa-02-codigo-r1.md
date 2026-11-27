# Parecer de Código — Tarefa 2

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no working tree:
- `npm test`: 8 arquivos, 74 de 74 testes passando. São 28 a mais que na Tarefa 1: 15 no `trimmed.spec.ts` novo e 13 no `route-form.spec.ts` (CA2, CA3, CA4 e os dois limites de tamanho).
- `npm run lint`: "All files pass linting". A saída só apareceu com `rtk proxy`.

Conferi o diff inteiro (`git diff 2ab20b4`) contra o `docs/architecture.md` (§2, §2.1, §2.2 e §3) e a `.agents/rules/01-angular-strict-rules.md`. São 5 arquivos, todos previstos na tarefa.
- **Camadas (§3):**
  - `shared/validators/trimmed.ts` importa só de `@angular/forms`. Não conhece domínio, nem `core/data/`, nem `features/`. É a pasta que o §2.1 reserva para "validação reutilizável".
  - A feature importa o validador de `shared/`, o que a regra de dependência permite. O diff não toca Service nem HTTP.
- **Validadores (plano, "Decisões técnicas"):**
  - `trimmedRequired` e `trimmedMinLength(n)` têm os nomes do plano e são usados nos dois campos que o plano lista. Não é abstração para um caso só.
  - O `trimmedMinLength` não aponta o campo vazio e deixa isso para o `trimmedRequired`. É a mesma convenção do `Validators.minLength` do Angular. Assim sai um erro por vez, sem depender da ordem dos validadores.
- **Duplicação:** procurei `trim()`, `touched`, `ERROR_MESSAGES` e `Object.keys(control.errors)` em `apps/web/src`.
  - A regra "os espaços das pontas não contam" só existe em `trimmed.ts`. O outro `trim()` de produção é o `normalizeEmail`, que cuida de e-mail.
  - O `errorOf` repetido está na sugestão 2.
- **Sintaxe:** o diff usa `@let`, `@if`, `inject()`, Reactive Forms com `FormBuilder.nonNullable` e `ValidatorFn` tipado. Não há `any`, `*ng…`, `standalone: true`, decorator nem `subscribe()`.
- **Estilo (§2.2):** só tokens: `text-caption`, `text-error` e `text-text-muted` (na dica). Não há `.css` por componente nem `style=`.
- **Convenção adotada na triagem da Tarefa 1:**
  - Todo campo com erro leva `aria-invalid="true"` e aponta o aviso por `aria-describedby`.
  - A dica do Ponto de encontro fica ligada desde o início e não marca o campo como inválido.
  - Com isso, o `expectNoMessages()` passa a ter o que achar.
- **Testes:**
  - Acham o campo pelo rótulo, o aviso pela descrição acessível e o botão pelo texto. Não leem o `FormGroup` nem chamam método do componente.
  - O `fillInValidRouteExcept` deixa válido tudo menos o campo testado, sem tocar em nenhum. Assim, o botão desligado prova a regra daquele campo, e o botão ligado no fim prova que a regra aceita o valor certo.
  - Os validadores são testados direto num `FormControl`, como os outros da pasta. Os testes conferem a chave de erro, que é o contrato com o mapa de mensagens.
- **Processo:** além do diff, dos testes e do lint, usei o shell só para ler. Foram `grep`, `ls` e `cat` (inclusive no `@angular/forms` do `node_modules`), mais `git status`, `git log` e `git show --stat` para conferir o escopo. Nenhum arquivo foi alterado.

## Sugestões (não bloqueiam)
1. **O `maxlength` do template também liga um validador, e esse validador não tem mensagem** (`apps/web/src/app/features/driver/route-form/route-form.html:64` e `:83`, `route-form.ts:13-25`).
   - O `ReactiveFormsModule` exporta a diretiva `MaxLengthValidator`, de seletor `[maxlength][formControlName]`. Por isso, `maxlength` junto com `formControlName` põe no controle um validador com a chave `maxlength`, que não está no `ERROR_MESSAGES`.
   - Quem digita não chega a esse erro. O navegador não deixa passar de 60 nem de 120 caracteres, nem colando.
   - Um valor escrito por código chega. A Tarefa 4 vai escrever no Bairro, por `effect()`, o bairro que o ViaCEP devolver.
   - Se esse bairro tiver mais de 60 caracteres, o formulário fica inválido e o `errorOf` devolve `undefined`. A pessoa vê o botão desligado, sem aviso e sem campo marcado.
   - É o risco da sugestão 2 da Tarefa 4 da US01 (chave de erro sem mensagem), agora com um caminho real.
   - Como a spec não tem texto para um aviso de tamanho, o caminho que cabe nela é a Tarefa 4 cortar o bairro do ViaCEP no limite antes de escrevê-lo no campo.
2. **O `errorOf` agora existe em duas features** (`route-form.ts:75-82` e `apps/web/src/app/features/auth/sign-up/sign-up.ts:78-84`).
   - A regra "aviso só depois de sair do campo, um erro por vez" é o padrão que a spec herda da US01 ("Depende de": "mensagens ao sair do campo"). Agora ela está copiada.
   - As duas cópias já diferem:
     - na assinatura: uma recebe o controle, a outra o nome do campo;
     - no mapa: um é por chave de erro, o outro por campo e chave de erro.
   - O §3 diz que, quando duas features precisam da mesma peça, ela sobe para `shared/`. A #2 (entrar) e a #3 (veículo) vão trazer a terceira e a quarta cópia. Uma mudança na regra teria de achar todas.
   - Não bloqueia agora porque a forma dela ainda muda nesta história:
     - o CA5 mostra o aviso dos dias ao desmarcar, e não ao sair do campo;
     - os avisos de busca do CEP (CA8) não vêm de validador.
   - Extrair antes das Tarefas 3 e 4 seria definir a assinatura sem saber o que elas vão pedir. É candidata a Issue de manutenção no fechamento da história. Ela precisa de um lugar declarado no §3, porque hoje `shared/` só tem `ui/`, `pipes/` e `validators/`.
3. **Os testes fixam a ordem das descrições** (`route-form.spec.ts:358` e `:370-373`, com o ajudante em `:196-201`).
   - O `toEqual([MEETING_POINT_HINT, message])` exige a dica antes do erro no `aria-describedby`. A spec não fixa essa ordem: o "antes de qualquer erro" do CA4 fala de tempo, não de posição.
   - Inverter os dois ids no template quebraria quatro testes (os três casos do `it.each` e o teste da volta a 5 caracteres) sem mudar nada do que a spec pede.
   - Comparar sem ordem protege o mesmo comportamento, por exemplo com `expect.arrayContaining` e o tamanho conferido.

## Observações fora do escopo deste diff
- **O botão desligado continua sem motivo visível.**
  - O `docs/design-tokens.md:141` diz que, no botão desabilitado, "o motivo aparece em texto perto do botão". A spec da US04 decide o contrário (CA1: nenhuma mensagem ao abrir), como a US01 já tinha decidido.
  - Na US01 o conflito foi levantado e não promovido (Tarefa 4, sugestão 4). A linha do `[disabled]` não mudou neste diff.
  - Enquanto o `design-tokens.md` não for ratificado, cada formulário novo reabre a mesma dúvida. É candidata a manutenção do documento.
