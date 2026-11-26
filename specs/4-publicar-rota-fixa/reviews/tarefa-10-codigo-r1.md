# Parecer de Código — Tarefa 10

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

**O que foi rodado.** Rodei tudo no working tree, sem alterar nada:
- `CI=true npm test -- --watch=false`: 17 arquivos e 184 testes, todos passando. Na Tarefa 9 eram 16 e 170. O arquivo novo é o `my-routes.spec.ts`. Dos 14 testes novos, 6 estão em `fixed-routes.service.spec.ts` e 8 em `my-routes.spec.ts`.
- `npm run lint`: "All files pass linting".
- `npx prettier --check` nos arquivos de código do diff: passou. Esse comando só confere, não grava.

**Escopo do diff.** Li o diff inteiro (`git diff db5634b993bf80502a5d4974992ed533aaddc058`, 11 arquivos) contra o `docs/architecture.md` (§2, §2.1, §3, §4) e contra a `.agents/rules/01-angular-strict-rules.md`. Os arquivos são estes, e nenhum outro:
- os 7 arquivos previstos;
- o `fixed-routes.service.{ts,spec.ts}`, autorizado pelo fato 2;
- o comentário de `route-detail.html:67` (fato 8);
- o `tarefa-09-decisoes-r1.md`, que é do orquestrador.

**Camadas (§2.1, §3).**
- `MyRoutes` usa `inject()` para o `AuthService` e o `FixedRoutesService` e não toca no `HttpClient`.
- `RouteCard` não injeta nada e importa só de `core/models/` e de `shared/pipes/`.
- Nenhuma feature importa outra: nada vem de `search`. O `core/` não importa de `features/`. A URL fica só no Service, via `environment.apiUrl`.

**Falha (§2.1, fatos 1 e 2).**
- `lookupActiveByDriver` tem um `catchError` externo que cobre as duas buscas e o campus que falta. O Observable nunca termina em erro.
- Os testes provam isso de três formas: `failure()` fica `undefined`, nenhum GET de câmpus sai depois que a primeira busca falha (`expectNone`), e o campus apagado vira `failed`.
- A falha não é silenciosa: a tela mostra `role="alert"` e "Tentar de novo".
- `findActiveByDriver` e `publish` ficaram intactos.

**Sintaxe (§2).**
- A tela usa `@if`/`@else if`, `@for` com `track entry.route.id`, `@let`, `input.required`, `output`, `inject` e `signal` + `computed`.
- A busca segue `toObservable` → `switchMap` → `toSignal` (ID25), sem `subscribe()` em componente.
- A formatação passa pelo `I18nPluralPipe` e pelo `WeekdaysPipe`.
- Não há `standalone: true` nem `.css`. As cores vêm só dos tokens.
- O padrão do contador `attempts` com `startWith(undefined)` é o mesmo do `RouteDetail`: é coerente, e não uma abstração nova.

**Rotas.** Em `driver.routes.ts`, `''` vem antes de `nova` e funciona: um caminho vazio sem filhas só casa quando não sobra segmento. Os testes do `route-form` continuam passando.

**Testes (fatos 3, 4 e 6).**
- `isActiveRoutesSearch` confere a busca pelos nomes `driverId` e `status` nos dois specs. O `ACTIVE_ROUTES_URL` antigo continua lá, usado pelos testes antigos.
- `DeferBlockBehavior.Manual` está ligado e comentado.
- O toque no cartão responde o GET `/fixed_routes/rota-do-batel` e os câmpus, e confere o título "Curitiba → Batel".
- "Tentar de novo" prova que uma busca nova sai e que ela pode dar certo.
- O teste de carregamento prova que o aviso continua entre a primeira e a segunda resposta.
- O `httpTesting.verify()` está no `afterEach`.

## Sugestões (não bloqueiam)
1. **O conteúdo do cartão é lido pela posição dos filhos diretos** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/driver/my-routes/my-routes.spec.ts:155-158`, `Array.from(card.children)`).
   - O `toEqual(TWO_CARDS)` (linhas 184 e 267) depende de cada dado ser um `<span>` filho direto do `<button>`.
   - Embrulhar dia e horário numa linha (`<div>`), por exemplo, quebra os dois testes sem mudar nada do que a pessoa lê.
   - O `route-detail.spec.ts` lê pelo rótulo (`dt`/`dd`), que é um contrato mais estável.
   - Saída barata: comparar o `textContent` do cartão com os espaços normalizados ("Centro → Guarapuava seg, qua e sex 07:30 3 vagas"), ou conferir peça por peça com `toContain`.
2. **O sentido e o "vaga/vagas" agora existem em duas features.**
   - As cópias novas são `/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/features/driver/my-routes/route-card/route-card.html:4-5,11,14` e `route-card.ts:27`.
   - As originais são `features/search/route-detail/route-detail.html:11-13,34` e `route-detail.ts:50`.
   - Não aponto porque o fato 8 decidiu assim. Registro o risco: o §3 já prevê o `route-plate` em `shared/ui/` exatamente para esse caso ("route-plate na busca, no detalhe e em minhas rotas").
   - A US05 (#5) tende a criar a terceira cópia. Uma mudança na regra do sentido teria de ser repetida em cada tela, e nenhum teste confere uma cópia contra a outra.
   - Saída: Issue de manutenção antes da #5, com o `route-plate` e talvez um pipe de vagas em `shared/pipes/`.
3. **`findActiveByDriver` continua público e deixa o erro passar, ao lado do `lookupActiveByDriver`** (`/home/guibondezan/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts:147-153`).
   - O `plan.md` o lista como o método da lista. A próxima tela que precisar das rotas do motorista (US11/US12) tende a escolher esse nome, que é o mais natural, e repetir o defeito da #23.
   - O fato 2 manteve o método intacto, então fica para depois. A saída é de uma linha: um comentário dizendo que ele termina em erro e serve ao `publish` e ao `lookupActiveByDriver`.
4. **Os câmpus são buscados mesmo quando o motorista não tem rota** (`fixed-routes.service.ts:160-166`).
   - O teste da lista vazia exige esse GET (`my-routes.spec.ts:209`, via `answerWithRoutes([])`). O custo é um GET de 13 itens. Mas, se alguém cortar essa busca desnecessária, o teste quebra por um detalhe que a pessoa não vê.
   - No mesmo arquivo, `toActiveRoutesLookup` (linhas 108-118) repete o `campuses.find(...)` de `toFoundLookup` (linhas 101-104). A regra "campus ausente = `failed`" está escrita duas vezes. O prejuízo é pequeno, porque as duas mudam juntas na E3.

## Observações fora do escopo deste diff
- **O destaque duplo do menu (fato 7) tem um efeito a mais.** Em `/minhas-rotas/nova`, "Minhas rotas" e "Publicar uma rota fixa" ficam os dois com `aria-current="page"`, porque `core/layout/side-nav/side-nav.html:9-10` não usa `routerLinkActiveOptions` exato. O leitor de tela anuncia duas "página atual". Vale incluir isso na Issue candidata.
- **A caixa de erro tem agora 5 cópias:** 2 em `route-form.html` e 1 em cada um destes: `route-detail.html`, `my-routes.html` e `sign-up.html`. O par "aviso de falha + Tentar de novo" ficou idêntico, com as mesmas classes, em `route-detail.html:73-83` e `my-routes.html:6-15`. Entra na manutenção do `Banner` decidida na Tarefa 5, que pode absorver o par inteiro.
- **Os ajudantes de teste repetidos cresceram:**
  - `tap`, `heading` e `alertText` estão em 5 specs;
  - `CAMPUSES` e `answerCampuses` estão em `route-detail.spec.ts` e `my-routes.spec.ts`;
  - `isActiveRoutesSearch` está em 2 specs;
  - `DeferBlockBehavior.Manual` já está em 3 specs, como a sugestão 5 da Tarefa 9 previa.

  Tudo isso entra na manutenção dos ajudantes registrada na Tarefa 1.
- **Mapa de componentes do §3:** o `app-route-card` não está na lista de `features/driver`. Entra na ratificação do §3 no fechamento da história, junto com `segmented-control`, `weekday-picker`, `trip-list` e a decisão sobre o `route-plate` (sugestão 2).
- **O CA17 ainda sai pelo link de cadastro.** A decisão da Tarefa 1 deixou aberto ("pode usá-lo") que a saída do CA17 passasse a usar o link "Minhas rotas" quando ele existisse. Ela continua saindo por "Criar conta" (`route-form.spec.ts:358`). É opcional; registro só para o orquestrador saber que não foi feito.

Processo: usei o shell só para ler e para checar. As leituras foram `git diff`, `git status`, `grep`, `cat`, `sed -n` e `ls`. As checagens foram `npm test`, `npm run lint` e `prettier --check`, que só confere. Nenhum arquivo foi alterado. O `specs/4-publicar-rota-fixa/reviews/tarefa-10-conformidade-r1.md`, que aparece não rastreado no `git status`, não é meu.
