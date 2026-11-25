# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| Regra geral: "Toda mensagem de erro de campo aparece **depois que a pessoa sai do campo** (o campo 'tocado'), e nunca antes: abrir a tela não mostra aviso nenhum. Enquanto houver qualquer erro, o botão 'Publicar rota' fica desligado." | atendido | **Horário e Vagas:** o aviso só aparece quando o controle está `touched` (`apps/web/src/app/features/driver/route-form/route-form.ts:78-85`). O campo nativo só fica tocado quando a pessoa sai dele. Os testes conferem que não há aviso com o valor já digitado e antes de sair do campo (`route-form.spec.ts:452`, `:481`). **Dias:** o grupo fica tocado no primeiro toque numa caixa (`apps/web/src/app/shared/ui/weekday-picker/weekday-picker.ts:46-55`). Antes disso o grupo está vazio e inválido, e mesmo assim nenhum aviso aparece (`route-form.spec.ts:403-404`). Veja a primeira leitura adotada, abaixo. **Botão:** `route-form.html:152` (`[disabled]="form.invalid"`). Os testes conferem o botão desligado em `route-form.spec.ts:415`, `:439`, `:458` e `:487` |
| CA5: "quando marco um dia e desmarco, deixando nenhum, então vejo 'Escolha pelo menos um dia da semana' e o botão continua desligado; quando marco o sexto dia, então vejo 'Uma rota tem no máximo 5 dias'; com 1 a 5 dias marcados, a mensagem some." | atendido | **Regra:** `apps/web/src/app/shared/validators/weekdays-count.ts:6-14`, ligada como `weekdaysCount(1, 5)` em `route-form.ts:68`. **Textos:** `route-form.ts:31-34`. **Tela:** `route-form.html:102-114`, com o seletor em `:110` e o aviso em `:111-113`. As caixas estão em `weekday-picker.html:1-11`. **Teste de um dia (`route-form.spec.ts:400-422`):** marcar Segunda não mostra aviso e liga o botão (`:406-409`). Desmarcar mostra o aviso, marca o grupo e desliga o botão (`:411-415`). Marcar Quarta tira o aviso e liga o botão (`:417-421`). **Teste de cinco dias (`:424-446`):** cinco dias são aceitos (`:428-433`). O sexto mostra o aviso e desliga o botão (`:435-439`). Voltar a cinco tira o aviso (`:441-445`). **Validador sozinho:** aceita 1, 3 e 5 dias e recusa 0 e 6 (`weekdays-count.spec.ts:12-24`) |
| CA6: "quando saio do campo Horário de saída vazio, então vejo 'Informe o horário de saída'." | atendido | **Regra:** `route-form.ts:69` (`Validators.required`). **Texto:** `route-form.ts:35-37`. **Tela:** `route-form.html:116-131`, com o aviso em `:126-130` e o `aria-invalid`/`aria-describedby` em `:123-124`. **Teste:** `route-form.spec.ts:448-466`. Ao sair do campo vazio, o teste confere o texto, o campo marcado e o botão desligado (`:454-458`). Com "07:30", o aviso some e o botão liga (`:460-465`) |
| CA7: "quando saio do campo Vagas vazio, então vejo 'Informe quantas vagas o carro oferece'; quando saio dele com 0, 5 ou um número quebrado (2,5), então vejo 'Uma rota tem de 1 a 4 vagas'. De 1 a 4, a mensagem some." | atendido | **Regras:** `route-form.ts:70-74`: `required`, `min(1)`, `max(4)` e `pattern(/^\d+$/)`, que é o "número inteiro" de `plan.md:37-38`. **Textos:** `route-form.ts:15` e `:38-43`. As três regras de faixa dão a mesma frase, então a ordem das chaves de erro não muda o aviso. **Tela:** `route-form.html:133-147`, com o aviso em `:144-146`. **Testes:** vazio, `0`, `5` e `2.5` em `route-form.spec.ts:468-489`. Cada caso confere o texto, o campo marcado e o botão desligado. Com `1` e `4`, o aviso some e o botão liga (`:491-505`). O `3` é o valor de Vagas de todas as rotas válidas dos outros testes (`:66`) |
| CA1 (Tarefa 1): "[...] Dias da semana (segunda a sábado) [...] nenhuma mensagem de erro, e o botão 'Publicar rota' desligado." | atendido | O teste `route-form.spec.ts:256-268` continua passando com o seletor novo. As seis caixas, de Segunda a Sábado, estão no grupo "Dias da semana" (`:265`), e nenhuma está marcada (`BLANK_FORM`, `:46`). Ao abrir, o grupo está vazio e inválido, mas não recebe `aria-invalid` (`expectNoMessages()`, `:266`). O botão está desligado (`:267`) |
| CA2, CA3 e CA4 (Tarefa 2) | atendido | Os testes `route-form.spec.ts:295-398` e `:507-515` não mudaram e continuam passando. O `fillInValidRouteExcept` (`:229-244`) ainda marca Segunda nesses testes. Com o seletor novo, esse toque deixa o grupo tocado. Com um dia, porém, ele é válido: nenhum aviso aparece, e o botão ligado ainda prova que só a regra testada o bloqueava |
| CA17 (Tarefa 1): "[...] o formulário vem em branco, sem mensagens, e nada foi gravado." | atendido | O teste `route-form.spec.ts:270-293` continua passando. Os dias agora são um campo só (`route-form.ts:68`), criado de novo a cada vez que a tela abre. O estado das caixas fica no próprio seletor (`weekday-picker.ts:28`), que também é criado de novo. A Quarta marcada antes de sair (`:281`) não volta (`BLANK_FORM` em `:289`) |
| CA8: CEP pelo ViaCEP | fora desta tarefa | Tarefa 4 do `plan.md` |
| CA9 e CA10: envio, "Publicando…" e segundo toque | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA11: falha no envio | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA12: conflito com outra rota minha | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA13 e CA14: tela da rota | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA15: próximas viagens | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16: Minhas rotas | fora desta tarefa | Tarefa 10 do `plan.md` |

**Testes:** o `npm test` passou, com 9 arquivos e 88 de 88 testes. A lista detalhada mostra 25 testes no `route-form.spec.ts` (os 16 das Tarefas 1 e 2 mais 9 novos) e 5 no `weekdays-count.spec.ts`, que é novo. Todos passam. Os testes provam o que dizem provar:
- **Botão:** o `fillInValidRouteExcept` agora também pode deixar os dias de fora (`route-form.spec.ts:240-243`). Assim, o botão desligado do CA5 vem só da regra dos dias.
- **Avisos dos dias:** o teste lê os avisos pelo `aria-describedby` do grupo (`:206-219`) e compara a lista inteira (`toEqual`). O teste só passa se o parágrafo do aviso estiver na tela com o texto exato.
- **Recusa e aceite:** cada caso que recusa tem, no mesmo teste ou no teste par, o caso que aceita, com o botão ligado.

**Leituras adotadas (não são apontamentos):**
1. **Quando o aviso dos dias aparece.** A regra geral diz que o aviso aparece depois que a pessoa sai do campo. O CA5 é o único critério da seção que não fala em "sair": o aviso vem "quando marco um dia e desmarco" e "quando marco o sexto dia". O CA2, o CA3, o CA4, o CA6 e o CA7 dizem "quando saio do campo".
   - **O que o código faz:** o seletor segue o CA5 ao pé da letra. Cada toque numa caixa já deixa o grupo tocado (`weekday-picker.ts:46-55`), e o comentário em `route-form.spec.ts:400` registra isso.
   - **O que continua garantido:** a promessa da regra geral ("abrir a tela não mostra aviso nenhum") continua valendo e está testada (`:403-404`).
   - **Consequência:** quem passa pelas caixas com Tab e sai sem marcar nenhuma não vê o aviso dos dias, e o botão continua desligado. O CA5 não pede esse caso. Para o Campus, ao contrário, o CA2 pede ("saio do campo Campus sem escolher nenhum"). Se a equipe quiser o aviso também nesse caso, é preciso esclarecer a spec. Não é falha desta tarefa.
2. **O "2,5" do CA7.** O teste digita `2.5`, e não `2,5` (`route-form.spec.ts:468-474`). No jsdom, `2,5` num campo numérico vira valor vazio. A página declara `lang="pt-BR"` (`apps/web/src/index.html:2`), e o navegador entrega o valor do campo numérico com ponto.
   - **O que o jsdom não prova:** se o navegador do aparelho recusar a vírgula, o valor chega vazio e aparece "Informe quantas vagas o carro oferece", e não a frase da faixa.
   - **Precedente:** é o mesmo limite do jsdom que a Tarefa 2 teve com o `maxlength`.
   - **Sugestão:** vale digitar 2,5 no celular junto com os prints do PR.
3. **O nome do seletor.** `app-weekday-picker` não está no Mapa de Componentes do `architecture.md` §3, que lista `weekday-strip` em `shared/ui/`. Não é termo do glossário (§5.1). O nome e o lugar vêm do `plan.md` aprovado (`:39-41`, `:85`). A ratificação do §3 no fechamento da história já está registrada em `tarefa-01-decisoes-r1.md`.

**Diff:** o diff contra `e3f6cfe` mexe em 7 arquivos, todos nos "Arquivos previstos" da Tarefa 3. Nenhum arquivo está fora do índice.
- **Glossário (§5.1):** os controles se chamam `weekdays`, `departureTime` e `seats`, como em `FixedRoute`. O valor dos dias deixou de ser um grupo com uma caixa por dia e passou a ser a lista dos números ISO, em ordem (`[1, 3, 5]`). Essa é a forma do `weekdays` no §5.1. As faixas de 1 a 4 vagas e de 1 a 5 dias são as do §5.2 (RN03). O validador fica em `shared/validators/`, como o §2.1 pede para a regra "pelo menos um dia da semana".
- **Escopo:** o diff não traz comportamento que a spec não pediu.
  - **Sexto dia:** o seletor não impede marcar o sexto dia. Ele deixa marcar e avisa, como o CA5 descreve.
  - **Horário:** só tem a regra de obrigatório, sem formato nem faixa a mais.
  - **`aria-invalid` e `aria-describedby`:** no grupo e nos campos, seguem a convenção registrada em `tarefa-01-decisoes-r1.md`.
- **Abandono:** nenhum caso do "Abandono no meio" é desta tarefa, e o CA17 continua atendido.

## Apontamentos
