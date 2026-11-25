# Parecer de Conformidade — Tarefa 6

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA9: "Dado o formulário válido e sem conflito com outra rota minha, quando toco em 'Publicar rota', então a rota é gravada como ativa, comigo como motorista [...]" | atendido | **Código:** o formulário chama `submit()` no envio (`apps/web/src/app/features/driver/route-form/route-form.html:3`). O `submit()` monta a rota com `this.auth.currentUserId()` como `driverId` (`apps/web/src/app/features/driver/route-form/route-form.ts:195-212`). O `publish` faz o POST em `/fixed_routes` com `status: 'active'`, `suggestedFareCents: null`, `closedAt: null` e `createdAt` em ISO 8601 (`apps/web/src/app/core/data/fixed-routes.service.ts:116-146`). **Teste:** `route-form.spec.ts:753-782` preenche a tela e confere o corpo do POST com `toEqual` exato: `driverId: 'sample-user'`, o `campusId` vindo do GET dos câmpus, `from_campus`, `[1, 3, 5]`, `07:30`, `3` e `status: 'active'`. `fixed-routes.service.spec.ts:49-73` para o relógio, confere o corpo exato, `createdAt` incluído, e confere a rota devolvida com o id do servidor |
| CA9: "[...] e vou para a tela da rota, que mostra 'Rota publicada' e os dados que informei." | atendido | **Código:** depois da gravação, um `effect` navega para `['/rotas', id]` com `publicada: 1` (`route-form.ts:183-190`). A tela da rota recebe `publicada` como `input()` (`apps/web/src/app/features/search/route-detail/route-detail.ts:20-23`) e mostra o `Banner` com `role="status"` (`route-detail.html:1-4`). **Teste:** `route-form.spec.ts:784-798` passa pelo roteador real do app. A URL fica `/rotas/rota-nova?publicada=1`, o aviso diz "Rota publicada", o título é "Guarapuava → Centro" e os cinco dados batem com o que foi digitado. `route-detail.spec.ts:159-178` testa os dois casos: o aviso aparece com o parâmetro e não aparece sem ele |
| CA10: "[...] quando a gravação está em andamento, então o botão mostra 'Publicando…' e fica bloqueado [...]" | atendido | **Código:** `submitting` liga no toque, pelo `startWith(undefined)`, e fica ligado até a tela sair (`route-form.ts:152-168`). O botão usa `[disabled]="form.invalid \|\| submitting()"` e troca o texto para spinner + "Publicando…" (`route-form.html:172-179`). É o estado "carregando" do `docs/design-tokens.md:142`. **Teste:** `route-form.spec.ts:806-812` confere o botão bloqueado e o texto exato com o POST ainda sem resposta. `:817-824` confere o mesmo depois da resposta e antes de a tela da rota abrir |
| CA10: "[...] e um segundo toque não grava uma segunda rota." | atendido | **Código:** o botão fica bloqueado e o `exhaustMap` ignora um envio novo enquanto outro está em andamento (`route-form.ts:152-157`). **Teste:** há um `expectOne` do POST (`route-form.spec.ts:809`). Depois vêm dois toques novos, um antes e um depois da resposta, cada um seguido de `expectNone(isWrite)` (`:814-815`, `:826-827`). No fim, o `verify()` (`:121`) recusa qualquer requisição a mais |
| Spec, seção do CEP: "O CEP é só uma ajuda para preencher o Bairro: ele não é gravado". Fora de escopo: "Gravar o CEP ou o endereço que o ViaCEP devolve: só o bairro é gravado" | atendido | **Código:** o tipo `NewFixedRoute` não tem CEP (`fixed-routes.service.ts:21-31`). O `submit()` não lê o `postalCode` (`route-form.ts:196-197`). O registro é montado campo a campo (`fixed-routes.service.ts:126-139`). **Teste:** o CEP `85010-000` é digitado e preenche o Bairro pelo ViaCEP (`route-form.spec.ts:757-758`). O `toEqual` exato do corpo (`:769-782`) falharia com `postalCode` ou com qualquer campo do ViaCEP (`logradouro`, `localidade`, `uf`) |
| Assume que: "quem publica [...] é uma pessoa de exemplo fixa, gravada na coleção `users` do `db.json` e lida pelo `AuthService`." (#2) | atendido | **Código:** `// TODO #2` e `signal('sample-user')`, exposto só para leitura com `asReadonly()` (`apps/web/src/app/core/auth/auth.service.ts:18-24`). A pessoa existe em `db.json:4` (`"id": "sample-user"`). **Teste:** `auth.service.spec.ts:35-38` confere o valor e a falta de `set`. `route-form.spec.ts:770` confere que esse id chega ao POST |
| Assume que: "Essa pessoa de exemplo já tem veículo: nada confere a RN02 antes de publicar." (#3) | atendido | Nem o envio nem o Service buscam veículo (`route-form.ts:195-212`, `fixed-routes.service.ts:116-146`). Se houvesse essa busca, o `verify()` de `route-form.spec.ts:121` a recusaria |
| Assume que: as viagens "são calculadas na tela da rota [...] e não gravadas na coleção `trips`" (#6) | atendido | O `publish` faz um único POST, em `/fixed_routes` (`fixed-routes.service.ts:140`). Um POST em `/trips` quebraria o `verify()` dos dois specs |
| Fora de escopo: "O rateio sugerido (RN16): a rota é gravada sem rateio, e a tela não mostra o campo." | atendido | `suggestedFareCents: null` (`fixed-routes.service.ts:135`). O formulário não tem esse campo (`route-form.html:1-181`) |
| CA1 e CA17 (Tarefa 1) | atendido | `route-form.spec.ts:310-321` e `:323-346` passam com o botão novo. O CA17 continua conferindo `expectNone(isWrite)` (`:344`) |
| CA2, CA3 e CA4 (Tarefa 2) | atendido | `route-form.spec.ts:348-451` e `:560-568` passam |
| CA5, CA6 e CA7 (Tarefa 3) | atendido | `route-form.spec.ts:453-558` passam |
| CA8 (Tarefa 4) | atendido | `route-form.spec.ts:570-748` passam |
| CA13 e CA14 (Tarefa 5) | atendido | `route-detail.spec.ts:126-157` e `:180-243` passam. Sem `?publicada`, a tela não muda (`:170-178`) |
| CA11: falha no envio | fora desta tarefa | Tarefa 7 do `plan.md`. O POST que falha ainda não é tratado (`fixed-routes.service.ts:140-145`), e o comentário de `:39-42` registra que o resultado vai ganhar esse desfecho |
| CA12: conflito com outra rota minha | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA15: próximas viagens | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16: Minhas rotas | fora desta tarefa | Tarefa 10 do `plan.md` |

**Testes:** o `npm test` passou com 14 arquivos e 140 de 140 testes. Na Tarefa 5 eram 13 arquivos e 134 testes. Os 6 novos aparecem como aprovados na saída detalhada do Vitest: 1 no `auth.service.spec.ts`, 1 no novo `fixed-routes.service.spec.ts`, 2 no `route-detail.spec.ts` e 2 no `route-form.spec.ts`. Nenhum teste está com `skip` ou `only`. Os testes provam o que dizem:
- **O teste faz o papel do servidor:** toda resposta sai do `HttpTestingController`, com método e URL exatos, e nenhum Service é simulado. O `route-form.spec.ts` agora sobe o app com `appConfig.providers` (`:109-116`). Assim, a navegação para `/rotas/<id>` e a ligação do `publicada` como input são as de verdade.
- **O corpo é conferido inteiro:** o `toEqual` não usa `objectContaining`. Na tela, só o `createdAt` aceita qualquer texto. No Service, o relógio fica parado (`fixed-routes.service.spec.ts:8`, `:33`) e o valor é conferido exato.
- **Segundo toque:** no jsdom, o `click()` num botão desligado não dispara nada. Então o teste prova o CA10 pelo botão bloqueado, depois de afirmar `disabled === true`, e esse botão é o único lugar onde a pessoa toca. O `exhaustMap` é uma segunda barreira que nenhum teste exercita sozinho. O critério fala do toque e está provado, então isso não é apontamento.

**Leituras adotadas (não são apontamentos):**
1. **`?publicada=1` na URL:** o `plan.md:10-13` já previa o `publicada` chegando à tela como `input()`, e o caminho continua `/rotas/<id>`. Isso tem duas consequências:
   - recarregar a tela com o parâmetro mostra o aviso de novo;
   - o aviso não depende da busca (`route-detail.html:1-4`). Se o POST der certo e o GET da rota falhar, aparecem "Rota publicada" e a mensagem do CA14. As duas coisas são verdade, porque a rota foi gravada.

   Quem abre o endereço sem o parâmetro vê o CA13 e o CA14 como estão escritos.
2. **O bairro e o ponto de encontro são gravados sem os espaços das pontas** (`fixed-routes.service.ts:130-131`). Isso segue o CA3 e o CA4 ("sem contar os espaços das pontas"). Não cria regra nem texto novo, e o que a tela mostra não muda.
3. **"lida pelo `AuthService`":** o `AuthService` guarda o id da pessoa de exemplo do `db.json` e não busca `/users`. Foi o que o `plan.md:27-29` aprovou. A ligação com o `db.json` é só o valor `sample-user`, e o `// TODO #2` manda a US02 trocá-lo pela sessão de verdade.
4. **Viagens:** o §5.1 do `docs/architecture.md` ("Geração de viagens") diz que o Service cria as viagens ao publicar. O "Assume que" da spec (#6) diz o contrário, e o código segue a spec.

**Diff:** o diff contra `fd1053b` mexe em 10 arquivos. São exatamente os "Arquivos previstos" da Tarefa 6 (`plan.md:118-120`), todos no índice. O `db.json` não foi tocado.
- **Glossário (§5.1):** os nomes batem: `fixed_routes`, `driverId`, `status: 'active'`, `suggestedFareCents`, `closedAt` e `createdAt`. O controle `direction` agora é `FixedRouteDirection` (`route-form.ts:96`), como decidido em `tarefa-01-decisoes-r1.md` e `tarefa-05-decisoes-r1.md`. O resultado `published` é o do `plan.md:21-23`.
- **Escopo:** o diff não confere conflito e não tem mensagem de falha. Essas são as Tarefas 8 e 7. O spinner do botão é o estado "carregando" do `design-tokens.md:142`. Fora isso, o diff não traz comportamento que a spec não pediu.

## Apontamentos

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/route-detail.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
