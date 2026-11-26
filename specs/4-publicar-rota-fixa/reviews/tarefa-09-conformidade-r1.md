# Parecer de Conformidade — Tarefa 9

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA15: "quando desço até 'Próximas viagens', então vejo as viagens desta semana (de hoje até domingo)". A tela abre em "Esta semana" e o bloco é desenhado ao entrar na tela (`@defer (on viewport)`) | atendido | `apps/web/src/app/features/search/route-detail/route-detail.html:38-64`, `route-detail.ts:59`, `upcoming-trips.ts:36-42`. Testes: `route-detail.spec.ts:311`, `upcoming-trips.spec.ts:61` e `:68` (o domingo até 23:59 entra, a meia-noite de segunda fica de fora) |
| CA15: "uma por linha, com o dia e o horário ('qua., 25/11 às 07:30')" | atendido | `route-detail.html:49-56` (`<li>` por viagem), `route-detail.ts:75` (`"EEE, dd/MM 'às' HH:mm"` em pt-BR). O teste `route-detail.spec.ts:311` confere o texto exato `'sex., 27/11 às 07:30'` |
| CA15: "sem as de dias e horários que já passaram" | atendido | `upcoming-trips.ts:27` (`departsAt >= now`). Testes: `upcoming-trips.spec.ts:34` (a de 07:30 de hoje fica de fora às 08:00), `:49` (às 07:00 ela entra) e `:54` (a que sai exatamente agora entra) |
| CA15 e RN18: "quando escolho '4 semanas', então vejo todas as viagens das próximas 4 semanas, a contar de hoje" | atendido | `upcoming-trips.ts:19` (offset 0..27, 28 dias de calendário contando hoje), `route-detail.ts:64-72`. Testes: `upcoming-trips.spec.ts:42` (11 viagens, de 27/11 a 21/12, sem a quarta 23/12, como na leitura decidida pelo usuário) e `route-detail.spec.ts:322` (as 11 linhas exatas na tela, `aria-pressed` alternando e a volta para "Esta semana") |
| CA15: "quando não há viagem nesta semana, então vejo 'Nenhuma viagem nesta semana' e o caminho para ver as 4 semanas" | atendido | `route-detail.html:57-60` (mensagem) e `:42-46` (o seletor continua visível). Testes: `route-detail.spec.ts:340` (rota seg/qua vista na quarta às 08:00: lista vazia, a mensagem aparece, o toque em "4 semanas" mostra 7 viagens e a mensagem some) e `upcoming-trips.spec.ts:75` |
| Glossário (`docs/architecture.md` §5.1): Viagem é `Trip`/`trips`, e o instante é `departsAt` | atendido | `upcoming-trips.ts` usa `upcomingTrips`, `tripsThisWeek` e `departsAt`. As viagens são calculadas e não gravadas, como diz a seção "Assume que" da spec (#6) |
| Testes e lint | atendido | `CI=true npm test -- --watch=false`: 16 arquivos e 170 testes passando. Também passam com `TZ=UTC`, o fuso do CI. `npm run lint`: "All files pass linting." O relógio parado tem efeito de verdade: hoje (quinta, 26/11) o relógio real poria 23/12 na lista de 4 semanas, e o teste espera que ela termine em 21/12 |
| CA15, condição "Dado a tela de uma rota **ativa**", para uma rota `closed` | fora desta tarefa | `route-detail.html:38`: o bloco não olha `route.status`. Nesta história nenhuma rota fica encerrada, porque encerrar é a US11/US12 (#8/#9) |

Observações que não viram apontamento:
- O texto do `@placeholder`, "Carregando as próximas viagens…" (`route-detail.html:61-63`), não está na spec. Ele existe porque o plano aprovado manda usar `@defer (on viewport)` com `@placeholder` (ID9), então não conto como escopo inflado.
- O `route-form.spec.ts` não estava entre os arquivos previstos para a tarefa. A única mudança nele é na configuração do teste (`DeferBlockBehavior.Manual`, linhas 131-138), porque o envio abre a tela da rota. Ela não muda o que o teste do CA9 confere.

## Apontamentos

