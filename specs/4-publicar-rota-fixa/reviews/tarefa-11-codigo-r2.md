# Parecer de Código — Tarefa 11

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum. Em `apps/` o diff só mexe em linhas de comentário: filtrei as linhas de `git diff HEAD -U0 -- apps/` que não são `//`, `<!--` ou `-->` e não sobrou nenhuma. Os cinco arquivos alterados são exatamente os de "Arquivos previstos". Conferi cada correção da triagem (`tarefa-11-decisoes-r1.md`) contra o código e contra o resto do documento:

- **A, `TODO #3`** (`apps/web/src/app/features/driver/route-form/route-form.ts:198-199`): aplicada como decidida.
  - A frase agora diz que a tela passa a convidar a cadastrar o veículo "em vez de mostrar o formulário (RN02, US03, architecture.md §4)".
  - Mantém o "até lá, nada confere o veículo antes de publicar".
  - A marca continua em cima do `submit()`.
  - Bate com o `architecture.md:435` ("sem veículo, a tela convida a cadastrar — US03") e com o 3º critério da US03 (`docs/prd.md:148-150`).
- **B, critério de `shared/ui/`**: aplicada.
  - A regra do §3 (`docs/architecture.md:359-364`) agora diz que também sobe a caixa "que não conhece domínio nenhum (um controle genérico, que recebe e devolve valores) [...] mesmo usada num domínio só".
  - A nota da US04 (`:376-379`) cita essa regra ("pela regra acima da caixa que não conhece domínio nenhum").
  - A coluna "Por quê" da linha `shared/ui/` (`:369`) também ganhou o segundo critério. A decisão não pede isso com todas as letras, mas é o mesmo defeito: o parecer da rodada 1 citava essa coluna como a segunda fonte do critério divergente. Sem essa mudança, o documento continuaria com dois critérios.
  - O texto bate com o código:
    - o `SegmentedControl` tem `options = input.required` e `value = model.required`, que é o "recebe as opções e devolve a escolhida";
    - o `WeekdayPicker` é `ControlValueAccessor` com `number[]` e não importa modelo de domínio;
    - cada um é usado por um domínio só (`route-detail` em `search`, `route-form` em `driver`), que é justamente o caso que a regra nova cobre.
  - O comentário da árvore (`:335`, "não conhece domínio") fica coerente com a regra.
- **C, resolvers no §4** (`docs/architecture.md:454-459`): aplicada.
  - O texto ficou "a própria tela trata a rota que não existe e a falha da busca (CA14 da US04)", sem o texto da tela.
  - O `grep "Não achamos"` não acha mais nada no `architecture.md`.
  - O `search.routes.ts` não tem resolver, e o `route-detail.html:69-88` trata `not-found` e `failed`.
  - A coluna Resolver de `/rotas/:routeId` (`:433`) é "—".
- **D, `TODO #6`** (`apps/web/src/app/features/search/route-detail/route-detail.ts:64-66`): aplicada.
  - A marca avisa que, quando as viagens forem gravadas em `trips`, o `upcomingTrips` sobe para `core/`, "porque o `core/` não importa de `features/` (architecture.md §3)". É a regra do `docs/architecture.md:355`.
  - O §5.1 (`:525-529`) continua com o texto que a rodada 1 aprovou, como a decisão manda: calculadas na tela pelo `upcomingTrips`, a partir da rota que o `FixedRoutesService` devolve, e gravação com a assinatura (US07, #6).
  - O código confere: `upcomingTrips(lookup.route, now, UPCOMING_WEEKS)` dentro do `computed`.
- **Nada além disso mudou.**
  - O `TODO #20` (`fixed-routes.service.ts:179-180`) e o `<!-- TODO #5 -->` (`route-detail.html:20-23`) seguem como a rodada 1 os descreveu.
  - A linha 1.2.1 do histórico (`docs/architecture.md:740`) foi reescrita para incluir o critério novo do §3, e a linha `driver` do §6 (`:724`) continua batendo com o `inject(AuthService)` do `my-routes.ts:16` e do `route-form.ts:84`.
  - O `grep FixedRouteService` continua dando 0 no `architecture.md`.

Verificação, da raiz:
- `npm test -- --watch=false`: 17 arquivos e 184 testes passando.
- `npm run lint`: o wrapper `rtk` do shell embaralhou a saída ("JSON parse failed"). Rodei o mesmo `ng lint` que o script chama (`npm run lint -w apps/web`) direto em `apps/web`: "All files pass linting.", saída 0.
- `npm run build`: concluído, saída 0. O `git status` continua só com os cinco arquivos do diff e os três pareceres da rodada 1.
- `prettier --check`: os quatro arquivos de `apps/` passam. O `docs/architecture.md` continua falhando.
  - Passei o arquivo do `HEAD` e o da árvore de trabalho pelo Prettier, sem gravar nada. Ele propõe mudar 16 trechos nos dois casos, quase todos tabelas.
  - Nenhum desses trechos cai nos parágrafos novos (`:359-364`, `:376-387`, `:454-459`, `:525-529`).

## Sugestões (não bloqueiam)
- Nenhuma.

## Observações fora do escopo deste diff
- O comentário da árvore do §3 diz que `shared/ui/` tem "componentes burros (só input()/output())" (`docs/architecture.md:336`, que este diff não tocou). A nota da US04 e o código mostram outras duas formas de ligar o valor: o `segmented-control` com `model()` e o `weekday-picker` com `ControlValueAccessor`. Um revisor que ler só a linha 336 pode reprovar o próximo campo de formulário de `shared/ui/` por não usar `input()`/`output()`. Candidata a Issue de manutenção: trocar por algo como "sem injetar Service; o valor entra e sai por `input()`/`output()`/`model()` ou `ControlValueAccessor`".
- O `docs/architecture.md` continua reprovado no `prettier --check`, com os mesmos trechos de antes da branch. Isso já está registrado em `tarefa-11-decisoes-r1.md` como candidata a Issue `chore`.
