# Parecer de Código — Tarefa 9

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes, o lint e o Prettier no working tree:
- `CI=true npm test -- --watch=false`: 16 arquivos e 170 testes, todos passando. Em relação à Tarefa 8 são 1 arquivo e 10 testes a mais: 7 no `upcoming-trips.spec.ts`, que é novo, e 3 no `route-detail.spec.ts`.
- `npm run lint`: "All files pass linting".
- `npx prettier --check` nos 8 arquivos do diff: passou. O comando só confere, não grava.

Li o diff inteiro (`git diff d5167b12c81405ad8357b45f7fc7632fbe7c715f`) e comparei com o `docs/architecture.md` (§2, §2.1, §3, §5.1) e com a `.agents/rules/01-angular-strict-rules.md`. O diff tem 8 arquivos. São os "Arquivos previstos" da tarefa, mais o `route-form.spec.ts`, cuja mudança está explicada no item 5 das sugestões.

- **Camadas (§3):**
  - `upcoming-trips.ts` importa só de `core/models/`.
  - `segmented-control` importa só de `@angular/core`, não injeta nada e conversa só por `input()` e `model()`.
  - `route-detail.ts` importa de `core/data/`, `shared/pipes/`, `shared/ui/` e do próprio arquivo ao lado. Nenhuma feature importa outra.
- **Sintaxe (§2):** o diff usa `@defer (on viewport)` com `@placeholder`, `@for` com `track trip.getTime()`, `@if`/`@else` e `@let`. O estado é feito com `signal` e `computed`, o two-way com `model.required` mais `[(value)]` (ID12), e a data passa pelo `DatePipe` em pt-BR. Não há `standalone: true`, arquivo `.css`, cor solta, `subscribe()` nem `any`.
- **O `@defer` funciona de verdade:**
  - O `import type { SegmentedOption }` fica separado. Por isso o `SegmentedControl` só é usado no `imports`, e o build gera um chunk lazy próprio para ele (`segmented-control`, 3.87 kB).
  - O `@placeholder` tem um único elemento raiz, que é o que o gatilho `on viewport` observa.
- **Regra pura (ID33):**
  - `upcomingTrips` e `tripsThisWeek` não leem relógio: recebem o `now`. O teste roda sem `TestBed`, em hora local.
  - Ele fixa as bordas: a viagem que sai na hora exata de agora, o domingo às 23:59 contra a segunda às 00:00, e o limite de 28 dias. O `toEqual` da lista inteira quebra se o laço for até o 29º dia.
- **Testes da tela:** leem pelo título da seção, pelo texto dos botões e pelo `aria-pressed`, que é o contrato acessível, e não detalhe interno.
- **O `DeferBlockBehavior.Manual` é necessário.** Conferi no `@angular/core` instalado (`node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:2180`): o gatilho `on viewport` faz `new IntersectionObserver` sem nenhuma proteção, e o jsdom não tem `IntersectionObserver`.
- **Duplicação:** procurei outra conversão de `getDay()` para o dia ISO e não achei. O `WeekdaysPipe` só converte número em nome. A leitura do "HH:mm" é a exceção, no item 3 das sugestões.

## Sugestões (não bloqueiam)
1. **O `computed` lê o relógio sem que isso apareça para os signals** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/route-detail.ts:64-72`).
   - O `new Date()` dentro do `trips` não é um signal. O Angular só recalcula quando o `routeLookup` ou o `period` mudam.
   - O comentário diz isso com honestidade ("a cada troca de recorte"). Mas, com a tela aberta, a viagem que já passou continua na lista até a pessoa trocar o recorte.
   - Os testes também dependem de trocar o `Date` global (`vi.setSystemTime`), e não de um valor que a tela recebe.
   - Saída: um signal `now`, preenchido quando o bloco é desenhado ou atualizado por um temporizador. Assim o `computed` volta a ser só derivação.
   - Não bloqueia porque o CA15 fala do momento em que a pessoa desce até a lista, e esse caso funciona.
2. **O "4" da RN18 está na página, longe da regra** (`route-detail.ts:13-14`, com a regra em `/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/upcoming-trips.ts:12-32`).
   - O `findConflict` guarda o número da regra ao lado dela (`MINIMUM_GAP_MINUTES` em `core/data/find-conflict.ts:5`). Aqui, a regra das viagens está num arquivo e o número de semanas está em outro.
   - Quando a #6 passar a gravar as viagens, a geração vai para o `FixedRoutesService` (§5.1). Como o `core/` não pode importar de `features/` (§3), a função vai ter de mudar de lugar.
   - Se o número ficar no componente, a mudança tende a criar uma segunda cópia do "4".
   - Saída: exportar a constante de `upcoming-trips.ts`. O lugar da função segue o plano, por isso não aponto.
3. **A leitura do "HH:mm" está escrita duas vezes** (`upcoming-trips.ts:17` e `/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/data/find-conflict.ts:9`, ambas `departureTime.split(':').map(Number)`).
   - Hoje as duas aceitam o `"07:30:00"` que o `time` do Postgres vai devolver na E3. O prejuízo é pequeno.
   - Se o formato do modelo mudar, são dois lugares para lembrar, em camadas diferentes.
   - Cabe juntar as duas na mudança da #6, num ajudante ao lado de `core/models/fixed-route.ts`.
4. **O teste pega o primeiro bloco `@defer` do app inteiro** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/route-detail.spec.ts:160`).
   - `const [block] = await harness.fixture.getDeferBlocks()` procura na árvore toda, a partir da casca.
   - Se outro `@defer` entrar antes deste, na casca (o `offline-banner` do §3 é um candidato) ou mais acima na própria tela, o teste desenha o bloco errado. A falha aparece longe da causa, como "parte Próximas viagens" ou botão não encontrado.
   - Saída barata: `expect(blocks).toHaveLength(1)` antes de desenhar, para a falha dizer o que aconteceu.
5. **O `Manual` vai ter de ser copiado em cada teste do app inteiro que chegar à tela da rota** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts:137`).
   - O spec da feature `driver` agora precisa saber que um template da `search` tem um `@defer (on viewport)`.
   - O próximo caso já está no plano: a Tarefa 10 (CA16, "tocar no cartão abre a tela dela"). Se o spec dela usar o `appConfig` e navegar até `/rotas/:id` sem a mesma linha, quebra com `IntersectionObserver is not defined`.
   - Saída: pôr um `IntersectionObserver` de mentira no setup dos testes, ou um ajudante comum que monte o `TestBed` do app inteiro. O ajudante comum se junta aos ajudantes de teste repetidos que a Tarefa 1 já registrou.

## Observações fora do escopo deste diff
- **O mapa de componentes do §3 continua divergindo, agora em dois pontos.**
  - O `segmented-control` entrou em `shared/ui/` sem estar no mapa, e só a `search` o usa.
  - O mapa põe um `trip-list` em `shared/ui/`, mas este diff desenha a primeira lista de viagens do app direto no `route-detail.html:49-56`.
  - As duas coisas entram na mesma ratificação do §3 que as Tarefas 1 e 3 já pediram para o `weekday-picker`, no fechamento da história. Convém decidir antes da agenda se este `<ul>` é o `trip-list`. Sem isso, a agenda tende a criar uma segunda lista de viagens diferente desta.
- **O §5.1 ("Geração de viagens") diz que, na E2, o `FixedRouteService` cria as viagens ao publicar.** Esta história as calcula na tela, como premissa da spec que a #6 fecha. Vale corrigir o §5.1 no fechamento, para o próximo agente não gerar as viagens no `publish`.
- **Fuso, para a #6.**
  - `upcomingTrips` monta as datas no fuso do aparelho. Para mostrar na tela isso basta, porque o `DatePipe` formata no mesmo fuso.
  - Quando a #6 gravar o `departsAt` em ISO com fuso (§5.1, "Tempo"), a geração precisa fixar o `-03:00` dos câmpus. Senão, um aparelho em UTC, como o CI, grava 07:30Z, que são 04:30 no horário de Brasília.
- **O anel de foco ganhou mais uma cópia** em `segmented-control.html:6`. A manutenção já foi registrada na Tarefa 1; fica só a contagem atualizada.

Processo: usei o shell só para `git diff`, `git status`, `grep`, `cat`, `sed` e `ls`, inclusive dentro do `node_modules`, e para rodar `npm test`, `npm run lint` e `prettier --check`. Nenhum arquivo foi alterado.
