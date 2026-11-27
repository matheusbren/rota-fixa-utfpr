# Parecer de Conformidade — Tarefa 7

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA11: "Dado o formulário válido, quando a gravação falha (sem conexão ou erro do servidor), então vejo 'Não foi possível publicar a rota. Tente de novo.' [...]" | atendido | **Código:** o `publish` termina com `catchError(() => of({ status: 'failed' }))` (`apps/web/src/app/core/data/fixed-routes.service.ts:148`), e a união `FixedRoutePublication` ganhou o membro `failed` (`fixed-routes.service.ts:39-43`). A tela mostra o texto exato da spec num `<p role="alert">` quando `publication()?.status === 'failed'` (`apps/web/src/app/features/driver/route-form/route-form.html:169-174`). Para isso, o `publication` passou a `protected` (`route-form.ts:151-158`). **Teste:** `route-form.spec.ts:842-866` usa um `it.each` com os dois casos da spec: falha de rede (`request.error(new ProgressEvent('error'))`) e erro do servidor (500). Os dois conferem o texto do alerta com `toBe` exato. `fixed-routes.service.spec.ts:84-106` cobre os mesmos dois casos no Service |
| CA11: "[...] todos os campos continuam preenchidos [...]" | atendido | **Código:** o caminho da falha não mexe no `form`. O único `effect` do envio só age em `published` (`route-form.ts:186-191`). **Teste:** o `fillInEveryField` (`route-form.spec.ts:586-597`) preenche os oito campos com valores diferentes dos da tela recém-aberta: sentido da volta, CEP, Bairro vindo do ViaCEP, ponto de encontro com espaços e três dias. O `formState()` (`:181-192`) lê os oito campos no DOM, antes do toque (`:854`) e depois da falha (`:868`), e os dois são comparados com `toEqual`. O corpo do segundo POST é igual ao do primeiro, tirando o `createdAt` (`:877`), o que prova que o modelo do formulário também ficou intacto. A URL continua `/minhas-rotas/nova` (`:867`) |
| CA11: "[...] e posso tocar em 'Publicar rota' de novo." | atendido | **Código:** `submitting` só fica ligado com `publication` indefinido ou `published`, então `failed` libera o botão (`route-form.ts:163-169`). O `catchError` fica dentro do `exhaustMap` (`route-form.ts:156` + `fixed-routes.service.ts:148`): o fluxo externo continua vivo e aceita o próximo envio. **Teste:** depois da falha, o botão diz "Publicar rota" e está ligado (`route-form.spec.ts:869-870`). O novo toque faz um novo POST (`:872-873`), que mostra "Publicando…" bloqueado (`:879-880`). Esse POST dá certo e leva a `/rotas/rota-nova?publicada=1` (`:882-887`) |
| Abandono no meio: "A conexão cai ou o servidor falha no envio. Sem tratamento, a pessoa toca, nada acontece e o que ela digitou some. Vira o CA11: mensagem clara, campos preservados e nova tentativa." | atendido | Os três pontos (mensagem, campos e nova tentativa) estão provados nas linhas acima, para a conexão que cai e para o servidor que falha (`route-form.spec.ts:842-848`) |
| docs/architecture.md §2.1: "Até ele [o `errorInterceptor`] nascer, o Service converte a falha no resultado que a tela espera" | atendido | A conversão fica no Service (`fixed-routes.service.ts:117-118`, `:148`), no mesmo padrão do `signUp` da US01 e do `plan.md:21-23` (`published` \| `conflict` \| `failed`). **Teste:** `fixed-routes.service.spec.ts:96-104` assina o `next` e o `error`. Confere que o `error` nunca é chamado (`failure` fica `undefined`) e que o resultado é `{ status: 'failed' }`, com `toEqual` exato |
| CA1 (Tarefa 1) | atendido | `route-form.spec.ts:309-321` passa |
| CA17 (Tarefa 1) | atendido | `route-form.spec.ts:323-346` passa. O `expectNoMessages()` (`:207-211`) procura `main [role="alert"]`, o mesmo seletor do novo aviso, então também prova que ele não aparece ao voltar. O `expectNone(isWrite)` (`:344`) continua lá |
| CA2, CA3 e CA4 (Tarefa 2) | atendido | `route-form.spec.ts:348-451` e `:560-568` passam |
| CA5, CA6 e CA7 (Tarefa 3) | atendido | `route-form.spec.ts:453-558` passam |
| CA8 (Tarefa 4) | atendido | `route-form.spec.ts:599-764` passam |
| CA9 (Tarefa 6) | atendido | `route-form.spec.ts:769-806` passa. Os passos de preenchimento viraram o `fillInEveryField`, sem nenhuma mudança: o trecho removido no diff é idêntico ao de `:586-597`. O `toEqual` exato do corpo (`:776-789`) não mudou. `fixed-routes.service.spec.ts:66-79` passa, agora com a constante `NEW_ROUTE`, que tem os mesmos valores de antes. `route-detail.spec.ts:159-178` passa |
| CA10 (Tarefa 6) | atendido | `route-form.spec.ts:808-837` passa sem mudança. A nova tentativa também mostra "Publicando…" bloqueado (`:879-880`) |
| CA13 e CA14 (Tarefa 5) | atendido | `route-detail.spec.ts:126-157` e `:180-244` passam. Nada em `features/search/` foi tocado |
| CA12: conflito com outra rota minha | fora desta tarefa | Tarefa 8 do `plan.md`. O comentário de `fixed-routes.service.ts:42-43` deixa registrado que o `conflict` entra depois como novo membro da união |
| CA15: próximas viagens | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16: Minhas rotas | fora desta tarefa | Tarefa 10 do `plan.md` |

**Testes:** o `npm test` passou com 14 arquivos e 144 de 144 testes. Na Tarefa 6 eram 14 arquivos e 140 testes. A saída detalhada do Vitest (`--reporters=verbose`) mostra os 4 testes novos aprovados:
- `fixed-routes.service.spec.ts`: "devolve a publicação que falhou, sem o erro técnico, quando a gravação fica sem conexão" e "[...] com erro do servidor";
- `route-form.spec.ts`: "avisa que não publicou a rota sem conexão, mantém os campos e grava de novo no novo toque" e "[...] com erro do servidor".

Nenhum teste está com `only`, `skip`, `todo`, `xit` ou `fit`. Os testes provam o que dizem:
- **O teste faz o papel do servidor:** a falha sai do `HttpTestingController`, com método e URL exatos. Nenhum Service é simulado. O `route-form.spec.ts` sobe o app com `appConfig.providers` (`:109-116`), e o `FixedRoutesService` que trata a falha é o de verdade.
- **Falha de rede de verdade:** o `request.error(new ProgressEvent('error'))` é o que o `HttpClient` entrega quando o navegador não recebe resposta (status 0). O 500 cobre o erro do servidor.
- **Sem requisição sobrando:** o `afterEach(() => httpTesting.verify())` dos dois specs recusa qualquer POST a mais. Por isso o `expectOne` da nova tentativa prova que houve exatamente um POST novo.

**Leituras adotadas (não são apontamentos):**
1. **O aviso some durante a nova tentativa** (`route-form.spec.ts:878`). A spec não diz isso, mas também não é comportamento novo. É o `startWith(undefined)` que já existia desde a Tarefa 6 (`route-form.ts:156`): ele zera o resultado no toque, e o aviso do envio anterior desaparece. Deixar "Não foi possível publicar a rota" na tela ao lado de "Publicando…" contradiria o CA10.
2. **O aviso continua na tela se a pessoa edita um campo depois da falha.** Ele só some no próximo envio. A spec não fala desse caso, e o código não inventa regra para ele.
3. **Todo erro do POST vira `failed`.** O CA11 fala de "erro do servidor" sem distinguir códigos. O conflito do CA12 não é um código HTTP: pela spec ("Assume que", #20), é o Service que confere antes de gravar. Tratar todo erro como `failed` não atropela a Tarefa 8.

**Diff:** o diff contra `5e4d075` mexe em 5 arquivos, todos no índice e nenhum fora dele: `fixed-routes.service.ts`, `route-form.{ts,html,spec.ts}` (os "Arquivos previstos" de `plan.md:128-129`) e `fixed-routes.service.spec.ts`, que o despacho autorizou. O `db.json` não foi tocado.
- **Glossário (§5.1):** nenhum termo novo de domínio. O desfecho `failed` é o mesmo nome usado no `FixedRouteLookup` (`fixed-routes.service.ts:15`), no aviso do CEP (`route-form.ts:63`) e no `plan.md:23`.
- **Escopo:** o diff não confere conflito (Tarefa 8) e não mexe na tela da rota nem em Minhas rotas. O aviso repete a marcação do aviso de falha da US01 (`apps/web/src/app/features/auth/sign-up/sign-up.html:89-96`). Fora isso, o diff não traz comportamento que a spec não pediu.

## Apontamentos

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts
