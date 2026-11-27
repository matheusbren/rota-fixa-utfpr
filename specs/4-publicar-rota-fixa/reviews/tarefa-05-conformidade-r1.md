# Parecer de Conformidade — Tarefa 5

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA13: "Dado que abro `/rotas/<id>` de uma rota que existe, quando a tela carrega, então vejo o campus, o sentido ('Bairro → Campus' na ida, 'Campus → Bairro' na volta), o ponto de encontro [...]" | atendido | **Rota:** `/rotas` em `apps/web/src/app/app.routes.ts:19-22` e `:routeId` em `apps/web/src/app/features/search/search.routes.ts:5`. O id da URL chega como `routeId = input.required<string>()` (`apps/web/src/app/features/search/route-detail/route-detail.ts:17`) pelo `withComponentInputBinding()` (`apps/web/src/app/app.config.ts:23`). **Busca:** GET `/fixed_routes/<id>` e depois o nome do campus pelo `CampusesService`, porque a rota só guarda o `campusId` (`apps/web/src/app/core/data/fixed-routes.service.ts:69-76`). **Tela:** o sentido como origem → destino (`route-detail.html:6-8`), o campus (`:12-13`) e o ponto de encontro (`:16-17`). **Teste:** abre a URL com a configuração do app inteiro (`route-detail.spec.ts:53-58`, `:64-67`). Na ida, o título é "Centro → Guarapuava" (`:121-128`). Na volta, é "Guarapuava → Centro" (`:130-152`). O GET de `/fixed_routes/rota-volta` (`:133`) prova que o id vem da URL |
| CA13: "[...] os dias por extenso curto, em ordem ('seg, qua e sex') [...]" | atendido | **Pipe:** `apps/web/src/app/shared/pipes/weekdays.pipe.ts:5-13` (nomes curtos ISO), `:16` (vírgula e "e" do pt-BR) e `:22-25` (ordena antes de escrever), usado em `route-detail.html:20-21`. **Testes:** `weekdays.pipe.spec.ts:7-16` cobre `[5, 1, 3]` → "seg, qua e sex", ou seja, a ordem não depende da lista, e também dois dias, um dia e cinco dias. Na tela: "seg, qua e sex" (`route-detail.spec.ts:39`, `:127`) e "ter e qui" (`:148`) |
| CA13: "[...] o horário de saída ('07:30') e as vagas ('3 vagas', ou '1 vaga')." | atendido | **Código:** o horário em `route-detail.html:24-25`. As vagas em `:28-29`, com `i18nPlural` (`route-detail.ts:35`): `'=1'` dá "1 vaga" e `other` dá "# vagas". **Teste:** "07:30" e "3 vagas" (`route-detail.spec.ts:40-41`, `:127`), "18:10" e "1 vaga" (`:149-150`). O `toEqual` sobre os pares rótulo/valor (`:101-108`) prova cada dado e também que não há dado a mais |
| CA14: "Dado que abro `/rotas/<id>` de uma rota que não existe, quando a tela carrega, então vejo 'Não achamos esta rota' e o link 'Minhas rotas'" | atendido | **Código:** só o 404 da rota vira `not-found` (`fixed-routes.service.ts:77-83`). A tela mostra o título e o link para `/minhas-rotas` (`route-detail.html:32-39`). **Teste:** `route-detail.spec.ts:154-167` confere o título exato e o `href="/minhas-rotas"` do link "Minhas rotas". Confere também que nenhum dado da rota e nenhum aviso de falha aparecem. O destino do link nasce na Tarefa 10, como previsto |
| CA14: "quando a busca falha (sem conexão ou erro do servidor), então vejo 'Não foi possível carregar a rota. Tente de novo.' e o botão 'Tentar de novo', que busca outra vez." | atendido | **Código:** qualquer falha que não seja o 404 da rota vira `failed`, inclusive a falha do GET dos câmpus (`fixed-routes.service.ts:74`, `:77-83`). A tela mostra o aviso e o botão (`route-detail.html:40-50`). Cada toque soma uma tentativa (`route-detail.ts:23`, `:37-39`), e a tentativa dispara a busca de novo (`:28-32`). **Teste:** `route-detail.spec.ts:169-217` cobre quatro casos: sem conexão (`ProgressEvent`), 500, câmpus sem conexão e campus inexistente. Em cada um, confere o texto exato. Depois do toque, o aviso some, e o `expectOne` de `:71` e `:80` exige um GET novo da rota e dos câmpus. A tela então mostra a rota (`:208-215`). O `verify()` de `:61` recusa requisição a mais |
| Abandono no meio: "Abre o link de uma rota que não existe mais, ou sem internet. Vira o CA14, sem tela em branco (PRD §7)." | atendido | As duas linhas do CA14 acima. Nos dois casos a tela tem texto e uma saída (o link ou o botão) |
| Assume que: "A tela da rota mostra tudo, inclusive o ponto de encontro, porque hoje só o motorista chega nela" e Fora de escopo: a visão do passageiro (RN17) | atendido | O ponto de encontro aparece sem condição nenhuma (`route-detail.html:16-17`). A rota `/rotas/:routeId` não tem guard (`search.routes.ts:5`) |
| Fora de escopo: "O rateio sugerido (RN16): [...] a tela não mostra o campo." | atendido | A tela não mostra o `suggestedFareCents` (`route-detail.html:10-31`). O `toEqual` de `route-detail.spec.ts:127` falharia com um sexto dado |
| Fora de escopo: "Ver a rota publicada na busca [...]: a busca é a US05 (#5)." | atendido | `/rotas` só tem a filha `:routeId` (`search.routes.ts:5`). Não nasceu tela de busca |
| CA1 (Tarefa 1) | atendido | `route-form.spec.ts:277-289` não mudou e passa |
| CA2, CA3 e CA4 (Tarefa 2) | atendido | `route-form.spec.ts:316-419` e `:528-536` não mudaram e passam |
| CA5, CA6 e CA7 (Tarefa 3) | atendido | `route-form.spec.ts:421-526` não mudaram e passam |
| CA8 (Tarefa 4) | atendido | `route-form.spec.ts:551-716` não mudaram e passam |
| CA17 (Tarefa 1) | atendido | `route-form.spec.ts:291-314` não mudou e passa |
| CA9 e CA10: envio, "Rota publicada", "Publicando…" e segundo toque | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA11: falha no envio | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA12: conflito com outra rota minha | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA15: próximas viagens | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16: Minhas rotas (e o destino do link do CA14) | fora desta tarefa | Tarefa 10 do `plan.md` |

**Testes:** o `npm test` passou: 13 arquivos e 134 de 134 testes. Na Tarefa 4 eram 11 arquivos e 121 testes. Os 13 novos são 6 no `weekdays.pipe.spec.ts` e 7 no `route-detail.spec.ts`, e todos aparecem como aprovados na saída detalhada do Vitest. Eles provam o que dizem provar:
- **O teste é o servidor:** toda resposta sai do `HttpTestingController`, com método e URL exatos (`route-detail.spec.ts:69-82`). Nenhum Service é simulado.
- **O id vem da URL:** a tela é aberta pelo roteador real do app, com os `appConfig.providers` (`:53-58`). Se faltasse o `withComponentInputBinding()`, o `input.required` não receberia valor e os testes falhariam.
- **"Busca outra vez":** depois do toque, o teste exige uma requisição nova, e não só a troca do texto (`:208-210`).
- **Critérios anteriores com a configuração nova:** o `route-form.spec.ts` monta o roteador com `provideRouter(routes)` (`:103`), então já roda com a entrada nova `/rotas`. O `withComponentInputBinding()` e o `LOCALE_ID` não chegam ao formulário: o `RouteForm` não tem `input()` e não usa pipe que dependa do idioma (`route-form.ts:74-160`).

**Leituras adotadas (não são apontamentos):**
1. **Campus da rota que não está na lista vira falha de carregamento** (`fixed-routes.service.ts:53-58`; teste em `route-detail.spec.ts:190-198`).
   - **Por que não é escopo inflado:** não nasceu texto novo, e a frase usada é a da spec. O CA13 exige mostrar o campus, então a rota sem campus não pode aparecer como achada. Não tratar o caso deixaria a tela quebrada, e a spec pede "sem tela em branco".
   - **O caso não acontece pelo app nesta história:** o formulário só oferece os câmpus do GET `/campuses` (`route-form.ts:75`), e os 13 câmpus do `db.json` não se apagam.
   - **Consequência:** com dado quebrado, "Tentar de novo" nunca resolve.
   - **A falha de rede do GET dos câmpus é outra coisa:** essa é CA14 de verdade, porque carregar a rota inclui carregar o nome do campus.
2. **Enquanto a busca espera, o palco fica vazio:** o template não tem ramo para o resultado ainda vazio (`route-detail.html:1-51`; `route-detail.ts:30`). O CA13 e o CA14 não pedem texto de carregamento, ao contrário do CA16 ("Carregando as suas rotas…"). Criar um seria texto que a spec não tem. O "sem tela em branco" do Abandono fala dos dois desfechos (rota inexistente e falta de internet), e os dois têm texto. A casca (barra superior e menu) continua visível.
3. **Rota com `status: 'closed'` aparece como achada.** A spec só distingue rota que existe de rota que não existe. Encerrar rota é fora de escopo (US11 e US12), então nenhuma rota fica encerrada nesta história.

**Diff:** o diff contra `6fde1b2` mexe em 10 arquivos, todos nos "Arquivos previstos" da Tarefa 5 e todos no índice. O `db.json` não foi tocado.
- **Glossário (§5.1):** o `FixedRoute` tem exatamente os 13 atributos do glossário (`fixed-route.ts:8-26`). O `direction` é `to_campus | from_campus` (`:2`) e o `status` é `active | closed` (`:5`). A coleção é `fixed_routes` (`fixed-routes.service.ts:64`), e o `suggestedFareCents` nulo é "a combinar" (RN16).
- **Nomes do §3 e do §4:** o `routeId` é o nome do §4, o `app-route-detail` está em `features/search/` e o pipe `weekdays` em `shared/pipes/`, como no §3.
- **Nome do Service:** o §5.1 cita `FixedRouteService` no item "Geração de viagens", e o código usa `FixedRoutesService`. Não é apontamento:
  - o nome é o que o `plan.md:20` aprovou;
  - segue o plural de `CampusesService` e de `UsersService` (§6);
  - aquele item do §5.1 descreve a geração de viagens, que o "Assume que" da spec descarta nesta história.
  - Cabe alinhar o §5.1 no fechamento da história.
- **Escopo:**
  - O `registerLocaleData` e o `LOCALE_ID` `pt-BR` (`app.config.ts:16`, `:25`) estão no `plan.md:10-13`.
  - O `// TODO #2` do `authGuard` (`app.routes.ts:13-14`) é a decisão de `tarefa-01-decisoes-r1.md`.
  - O link "Minhas rotas" aponta para a tela da Tarefa 10, e o comentário em `route-detail.html:34` registra isso.
  - Fora isso, o diff não traz comportamento que a spec não pediu.
- **Fica para o revisor de código, não é conformidade:**
  - a ausência do `fixedRouteResolver` do §4. A spec manda a própria tela mostrar o 404 e a falha (CA14).
  - o tipo `FixedRouteDirection` ainda não chegou ao controle `direction` do `route-form.ts:86`. Isso estava em `tarefa-01-decisoes-r1.md` para esta tarefa, e o `route-form` não está neste diff.

## Apontamentos

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/route-detail.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/route-detail.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/search/route-detail/route-detail.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/shared/pipes/weekdays.pipe.ts
