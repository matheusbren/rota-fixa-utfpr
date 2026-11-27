# Parecer de Conformidade — Tarefa 11

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| "Assume que", premissa #2: a pessoa de exemplo fixa, lida pelo `AuthService`. A marca já existia antes desta tarefa. | atendido | `apps/web/src/app/core/auth/auth.service.ts:18` |
| "Assume que", premissa #3: "nada confere a RN02 antes de publicar". Ganhou `TODO #3` no envio (`submit()`). | atendido | `apps/web/src/app/features/driver/route-form/route-form.ts:198` |
| "Assume que", premissa #20: as rotas vêm da coleção `fixed_routes` e o conflito "é feito pelo Service antes de gravar, e não pelo banco". Ganhou `TODO #20` em cima do `publish()`, que lê as rotas ativas e confere o conflito antes do POST. | atendido | `apps/web/src/app/core/data/fixed-routes.service.ts:179` |
| "Assume que", premissa #6: as viagens são "calculadas na tela da rota [...] e não gravadas na coleção `trips`". Ganhou `TODO #6` no `computed` das viagens. | atendido | `apps/web/src/app/features/search/route-detail/route-detail.ts:64` |
| "Assume que", premissa #5: o ponto de encontro "passa a ser escondido de quem não tem vaga (RN17)". Ganhou `<!-- TODO #5 -->` no bloco do ponto de encontro. | atendido | `apps/web/src/app/features/search/route-detail/route-detail.html:20` |
| Plano (b): o `architecture.md` §5.1 não diz mais que o Service grava as viagens ao publicar. Agora diz que elas são calculadas na tela (`upcomingTrips`) e gravadas a partir da assinatura (US07, #6). O `gh` confirma que a #6 é a US07. O nome agora é `FixedRoutesService`. | atendido | `docs/architecture.md:525-529` |
| CA14 refletido no `architecture.md` §4: a coluna Resolver da linha `/rotas/:routeId` virou "—". O texto restringe o resolver à edição e ao embarque e diz que a tela trata sozinha "Não achamos esta rota", o link "Minhas rotas" e a falha. O código confere: o `search.routes.ts` não tem resolver. | atendido | `docs/architecture.md:433`, `docs/architecture.md:454-459` |
| CA14 continua igual (a tarefa não muda comportamento): não achou mostra o título e o link; a falha mostra a mensagem e "Tentar de novo". Os testes passam. | atendido | `apps/web/src/app/features/search/route-detail/route-detail.html:69-88`, `route-detail.spec.ts:239`, `route-detail.spec.ts:284` |
| Plano (d), §3: o `weekday-picker` e o `segmented-control` ficam em `shared/ui/` desde o primeiro uso. O `trip-list` ainda não existe (`<ul>` na tela). O texto bate com o código: `options` em `input()` e `value` em `model()`. | atendido | `docs/architecture.md:374-387` |
| Plano (d), §6: a linha `driver` cita o `AuthService`. O `my-routes.ts` e o `route-form.ts` usam esse Service. | atendido | `docs/architecture.md:724` |
| Versão 1.2.1, com linha no histórico | atendido | `docs/architecture.md:4`, `docs/architecture.md:740` |
| "Sem mudar comportamento": o diff de `apps/` só tem comentários. Os arquivos alterados são exatamente os de "Arquivos previstos". | atendido | `git diff HEAD -- apps/ docs/` |
| "Teste primeiro", buscas no código: `TODO #3`, `#5` e `#6` aparecem em `apps/`, `TODO #20` aparece no `fixed-routes.service.ts`, e `FixedRouteService` dá 0 resultados no `architecture.md` | atendido | `grep` em `apps/` e em `docs/architecture.md` |
| "Teste primeiro", suíte e lint verdes: 17 arquivos e 184 testes passaram; o lint diz "All files pass linting." O build não foi rodado, porque grava em `dist/` e esta revisão é somente leitura. | atendido | `npm test -- --watch=false`, `ng lint` |

## Apontamentos
