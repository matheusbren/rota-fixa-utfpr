# Parecer de Código — Tarefa 6

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no working tree:
- `npm test`: 14 arquivos, 140 de 140 testes passando. São 6 a mais que na Tarefa 5:
  - 1 no `auth.service.spec.ts`;
  - 1 no `fixed-routes.service.spec.ts`, que é novo;
  - 2 no `route-form.spec.ts`;
  - 2 no `route-detail.spec.ts`.
- `npm run lint`: "All files pass linting". A saída só apareceu com `rtk proxy`.
- `npx prettier --check` nos 10 arquivos do diff, um comando que só confere e não grava: todos seguem o `.prettierrc` (§2.3).

Conferi o diff inteiro (`git diff fd1053b`) contra o `docs/architecture.md` (§2, §2.1, §3, §4 e §5.1) e a `.agents/rules/01-angular-strict-rules.md`. São 10 arquivos, exatamente os "Arquivos previstos" da tarefa.

- **Estado compartilhado no `AuthService` (§2.1, ID15)** (`auth.service.ts:21-24`):
  - Há um `signal` privado, exposto com `asReadonly()`, e nada fora do Service consegue trocá-lo. É a forma que o §2.1 descreve, e o exemplo dele é justamente "a sessão no `AuthService`".
  - O valor fixo `sample-user` é o id do `db.json` e tem um `// TODO #2` com o motivo, como pede o "Assume que" da spec.
  - O `FixedRoutesService` não lê o `AuthService`: quem entrega o `driverId` é a tela (`route-form.ts:203`), como o plano decidiu.
  - O teste `not.toHaveProperty('set')` confere o contrato, não a implementação. Ele continua passando se o signal virar `computed()` na US02.
- **O padrão de envio** (`route-form.ts:149-168`):
  - É o mesmo do `sign-up.ts`: signal do envio → `toObservable` → `filter` → `exhaustMap` com `startWith(undefined)` → `toSignal`, e o "Publicando…" sai de um `computed`. O componente não tem `subscribe()`.
  - O `submitting` continua `true` depois do `published`, e isso está certo. Quando a resposta chega, o `exhaustMap` volta a aceitar envio novo, e daí em diante só o `[disabled]` impede a segunda rota.
  - O teste do CA10 prova justamente essa janela (`route-form.spec.ts:817-827`). Ele também confere o rótulo no mesmo elemento do botão. Assim, um refactor que recriasse o botão quebraria o teste, em vez de deixar passar o toque num nó já fora da tela.
  - O botão usa as mesmas classes do `sign-up.html` e segue o estado "carregando" do `design-tokens.md:142`.
- **A falha do POST ainda não é tratada.** Hoje o `toSignal` relançaria o erro, como na #23. Isso é o CA11, da Tarefa 7. O comentário do `FixedRoutePublication` (`fixed-routes.service.ts:39-42`) já diz que a falha vai entrar como um membro da união, ou seja, convertida no Service, como manda o §2.1. Por isso o `publication` não deve repetir a #23.
- **Navegação feita num `effect()`** (`route-form.ts:185-190`):
  - O §2 manda usar `effect()` para efeito colateral, e o `effect()` aqui não escreve em signal nenhum.
  - Conferi no `@angular/router` 22.2.4: o `handleNavigationRequest` roda dentro de um `untracked` (`_router-chunk.mjs:3835`). Então o `effect()` não passa a depender dos signals internos do roteador e não dispara de novo: navega uma vez para cada `published`.
- **O input `publicada` lido da URL** (`route-detail.ts:23`):
  - O nome em português é obrigado por duas regras juntas. O §2 quer a URL que a pessoa vê em português. O `@angular-eslint/no-input-rename` está no `ts-recommended.js:19` e proíbe o `alias`. O comentário explica isso.
  - Sem o parâmetro na URL, o roteador escreve `undefined` no input, porque o padrão é `alwaysUndefined` (`_router-chunk.mjs:1727`). O `booleanAttribute` transforma isso em `false`, e o teste `route-detail.spec.ts:172` cobre esse caso.
  - Não há `ActivatedRoute` em lugar nenhum.
- **`publish` no Service** (`fixed-routes.service.ts:116-146`):
  - O registro tem o tipo `Omit<FixedRoute, 'id'>`, então o compilador exige os 12 campos.
  - O `createdAt` é gravado como no `UsersService.create`.
  - A resposta passa pelo mapeador `toFixedRoute`.
  - A URL vem do `environment`.
  - O `trim()` fica no Service, como o `normalizeEmail` da US01, e o spec do Service o protege para quando o Service for reescrito na E3.
- **Camadas (§3):**
  - `features/driver` importa só de `core/auth`, `core/data`, `core/models` e `shared`. `features/search` importa só o `Banner` de `shared/ui/`.
  - O `/rotas` aparece no `navigate` apenas como texto, sem importar nada de outra feature.
- **Sintaxe:**
  - O diff usa `inject()`, `signal`, `computed`, `effect`, `input` com `transform` e `@if`.
  - Não há `any`, `*ng…`, decorator `@Input`/`@Output` nem injeção pelo construtor.
  - O `direction` agora tem o tipo `FixedRouteDirection` (`route-form.ts:96`), como decidido em `tarefa-05-decisoes-r1.md`.
- **Testes:**
  - O `route-form.spec.ts` passou a subir o `appConfig.providers`, como o `route-detail.spec.ts` já fazia.
  - O `fixed-routes.service.spec.ts` usa `vi.setSystemTime` sem fake timers. Conferi no Vitest 5.1 (`dist/chunks/index.CZzC1gGg.js:6628-6636` e `:6672-6688`): só o `Date` é trocado, e o `useRealTimers()` o restaura. O relógio parado não vaza para outro spec.
- **Processo:**
  - O shell foi usado só para ler e conferir: `git status`, `git log` e `git diff`; `cat`, `sed` e `grep`, inclusive no `node_modules` do router, do Vitest e do angular-eslint. Rodei também `npm test`, `npm run lint` e `prettier --check`.
  - Nenhum arquivo foi alterado.

## Sugestões (não bloqueiam)
1. **O `?publicada=1` fica na URL depois que o aviso já foi dado** (`route-form.ts:188`, `route-detail.ts:23`).
   - O aviso volta a cada recarregar, a cada "voltar" do histórico e em todo link copiado da barra de endereço.
   - Um motorista que copia o endereço para mandar no grupo, que é o costume que o app quer substituir, faz quem recebe ver "Rota publicada" sobre uma rota que essa pessoa não publicou.
   - Detalhe menor: `booleanAttribute('0')` dá `true`.
   - Foi o plano que decidiu levar o aviso como `input()` vindo da URL. Por isso cabe à triagem escolher:
     - aceitar e registrar a consequência;
     - ou fazer a tela guardar o aviso num signal e tirar o parâmetro com `replaceUrl`.
2. **Registrar no fechamento a exceção ao §2 que este input cria.**
   - O parâmetro de consulta que chega como `input()` precisa ter o nome da URL, e portanto em português, porque o lint proíbe o `alias`.
   - Os filtros da busca (US05) vão cair no mesmo caso. Com a regra escrita no §4, o próximo implementador não precisa descobrir tudo de novo.
3. **O botão fica preso em "Publicando…" se a navegação não terminar** (`route-form.ts:188`).
   - A promessa do `navigate` é ignorada. Isso tem efeito em dois casos:
     - o pedaço da tela da rota (`search.routes`) não baixa, porque a conexão cai naquele instante ou é a primeira visita antes do service worker;
     - outra navegação interrompe essa.
   - No primeiro caso, o roteador rejeita a promessa (`_router-chunk.mjs:4098-4101`). Nos dois, o `submitting` fica `true` para sempre: a rota já está gravada, e a pessoa não vê mensagem nenhuma.
   - Se ela recarregar a página e publicar de novo, grava uma rota repetida. A partir da Tarefa 8, isso vira um aviso de conflito com a própria rota.
   - A chance é pequena. Mas a spec não tem texto para esse caso, então o destino é a triagem: aceitar ou abrir Issue.
4. **O teste do CA9 no `route-form.spec.ts` confere de novo a lista de dados da tela da rota** (`:290-297` e `:791-798`).
   - Os dados que aparecem são o eco que o servidor falso devolve do corpo do POST. Por isso, aqui eles não provam nada além do que o `route-detail.spec.ts:161-169` já prova.
   - A prova de "os dados que informei" é o corpo do POST (`:769-782`).
   - O custo é que um spec de `driver` fica preso à marcação (`dl`/`dt`) de `search`. A Tarefa 9 vai mexer no `route-detail.html`, e qualquer mudança na lista quebra os dois specs.
   - Basta manter a URL e o "Rota publicada".

## Observações fora do escopo deste diff
- **O §5.1 ("Geração de viagens", `architecture.md:493-495`) diz que, na E2, o `FixedRouteService` cria as viagens ao publicar.** O `publish` deste diff segue a spec ("Assume que", #6) e não cria. A conformidade da Tarefa 5 já sugeriu alinhar o §5.1 no fechamento. Agora existe o método exato onde a frase deixou de valer.
- **O §6 precisa, no fechamento, da linha de `/minhas-rotas/nova`** (`driver` · `FixedRoutesService`, `CampusesService`, `PostalCodeService` e `AuthService` · US04), além da linha de `/rotas/:routeId` já apontada na Tarefa 5.

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/route-detail.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts
