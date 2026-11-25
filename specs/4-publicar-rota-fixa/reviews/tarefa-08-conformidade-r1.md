# Parecer de Conformidade — Tarefa 8

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA12: "Dado que já tenho uma rota ativa que coincide com a nova em pelo menos um dia da semana, com menos de 60 minutos entre os horários de saída [...]" | atendido | **Código:** a regra pura `findConflict` (`apps/web/src/app/core/data/find-conflict.ts:16-26`) exige pelo menos um dia em comum (`:23`) e uma diferença estritamente menor que 60 minutos, para antes ou para depois (`:5`, `:24`). Ela não olha campus nem sentido, como a spec. A rota "minha" e "ativa" vem do `findActiveByDriver` (`apps/web/src/app/core/data/fixed-routes.service.ts:123-127`): GET `/fixed_routes?driverId=…&status=active`, com o `driverId` da sessão (`route-form.ts:206`). Conferi no `node_modules/json-server/lib/parse-where.js` (`splitKey`) que a linha 1.0.0-beta.15 trata `driverId=` e `status=` como igualdade (`eq`), então o filtro também funciona no json-server de verdade. **Teste:** `find-conflict.spec.ts:38-46` recusa 08:29 e 06:31, ou seja, 59 minutos depois e antes, e também o mesmo horário. `:48-56` aceita 08:30 e 06:30 (60 minutos). `:58-63` aceita dias diferentes no mesmo horário. `:65-70` recusa quando só um dia é comum. `:33-35` aceita a lista vazia. As fronteiras são exatamente as do "Teste primeiro" (`plan.md:133-134`). Na tela, a URL da busca é conferida por inteiro, com os dois filtros (`route-form.spec.ts:38`, `:305-308`) |
| CA12: "[...] quando toco em 'Publicar rota', então vejo 'Esta rota coincide com a sua rota de <bairro> (<dias> às <horário>)', com os dados da rota que conflita [...]" | atendido | **Código:** o `publish` devolve `{ status: 'conflict', route }` com a rota que conflita (`fixed-routes.service.ts:166-169`, a união em `:42-51`). A tela escreve a frase da spec num `<p role="alert">` com o `neighborhood`, os dias pelo pipe `weekdays` e o `departureTime` da rota que conflita (`route-form.html:176-183`, pipe importado em `route-form.ts:11` e `:75`). **Teste:** `route-form.spec.ts:940-956` compara o alerta com `toBe` exato contra "Esta rota coincide com a sua rota de Centro (seg, qua e sex às 07:30)" (`:58`), o texto do `plan.md:135-136`. A rota nova é Vila Carli, quarta, 08:00 (`:929-936`). Bairro, dias e horário diferem dos da rota do Centro (`:41-55`), então o aviso só pode estar lendo os dados da rota que conflita. `find-conflict.spec.ts:72-78` prova que vem a primeira rota que conflita, e não outra |
| CA12: "[...] os campos continuam preenchidos e nada é gravado." | atendido | **Código:** o caminho do conflito devolve `of(...)` antes do `post` (`fixed-routes.service.ts:167-169`). Nenhum `effect` mexe no `form` com `conflict` (`route-form.ts:188-193` só age em `published`). **Teste:** na tela, `formState()` é lido antes do toque e depois do conflito, e os dois são comparados com `toEqual` (`route-form.spec.ts:943`, `:953`). Também confere `expectNone(isWrite)` logo depois da resposta da busca (`:951`) e que a URL continua `/minhas-rotas/nova` (`:952`). No Service, `fixed-routes.service.spec.ts:149-157` faz `expectNone` do POST e compara o resultado com `toEqual` exato. O `httpTesting.verify()` dos dois `afterEach` (`route-form.spec.ts:144`, `fixed-routes.service.spec.ts:94-97`) recusa qualquer requisição que sobre |
| Abandono no meio: "Publica uma rota que bate com outra que já tem. [...] Vira o CA12, com os dados da rota que conflita para ele decidir qual manter." | atendido | Os dados da rota que conflita estão no aviso (linha acima). O botão volta a ligar com `conflict` (`route-form.ts:165-171`; teste em `route-form.spec.ts:954-955`). A pessoa então pode mudar a rota e tocar de novo. `route-form.spec.ts:960-989` passa o horário para 09:00 e toca outra vez. O aviso some (`:971`), a conferência é refeita (`:975`) e a rota é gravada com os dados novos (`:976-981`). A tela da rota abre (`:988`) |
| Assume que (#20): "a conferência de conflito (CA12) é feita pelo Service antes de gravar, e não pelo banco." | atendido | **Código:** quem confere é o `FixedRoutesService.publish`. Ele busca as rotas ativas, chama `findConflict` e só grava (POST) dentro do `switchMap`, se não houver conflito (`fixed-routes.service.ts:164-178`). A regra mora ao lado do Service, em `core/data/`, como o `plan.md:31-32` prevê. A tela não chama `findConflict`. **Teste:** a ordem está provada. No conflito, nenhum POST sai depois da resposta do GET (`fixed-routes.service.spec.ts:153-155`). Sem conflito, o POST só aparece depois do GET respondido (`:134-135`, `:163-169`). Um POST paralelo ao GET quebraria o `expectNone` |
| CA1 (Tarefa 1) | atendido | `route-form.spec.ts:340-351` passa. O `expectNoMessages()` (`:231-234`) procura `main [role="alert"]`, o seletor do novo aviso, então também prova que ele não aparece ao abrir |
| CA17 (Tarefa 1) | atendido | `route-form.spec.ts:354-376` passa sem mudança. A busca das rotas ativas só sai no toque (`route-form.ts:198-215`), e não ao abrir a tela. O `verify()` recusaria um GET sobrando |
| CA2, CA3 e CA4 (Tarefa 2) | atendido | `route-form.spec.ts:379-481` e `:589-598` passam sem mudança |
| CA5, CA6 e CA7 (Tarefa 3) | atendido | `route-form.spec.ts:483-588` passam sem mudança |
| CA8 (Tarefa 4) | atendido | `route-form.spec.ts:629-794` passam sem mudança |
| CA9 (Tarefa 6): "Dado o formulário válido e sem conflito com outra rota minha [...]" | atendido | `route-form.spec.ts:800-838` passa. O único acréscimo é a resposta vazia da busca das rotas ativas (`:805`). O `toEqual` exato do corpo do POST (`:808-821`) não mudou. `fixed-routes.service.spec.ts:131-144` e `:160-172` (rotas ativas que não coincidem não impedem a gravação) passam. `route-detail.spec.ts:159-178` passa |
| CA10 (Tarefa 6) | atendido | `route-form.spec.ts:842-870` passa. O `exhaustMap` (`route-form.ts:157`) cobre agora a conferência e a gravação juntas. Um toque durante a busca não inicia outra, e a busca a mais seria recusada pelo `verify()`. O "Publicando…" bloqueado durante a conferência está em `route-form.spec.ts:971-973` |
| CA11 (Tarefa 7) | atendido | `route-form.spec.ts:875-924` passam, com a busca das rotas ativas respondida vazia antes de cada POST (`:891`, `:907`). `fixed-routes.service.spec.ts:192-203` passa |
| CA13 e CA14 (Tarefa 5) | atendido | `route-detail.spec.ts:126-157` e `:180-244` passam. Nada em `features/search/` foi tocado |
| CA15: próximas viagens | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16: Minhas rotas | fora desta tarefa | Tarefa 10 do `plan.md`. O `findActiveByDriver` nasce aqui porque o CA12 precisa dele (`plan.md:20-21`), mas nenhuma tela de Minhas rotas foi criada |

**Testes:** o `npm test` passou com 15 arquivos e 160 de 160 testes. Na Tarefa 7 eram 14 arquivos e 144 testes. A saída do Vitest com `--reporters=verbose` mostra os 16 testes novos aprovados:
- 9 em `find-conflict.spec.ts`, o arquivo novo;
- 5 em `fixed-routes.service.spec.ts`: a busca das rotas ativas; o conflito sem gravação; a gravação sem conflito; e a falha da busca, sem conexão e com erro do servidor;
- 2 em `route-form.spec.ts`: o conflito na tela e o novo toque que publica.

Nenhum teste está com `only`, `skip`, `todo`, `xit` ou `fit`.

Os testes provam o que dizem:
- **Nenhum Service simulado.** O `route-form.spec.ts` sobe o app com `appConfig.providers` (`:132-139`), e o teste faz o papel do servidor pelo `HttpTestingController`.
- **Asserções exatas.** O texto do aviso é comparado com `toBe`, e o resultado do Service com `toEqual`.

**Leituras adotadas (não são apontamentos):**
1. **A falha da busca das rotas ativas vira `failed`.** Ela mostra o aviso do CA11 e nada é gravado (`fixed-routes.service.ts:177`; teste em `fixed-routes.service.spec.ts:176-187`). Esse ponto de falha nasce da premissa do #20 (conferir antes de gravar). Gravar sem conferir quebraria o "nada é gravado" do CA12. A conferência faz parte do envio, que é o que o CA11 cobre ("a conexão cai ou o servidor falha no envio"). Na tela, o caminho do `failed` é o mesmo que a Tarefa 7 já provou.
2. **O botão já mostra "Publicando…" durante a conferência.** Não é regra nova: o envio vai do toque até o resultado, e é isso que protege contra o toque duplo do CA10.
3. **O aviso do conflito some no novo toque.** É o mesmo `startWith(undefined)` da Tarefa 6 (`route-form.ts:157`). Se a pessoa edita um campo, o aviso continua até o próximo envio, como o aviso de falha da Tarefa 7. A spec não fala desse caso.
4. **O formato de `<dias>` e `<horário>`.** O CA12 não o fixa. Usar o pipe `weekdays` ("seg, qua e sex") e o "07:30" segue o CA13 e o texto da tarefa no `plan.md:135-136`.

**Diff:** o diff contra `8fda488` mexe em 7 arquivos, todos no índice e nenhum fora dele. São exatamente os "Arquivos previstos" (`plan.md:138-139`): `core/data/find-conflict.{ts,spec.ts}`, `core/data/fixed-routes.service.{ts,spec.ts}` e `route-form.{ts,html,spec.ts}`. O `db.json` não foi tocado.
- **Glossário (§5.1):** `FixedRoute`, `driverId`, `weekdays`, `departureTime`, `neighborhood` e `status: 'active'` são os nomes de lá. `findActiveByDriver`, `findConflict` e o desfecho `conflict` são os do `plan.md:20-23` e `:31`. Nenhum termo de domínio diverge.
- **Escopo:** a conferência só olha dia e horário, como o CA12. O diff não cria Minhas rotas nem as próximas viagens, e não traz comportamento que a spec não pediu.

## Apontamentos

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/find-conflict.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts
