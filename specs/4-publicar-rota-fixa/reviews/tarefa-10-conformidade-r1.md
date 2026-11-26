# Parecer de Conformidade — Tarefa 10

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA16: "Dado que abro 'Minhas rotas' pelo menu": o link do menu existe e a tela está em `/minhas-rotas` | atendido | `apps/web/src/app/core/layout/app-shell/app-shell.ts:17`, `apps/web/src/app/features/driver/driver.routes.ts:7`. O teste abre a tela pelo link do `side-nav` e confere a URL e o título: `apps/web/src/app/features/driver/my-routes/my-routes.spec.ts:163` |
| CA16: "vejo um cartão por rota ativa minha (sentido, dias, horário e vagas)" | atendido | `apps/web/src/app/features/driver/my-routes/my-routes.html:17-29`, `apps/web/src/app/features/driver/my-routes/route-card/route-card.html:4-14`, `apps/web/src/app/core/data/fixed-routes.service.ts:160-167`. O teste confere duas rotas com o texto de cada parte do cartão ("Centro → Guarapuava", "seg, qua e sex", "07:30", "3 vagas" e "Curitiba → Batel", "ter e qui", "18:10", "1 vaga"), na ordem em que o servidor as devolve. A busca é conferida pelos parâmetros `driverId=sample-user` e `status=active`: `my-routes.spec.ts:180`. O sentido segue as regras de texto do CA13, como pede a decisão 1 |
| CA16: "tocar no cartão abre a tela dela" | atendido | `route-card.html:6-9` (um `<button type="button">` que emite o `output()`), `apps/web/src/app/features/driver/my-routes/my-routes.ts:43-45`. O teste toca no **segundo** cartão, o que prova que o id usado é o do cartão tocado. Ele confere `/rotas/rota-do-batel`, responde o GET da rota e dos câmpus e confere o título "Curitiba → Batel" da tela da rota: `my-routes.spec.ts:191-203` |
| CA16: "quando não tenho rota ativa, então vejo 'Você ainda não publicou nenhuma rota' e o link 'Publicar uma rota fixa'" | atendido | `my-routes.html:30-37`. O teste confere o texto exato, o `href` `/minhas-rotas/nova` do link no `<main>` (o link de mesmo nome do menu fica de fora da busca) e que não há cartão: `my-routes.spec.ts:207-216` |
| CA16: "quando a busca falha, então vejo 'Não foi possível carregar as suas rotas. Tente de novo.' e o botão 'Tentar de novo'" | atendido | `my-routes.html:6-16`, `fixed-routes.service.ts:160-167` (a falha de qualquer uma das duas buscas vira `failed`, como na decisão 1). O teste cobre quatro casos: sem conexão e erro 500, tanto na busca das rotas quanto na dos câmpus. Ele toca em "Tentar de novo" e prova que uma nova busca sai (`expectOne` mais `verify()`), como pede a decisão 6: `my-routes.spec.ts:222-268` |
| CA16: "Enquanto carrega, vejo 'Carregando as suas rotas…'" | atendido | `my-routes.html:4-5`, `my-routes.ts:28-36` (`startWith(undefined)` a cada busca). O teste confere que o aviso continua depois das rotas e antes dos câmpus, e que some quando os dois chegam: `my-routes.spec.ts:163-177`. O aviso também volta depois de "Tentar de novo": `my-routes.spec.ts:260-262`. O texto usa a mesma reticência (U+2026) da spec |
| Escopo: arquivos fora dos "Arquivos previstos" | atendido (autorizados) | `fixed-routes.service.{ts,spec.ts}`: a decisão 2 autoriza, e `findActiveByDriver` e `publish` ficam intactos. `route-detail.html:67`: só o comentário muda (decisão 8). O destaque duplo do menu em `/minhas-rotas/nova` fica de fora (decisão 7) |
| Glossário (`docs/architecture.md` §5.1) | atendido | `FixedRoute`, `Campus`, `driverId`, `campusId`, `direction` (`to_campus`/`from_campus`) e `status` (`active`) são usados como no glossário |
| Os testes rodam | atendido | `CI=true npm test -- --watch=false`: 17 arquivos e 184 testes passam. `npm run lint`: "All files pass linting." |

## Apontamentos

