# Decisões — Tarefa 9, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Decisão tomada antes da implementação

- **Contagem das 4 semanas:** o plano diz "4 semanas de seg/qua/sex dão 12 viagens (menos as que passaram)". A leitura decidida é **11**: a janela vai de hoje até o fim do 27º dia depois de hoje (28 dias de calendário contando hoje). Vista da quarta, 25/11, às 08:00, ela termina na segunda, 21/12, e a quarta, 23/12, não entra. As 12 viagens do calendário perdem a das 07:30 de hoje, que já passou.

## Sugestões do revisor de código

- **A lista não se atualiza sozinha com a tela aberta** (o `new Date()` dentro do `computed` não é signal): fica registrada. O CA15 fala do momento em que a pessoa desce até a lista, e esse caso funciona.
- **O "4" da RN18 está na página, longe da regra:** fica para a US07 (#6), quando a geração das viagens for para o `FixedRoutesService` e a função mudar de lugar.
- **A leitura do "HH:mm" está escrita duas vezes** (`upcoming-trips.ts` e `find-conflict.ts`): fica para a US07 (#6), junto com a anterior.
- **O teste pega o primeiro bloco `@defer` do app inteiro:** fica registrada. Hoje a tela só tem um bloco.
- **O `DeferBlockBehavior.Manual` precisa se repetir em cada teste que chega à tela da rota:** passada à Tarefa 10, que navega de "Minhas rotas" até `/rotas/<id>`.
