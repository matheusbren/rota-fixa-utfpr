# Parecer de Código — Tarefa 5

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no working tree:
- `npm test`: 13 arquivos, 134 de 134 testes passando. São 13 a mais que na Tarefa 4:
  - 7 no `route-detail.spec.ts`, que é novo;
  - 6 no `weekdays.pipe.spec.ts`, que é novo.
- `npm run lint`: "All files pass linting". A saída só apareceu com `rtk proxy`.
- `npx prettier --check` nos arquivos do diff, um comando que só confere e não grava: todos seguem o `.prettierrc` (§2.3).

Conferi o diff inteiro (`git diff 6fde1b2`) contra o `docs/architecture.md` (§2, §2.1, §2.2, §3, §4 e §5.1) e a `.agents/rules/01-angular-strict-rules.md`. São 10 arquivos, exatamente os previstos na tarefa.

- **`withComponentInputBinding()` + `input.required` (ID16/ID17):**
  - `app.config.ts:23` tem `provideRouter(routes, withComponentInputBinding())`, que é o texto do §4. `route-detail.ts:17` tem `routeId = input.required<string>()`, que é o exemplo do próprio §4, com o mesmo nome do `:routeId` de `search.routes.ts`.
  - Nenhum `ActivatedRoute` em `features/` nem em `shared/`.
  - O spec sobe a configuração real (`...appConfig.providers`, `route-detail.spec.ts:55`) e abre a URL pelo `RouterTestingHarness`. Sem o `withComponentInputBinding()`, ler `routeId()` lança NG0950 e o teste quebra. Ou seja, o ID17 é provado pelo roteador, e não por um `setInput` feito à mão.
  - O efeito vale para o app todo. Conferi no `@angular/router` 22.2.4 (`_router-chunk.mjs:1727-1736`): o padrão é `alwaysUndefined`, e o roteador escreve em todo `input()` do componente de rota. Dos componentes de rota (`AppShell`, `SignUp`, `RouteForm` e `RouteDetail`), só o `RouteDetail` tem `input()`. O `SideNav` e o `FormField` têm, mas não são de rota. Então nenhuma tela que já existia é afetada.
  - Na junção, o parâmetro do caminho vem depois dos de consulta (`:1700-1703`). Por isso um `?routeId=` na URL não passa por cima do id do caminho.
- **A busca na tela** (`route-detail.ts:23-31`):
  - Usa `toObservable` de um `computed` com `switchMap`, que é o que o §2.1 pede para "um signal [que] precisa disparar uma busca". O resultado volta por `toSignal`, e o componente não tem `subscribe()`.
  - O contador de tentativas é o mesmo recurso do `resendRequests` do `sign-up.ts`. O `startWith(undefined)` zera a tela a cada busca, e o teste confere isso logo depois do toque.
  - O Service nunca devolve erro, então o `toSignal` nunca guarda um, o que evita o defeito da #23.
- **Pipe `weekdays` (ID8)** (`shared/pipes/weekdays.pipe.ts`):
  - Importa só de `@angular/core`, é puro e não injeta nada, como o §3 exige do `shared/`.
  - Ordena uma cópia (`[...weekdays].sort`) e não mexe na lista que recebe. Isso importa num pipe puro sobre um modelo guardado em signal. Agora a ordem na tela não depende de como os dias foram gravados.
  - Usa o `Intl.ListFormat` da plataforma, sem biblioteca, como o §2 pede ("Nenhuma biblioteca de datas"). O `'pt-BR'` escrito no pipe combina com os nomes em português do `SHORT_NAMES`: se ele lesse o `LOCALE_ID`, uma troca de idioma misturaria as duas línguas.
  - "1 vaga" e "3 vagas" saem do `i18nPlural` do Angular, sem criar um pipe novo para um caso só. Conferi o caso do zero: o `=1` vem antes da regra do idioma, e o 0, que em português cai em `one`, vai para `other` e vira "0 vagas".
- **Service que injeta outro Service** (`fixed-routes.service.ts:63`):
  - Nenhuma regra proíbe. O §6 já registra `AuthService → UsersService`, e cada Service continua sendo o único que conhece a própria URL: o `FixedRoutesService` não sabe o endereço de `/campuses`.
  - O mapeador `toFixedRoute` fica ao lado do Service, como o `toCampus`. O resultado `FixedRouteLookup` é exportado do mesmo jeito que o `SignUpResult` e o `PostalCodeLookup`.
  - Diferente da Tarefa 4, aqui é o Service que transforma a falha em resultado, como o §2.1 manda.
  - Os erros estão separados certo:
    - o `catchError` de dentro (`:74`) pega a falha da busca dos câmpus e a do mapeamento;
    - o de fora (`:77`) só vê o GET da rota, e só esse GET pode virar `not-found`;
    - o campus que não existe vira `failed`.
  - Nenhuma falha passa em silêncio: todas viram o aviso do CA14. O id vai por `encodeURIComponent`.
  - Sobre ter feito duas buscas, ver a sugestão 1.
- **Camadas (§3):**
  - A feature `search` importa só de `core/data/` e de `shared/pipes/`.
  - O link "Minhas rotas" aponta para a feature `driver` só como texto (`routerLink`), sem importar nada dela.
  - Nada em `core/` importa de `features/`.
- **Rotas (§3 e §4):**
  - `searchRoutes` é carregada por `loadChildren`, antes do filho `''` de auth, e o comentário foi atualizado. `/rotas/:routeId` é público, como no §4.
  - O `// TODO #2` do guard de `/minhas-rotas` (`app.routes.ts:13-14`) foi adotado pela triagem da Tarefa 1 e entrou aqui.
- **Modelo (§5.1):**
  - O `FixedRoute` tem os 13 campos do §5.1.
  - `direction` e `status` têm o tipo da união, e o `id` é string.
  - `suggestedFareCents` e `closedAt` aceitam `null`, como o plano diz.
- **Sintaxe:**
  - O diff usa `inject()`, `input.required`, `signal`, `computed`, `toSignal`/`toObservable`, `@let` e `@if`/`@else if`.
  - O `strictTemplates` vem ligado por padrão na linha 22 (`compiler-cli`, `strictTemplates !== false`). Por isso o tipo do `@let lookup` é estreitado dentro do `@if` e conferido na compilação.
  - Não há `any`, `*ng…`, `standalone: true`, decorator `@Input`/`@Output`, injeção pelo construtor nem `subscribe()` em componente.
- **Estilo (§2.2):**
  - Só tokens, todos presentes no `styles.css`: `text-title-1`, `text-label`, `text-text-muted`, `text-body-strong`, `text-time`, `rounded-lg`, `border-base-300`, `bg-base-100`, `bg-danger-soft`, `text-error`, `btn btn-primary` e `outline-focus`.
  - Não há `.css` por componente nem `style=`.
- **Testes:**
  - O `HttpTestingController` faz o papel do servidor, e os dois specs fecham com `verify()`.
  - O `verify()` também prova que um 404 não dispara a busca dos câmpus.
  - A tela é lida como a pessoa a lê:
    - o título é o `main h1`;
    - cada dado é o par `dt` → `dd`, como achar um campo pelo rótulo;
    - o aviso é o `role="alert"`;
    - os botões e links são achados pelo texto.
  - Nenhum teste lê signal do componente.
  - O `it.each` das quatro falhas termina sempre com "Tentar de novo" e uma busca nova. O `expectOne` quebra se o toque não buscar outra vez.
  - O pipe é testado direto, com 6 casos, inclusive com os dias fora de ordem.
- **Duas notas, sem prejuízo hoje:**
  - O `LOCALE_ID` entra antes do primeiro uso. Se ele e o `registerLocaleData` saírem juntos, nenhum teste desta tarefa quebra, porque o `i18nPlural` com `=1`/`other` dá o mesmo texto em inglês. É a Tarefa 9 (`DatePipe`, "qua., 25/11") que vai provar os dois. Entrar agora segue o plano, que pôs o `app.config.ts` nesta tarefa.
  - O comentário promete que um id novo cancela a busca do anterior (`switchMap`), e isso não tem teste. Hoje nenhum link do app leva de uma rota a outra.
- **Processo:**
  - O shell foi usado só para ler e conferir: `git status`, `git log` e `git diff`; `cat`, `sed`, `grep`, `ls` e `find`, inclusive no `node_modules` do router, do json-server e dos schematics; um `node -e` que só chama o `inflection`. Rodei também `npm test`, `npm run lint` e `prettier --check`.
  - Nenhum arquivo foi alterado.

## Sugestões (não bloqueiam)
1. **A rota e o campus vêm em duas buscas, e o §2 já declara o `_embed` do json-server para relação** (`core/data/fixed-routes.service.ts:63` e `:69-84`).
   - O §2 (Dados, E2) lista a "relação `_embed`" entre o que a linha 1 do json-server oferece.
     - Conferi no `node_modules/json-server/lib/service.js:13-24` e `:72-83` (beta.15): `GET /fixed_routes/<id>?_embed=campus` devolve a rota já com o objeto `campus`, achado pelo `campusId` na coleção `campuses`.
     - `inflection.singularize('campus')` dá `campus`, e o plural dá `campuses`.
     - Na E3, o Supabase faz o mesmo numa consulta só (`select=*,campus:campuses(*)`).
   - Hoje o `findById` faz duas requisições, uma depois da outra, e baixa a lista inteira dos câmpus para achar um. O comentário da linha 67 já diz que o certo é "uma consulta só".
   - É sugestão porque nenhuma regra é violada: Service injetar Service tem precedente no §6.
   - Vale decidir antes das Tarefas 8 e 10. O CA16 pede o sentido no cartão de "Minhas rotas" ("Bairro → Campus"), então o `findActiveByDriver` também vai precisar do nome do campus.
     - Do jeito atual, cada método novo repete o par `campuses.list()` + `find`, ou o `toFoundLookup` muda de forma.
     - Com o `_embed`, a junção vai para o mapeador, o lugar que o §2.1 reserva para "absorver a troca de fonte", e o `toCampus` pode ser exportado e reaproveitado.
   - Custo da troca no spec:
     - `answerRoute` e `answerCampuses` viram uma resposta só;
     - o caso "a busca do campus fica sem conexão" deixa de existir;
     - o caso "o campus da rota não existe" continua, porque o `_embed` devolve a rota sem `campus`.
2. **A caixa de erro foi copiada, e o plano ainda traz mais duas cópias** (`route-detail.html:41`, `sign-up.html:90-95`).
   - As classes são as mesmas nos dois lugares: `role="alert"` mais `rounded-md border border-error bg-danger-soft p-4 text-body text-error`.
   - O §3 põe `banner` em `shared/ui/` e diz: "se duas [features] precisam da mesma peça, ela sobe para `shared/`". O `Banner` que existe só faz o aviso de sucesso (`role="status"`, cores de sucesso).
   - A Tarefa 7 ("Não foi possível publicar a rota…") e a Tarefa 10 ("Não foi possível carregar as suas rotas…") vão trazer a terceira e a quarta cópia. Mudar a cara do aviso de erro no `design-tokens.md` vai exigir achar todas.
   - Um `input()` de tipo no `Banner` (`success` | `error`), que troca o papel e as cores, resolve e mantém o componente burro. A Tarefa 7 é um bom momento para isso.
3. **O nome do arquivo do pipe não é o que o gerador da linha 22 cria** (`shared/pipes/weekdays.pipe.ts`).
   - No `@schematics/angular` 22.2, o pipe vem com `typeSeparator: "-"` por padrão (`pipe/schema.json:65-70`). Então `ng g pipe shared/pipes/weekdays` cria `weekdays-pipe.ts`. A regra dos nomes diz "arquivos no padrão do gerador".
   - O diff segue o plano e a convenção `.service.ts` do repositório, que também não é a padrão do gerador: ele só põe `.service` com `--type=service`. O ponto é escolher uma convenção e registrá-la.
   - O `angular.json` tem `"schematics": {}`. Os próximos pipes do §3 (`fare` e `first-name`), gerados pelo CLI, vão nascer como `fare-pipe.ts`, ao lado de `weekdays.pipe.ts`.
   - Ratificar no §2.3, no fechamento da história, e gravar no `angular.json` (`"@schematics/angular:pipe": { "typeSeparator": "." }` e `"@schematics/angular:service": { "type": "service" }`). O outro caminho é renomear o arquivo.
4. **Uma decisão da triagem da Tarefa 1 não entrou** (`features/driver/route-form/route-form.ts:86`).
   - O `tarefa-01-decisoes-r1.md` diz: "`direction` sem o tipo do modelo: adotada na Tarefa 5, quando o `FixedRoute` nascer".
   - O tipo `FixedRouteDirection` nasceu (`fixed-route.ts:2`), mas o controle continua `direction: 'to_campus'`, ou seja, `FormControl<string>`. O `route-form.ts` não está na lista de arquivos desta tarefa, o que explica a ausência.
   - Prejuízo: na Tarefa 6, o `getRawValue()` entrega `direction: string`, que não cabe no `FixedRoute`. Isso vira um `as` no envio, ou a troca é feita lá.
   - Ou entra nesta tarefa, ou a decisão passa formalmente para a Tarefa 6, que já mexe no `route-form`.
5. **O comentário que cita a Tarefa 10 vai ficar falso** (`route-detail.html:34`).
   - Ele diz que "Minhas rotas" "nasce na Tarefa 10 desta história; até lá, o endereço cai na rota coringa".
   - O `route-detail.html` não está nos arquivos da Tarefa 10, então ninguém vai voltar para apagar a frase. Diferente dos `// TODO #<issue>`, que o auditor final procura, este comentário não tem marca nenhuma.

## Observações fora do escopo deste diff
- **O §6 precisa da linha desta tela no fechamento da história**, pela regra do próprio documento ("uma linha por história implementada"): `search` · `/rotas/:routeId` · — · `FixedRoutesService` (→ `CampusesService`) · US04.
- **As observações anteriores continuam valendo**, e o diff só segue os mesmos padrões:
  - o anel de foco se repete nos dois controles novos (`route-detail.html:35-39` e `:43-50`);
  - o mapa do §3 diverge do plano. A ratificação já está marcada para o fechamento.
