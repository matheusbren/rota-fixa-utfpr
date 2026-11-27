# Decisões — Tarefa 10, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Decisões tomadas antes da implementação

1. O sentido do cartão leva o nome do campus, e as duas buscas (rotas ativas e câmpus) são feitas dentro do Service. A falha de qualquer uma vira `failed`, para não repetir o defeito da #23.
2. A falha nasce num método público novo (`lookupActiveByDriver`). O `findActiveByDriver` e o `publish` ficam intactos. Por isso `core/data/fixed-routes.service.{ts,spec.ts}` entraram no diff, fora dos "Arquivos previstos".
3. Só os testes novos conferem a busca pelo nome dos parâmetros. As constantes antigas ficam como estão.
4. O teste do toque responde o GET da rota e confere que a tela da rota abriu, com `DeferBlockBehavior.Manual` (sugestão 5 da Tarefa 9).
5. O cartão é um `<button type="button">` que emite um `output()`.
6. O teste da falha toca em "Tentar de novo" e prova que a busca sai outra vez.
7. O destaque duplo do menu em `/minhas-rotas/nova` fica fora desta tarefa, como candidata a Issue de manutenção.
8. Os cartões ficam na ordem do servidor. "vaga/vagas" e a seta são escritos no próprio cartão, e só o comentário de `route-detail.html:67` foi atualizado.

## Sugestões do revisor de código

- **O teste lê o cartão pela posição dos filhos diretos:** fica registrada.
- **O sentido e o "vaga/vagas" existem em duas features:** Issue de manutenção antes da US05 (#5), com o `route-plate` de `shared/ui/` previsto no §3 e talvez um pipe de vagas em `shared/pipes/`.
- **O `findActiveByDriver` continua público e deixa o erro passar:** fica registrada como alerta para a US11 e a US12 (#8, #9), junto da #23. A próxima tela que precisar das rotas do motorista usa o `lookupActiveByDriver`.
- **Os câmpus são buscados mesmo com a lista vazia, e a regra "campus ausente = `failed`" está escrita duas vezes:** fica registrada. Muda na E3.

## Observações fora do escopo

- **Destaque duplo no menu, com dois `aria-current="page"` em `/minhas-rotas/nova`:** candidata a Issue de manutenção no `side-nav.html` (`routerLinkActiveOptions` exato).
- **A caixa de erro tem 5 cópias:** entra na manutenção do `Banner` decidida na Tarefa 5.
- **Os ajudantes de teste repetidos e o `DeferBlockBehavior.Manual` em 3 specs:** entram na manutenção dos ajudantes registrada na Tarefa 1.
- **O `route-card` não está no mapa do §3:** entra na ratificação do §3 no fechamento da história.
- **A saída do CA17 ainda usa "Criar conta":** era opcional na decisão da Tarefa 1, e não foi trocada.
