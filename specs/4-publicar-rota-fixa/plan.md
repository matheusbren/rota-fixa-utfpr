# Plano — Issue #4

## Decisões técnicas

- **Rotas novas**, filhas da casca (`AppShell`), carregadas só quando a pessoa entra
  nelas (`loadChildren`), como no mapa do `architecture.md` §4:
  - `features/driver/driver.routes.ts`: `/minhas-rotas` (`my-routes`) e
    `/minhas-rotas/nova` (`route-form`);
  - `features/search/search.routes.ts`: `/rotas/:routeId` (`route-detail`).
- **`app.config.ts`** ganha `withComponentInputBinding()` no `provideRouter` (o
  `routeId` e o aviso `publicada` chegam à tela como `input()`, sem
  `ActivatedRoute`), e o `LOCALE_ID` `pt-BR` com `registerLocaleData`, para o
  `DatePipe` escrever "qua., 25/11".
- **Modelos** (`core/models/`): `Campus` (`id`, `name`, `city`) e `FixedRoute` com os
  campos do §5.1 (`direction` é `to_campus` | `from_campus`, `weekdays` é a lista ISO
  1–7, `departureTime` é `"07:30"`, `status` é `active` | `closed`,
  `suggestedFareCents` e `closedAt` gravados como `null`).
- **Services** (`core/data/`), os únicos que conhecem URL:
  - `CampusesService.list()` — GET `/campuses`;
  - `FixedRoutesService` — `findById(id)`, `findActiveByDriver(driverId)` (GET
    `/fixed_routes?driverId=…&status=active`) e `publish(data)`, que confere o
    conflito antes de gravar e devolve um resultado só (`published` com a rota,
    `conflict` com a rota que conflita, ou `failed`), como o `signUp` da US01;
  - `PostalCodeService.lookup(cep)` — GET `https://viacep.com.br/ws/<cep>/json/`;
    devolve o bairro, ou `not-found` quando o ViaCEP responde `{ "erro": "true" }`.
    A falha de rede chega como erro do `Observable`, e a tela a traduz (CA8).
- **Quem publica:** o `AuthService` ganha `currentUserId`, um signal somente leitura
  com o id da pessoa de exemplo do `db.json` (`// TODO #2`). O `FixedRoutesService`
  não sabe de onde vem o id: quem chama o entrega.
- **Regras puras**, testadas sem tela (ID33):
  - `findConflict(nova, minhasAtivas)` ao lado do `FixedRoutesService`: mesmo dia
    da semana e menos de 60 minutos entre as saídas (CA12);
  - `upcomingTrips(rota, agora, semanas)` ao lado do `route-detail`: as datas e
    horas das viagens a partir de agora, sem as que já passaram (RN18, CA15).
- **Validadores** (`shared/validators/`): `trimmedRequired` e
  `trimmedMinLength(n)` (bairro e ponto de encontro), `weekdaysCount(1, 5)` e
  `postalCode` (8 números, com ou sem traço). As vagas usam os prontos do Angular
  (`required`, `min(1)`, `max(4)`) mais um de número inteiro.
- **Componentes** de `shared/ui/` (sem Service): `weekday-picker` (os dias de
  segunda a sábado; um `ControlValueAccessor`, para o campo continuar no formulário
  reativo) e `segmented-control` ("Esta semana" | "4 semanas", com `model()` — o
  pai liga com `[(value)]`, ID12).
- **Pipe** `weekdays` (`shared/pipes/`): `[1, 3, 5]` → "seg, qua e sex".
- **Na tela de publicar:** o resultado do CEP vira signal (`toSignal` sobre
  `toObservable`, com `switchMap`), e um `effect()` escreve o bairro achado no campo
  Bairro (ID13). O envio segue o padrão da US01: signal do envio, `exhaustMap`,
  `toSignal` do resultado, `computed` do "Publicando…".
- **Na tela da rota:** a lista de "Próximas viagens" fica dentro de um
  `@defer (on viewport)`, com um `@placeholder` (ID9); o recorte da semana é um
  `computed` sobre o signal do `segmented-control` (ID10).
- **Minhas rotas:** o cartão `route-card` mora em `features/driver/my-routes/`
  (conhece o domínio), recebe a rota por `input()` e avisa o toque por `output()`
  (ID14). A lista e o formulário usam o mesmo `FixedRoutesService` (ID15).
- **Contrato com o json-server** (`db.json`): as chaves `campuses` (os 13 câmpus
  da UTFPR), `fixed_routes` (vazia) e a pessoa de exemplo em `users`. As rotas
  criadas testando pela tela não entram em commit (`git restore db.json`).

## Tarefas

- [x] **Tarefa 1 — Abrir a tela de publicar com o botão desligado**
  - Cobre: CA1, CA17
  - Teste primeiro: `route-form.spec.ts` acha os oito campos pelo rótulo, os 13
    câmpus vindos do GET `/campuses`, "Vou para o campus" marcado, nenhuma
    mensagem e o botão desligado; e, saindo e voltando à tela, o formulário vem em
    branco sem nenhum POST. Falha porque a rota e a tela não existem.
  - Arquivos previstos: `app.routes.ts`, `features/driver/driver.routes.ts`,
    `features/driver/route-form/route-form.{ts,html,spec.ts}`,
    `core/models/campus.ts`, `core/data/campuses.service.ts`,
    `core/layout/app-shell/app-shell.ts` (link do menu), `db.json`

- [x] **Tarefa 2 — Recusar campus, bairro e ponto de encontro inválidos**
  - Cobre: CA2, CA3, CA4
  - Teste primeiro: para cada regra, um teste que aceita e um que recusa (campus
    vazio; bairro vazio, só espaços, com 2 e com 3 caracteres; ponto de encontro
    vazio, com 4 e com 5), conferindo o texto da mensagem e o botão. Falha porque
    os campos ainda não têm regra.
  - Arquivos previstos: `shared/validators/trimmed.{ts,spec.ts}`,
    `route-form.{ts,html,spec.ts}`

- [x] **Tarefa 3 — Recusar dias, horário e vagas fora das regras**
  - Cobre: CA5, CA6, CA7
  - Teste primeiro: nenhum dia e seis dias recusam, um e cinco aceitam; horário
    vazio recusa; vagas vazio, 0, 5 e 2,5 recusam, 1 e 4 aceitam. Falha porque o
    seletor de dias e as regras não existem.
  - Arquivos previstos: `shared/ui/weekday-picker/`,
    `shared/validators/weekdays-count.{ts,spec.ts}`, `route-form.{ts,html,spec.ts}`

- [x] **Tarefa 4 — Preencher o bairro pelo CEP**
  - Cobre: CA8
  - Teste primeiro: o teste faz o papel do ViaCEP — CEP que existe preenche o
    Bairro; formato errado mostra "O CEP tem 8 números" e desliga o botão; `erro`
    mostra "Não achamos este CEP…"; falha de rede mostra "Não deu para buscar o
    CEP agora…" sem bloquear o botão. Falha porque o `PostalCodeService` não
    existe.
  - Arquivos previstos: `core/data/postal-code.service.{ts,spec.ts}`,
    `shared/validators/postal-code.{ts,spec.ts}`, `route-form.{ts,html,spec.ts}`

- [x] **Tarefa 5 — Mostrar a rota pelo id da URL**
  - Cobre: CA13, CA14
  - Teste primeiro: `route-detail.spec.ts` entrega o `routeId` como input e faz o
    papel do servidor: rota que existe mostra campus, sentido, ponto de encontro,
    "seg, qua e sex", "07:30" e "3 vagas"; 404 mostra "Não achamos esta rota";
    falha mostra a mensagem e "Tentar de novo" busca outra vez. E o teste do pipe
    `weekdays`. Falha porque a tela, a rota e o pipe não existem.
  - Arquivos previstos: `app.config.ts`, `app.routes.ts`,
    `features/search/search.routes.ts`,
    `features/search/route-detail/route-detail.{ts,html,spec.ts}`,
    `core/models/fixed-route.ts`, `core/data/fixed-routes.service.ts`,
    `shared/pipes/weekdays.pipe.{ts,spec.ts}`

- [x] **Tarefa 6 — Publicar a rota e ir para a tela dela, sem gravar duas vezes**
  - Cobre: CA9, CA10
  - Teste primeiro: com o formulário válido, o POST para `/fixed_routes` leva os
    campos, `status: active` e o `driverId` da pessoa de exemplo; o botão mostra
    "Publicando…" bloqueado e um segundo toque não faz outro POST; com a resposta,
    a URL vira `/rotas/<id>` e a tela mostra "Rota publicada". Falha porque o envio
    não existe.
  - Arquivos previstos: `core/auth/auth.service.{ts,spec.ts}`,
    `core/data/fixed-routes.service.{ts,spec.ts}`, `route-form.{ts,html,spec.ts}`,
    `route-detail.{ts,html,spec.ts}`

- [x] **Tarefa 7 — Avisar a falha do envio sem perder o que foi digitado**
  - Cobre: CA11
  - Teste primeiro: o servidor responde erro (e falha de rede): aparece "Não foi
    possível publicar a rota. Tente de novo.", os campos têm os mesmos valores, o
    botão liga de novo e o segundo toque faz um novo POST. Falha porque o erro não
    é tratado.
  - Arquivos previstos: `core/data/fixed-routes.service.ts`,
    `route-form.{ts,html,spec.ts}`

- [x] **Tarefa 8 — Recusar a rota que coincide com outra minha**
  - Cobre: CA12
  - Teste primeiro: `findConflict` recusa o mesmo dia com 59 minutos de diferença e
    aceita com 60, e aceita dias diferentes no mesmo horário; na tela, com uma rota
    ativa que conflita, aparece "Esta rota coincide com a sua rota de Centro (seg,
    qua e sex às 07:30)" e nenhum POST é feito. Falha porque a conferência não
    existe.
  - Arquivos previstos: `core/data/find-conflict.{ts,spec.ts}`,
    `core/data/fixed-routes.service.{ts,spec.ts}`, `route-form.{ts,html,spec.ts}`

- [x] **Tarefa 9 — Listar as próximas viagens da rota**
  - Cobre: CA15
  - Teste primeiro: `upcomingTrips` com o relógio parado numa quarta às 08:00 —
    a viagem das 07:30 de hoje fica de fora, a das 07:30 de sexta entra, e 4
    semanas de seg/qua/sex dão 12 viagens (menos as que passaram); na tela,
    "Esta semana" mostra "sex., 27/11 às 07:30", "4 semanas" mostra todas, e a
    semana sem viagem mostra "Nenhuma viagem nesta semana". Falha porque a função,
    o `segmented-control` e o bloco não existem.
  - Arquivos previstos: `features/search/route-detail/upcoming-trips.{ts,spec.ts}`,
    `shared/ui/segmented-control/`, `route-detail.{ts,html,spec.ts}`

- [x] **Tarefa 10 — Listar as minhas rotas ativas**
  - Cobre: CA16
  - Teste primeiro: `my-routes.spec.ts` faz o papel do servidor — duas rotas viram
    dois cartões, e tocar num leva a `/rotas/<id>`; lista vazia mostra "Você ainda
    não publicou nenhuma rota" e o link; falha mostra a mensagem e "Tentar de
    novo"; enquanto espera, "Carregando as suas rotas…". Falha porque a tela e o
    cartão não existem.
  - Arquivos previstos: `features/driver/driver.routes.ts`,
    `features/driver/my-routes/my-routes.{ts,html,spec.ts}`,
    `features/driver/my-routes/route-card/route-card.{ts,html}`,
    `core/layout/app-shell/app-shell.ts` (link do menu)

- [ ] **Tarefa 11 — Declarar a dívida no código e alinhar o architecture.md à tela da rota**
  - Cobre: as três pendências da primeira auditoria final, sem mudar comportamento, e
    três ajustes não bloqueantes que ela apontou no texto do fechamento.
    (a) Cada premissa do "Assume que" da spec que ainda não tem marca ganha o
    `TODO #<n>` da Issue que a fecha, no ponto do código que ela afeta (`<!-- TODO #n -->`
    no HTML): **#3** no envio do `route-form.ts` (nada confere o veículo, RN02, antes de
    publicar); **#20** no `FixedRoutesService`, onde a coleção `fixed_routes` é lida e o
    conflito é conferido antes do POST (na E3 a conferência vai para o banco); **#6** no
    `computed` das viagens do `route-detail.ts` (as viagens passam a ser gravadas em
    `trips` com a assinatura); **#5** no ponto de encontro do `route-detail.html` (fica
    escondido de quem não tem vaga, RN17, quando a busca levar outras pessoas à tela).
    (b) `architecture.md` §5.1, "Geração de viagens (RN18)": na E2 as viagens não são
    gravadas; a tela da rota as calcula a partir dos dias e do horário (a função pura
    `upcomingTrips`), e a gravação em `trips` nasce com a assinatura (US07, #6); na E3 a
    geração vai para uma função no banco, agendada. O nome do Service é
    `FixedRoutesService`.
    (c) `architecture.md` §4: na linha `/rotas/:routeId`, a coluna Resolver vira "—",
    porque a própria tela trata a rota que não existe ("Não achamos esta rota" e o link
    "Minhas rotas") e a falha (CA14); o texto sobre resolvers passa a valer para as telas
    que precisam do dado para abrir (a edição da rota e o embarque).
    (d) `architecture.md` §3, na nota sobre a US04: o `weekday-picker` e o
    `segmented-control` moram em `shared/ui/` desde o primeiro uso, decidido no plano,
    porque não conhecem domínio nenhum (recebem opções e devolvem um valor); o
    `trip-list` ainda não nasceu (a lista de viagens é um `<ul>` na tela da rota). No
    §6, a linha `driver` cita também o `AuthService` (a pessoa da sessão).
    A versão do `architecture.md` sobe para 1.2.1, com linha no histórico.
  - Teste primeiro: não há. A tarefa só acrescenta comentários e muda documentação; a
    prova é a suíte, o lint e o build continuarem verdes, o `grep` achar `TODO #3`,
    `TODO #5` e `TODO #6` em `apps/` e `TODO #20` no `fixed-routes.service.ts`, e o
    `grep FixedRouteService` não achar mais nada no `architecture.md`.
  - Arquivos previstos: `features/driver/route-form/route-form.ts`,
    `core/data/fixed-routes.service.ts`, `features/search/route-detail/route-detail.{ts,html}`,
    `docs/architecture.md`

## Critérios sem tarefa

-
