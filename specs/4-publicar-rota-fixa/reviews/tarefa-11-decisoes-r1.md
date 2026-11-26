# Decisões — Tarefa 11, rodada 1

Os dois pareceres vieram APROVADO, sem apontamento bloqueante. A triagem foi feita em nome
do Matheus, que delegou as decisões da história: as três sugestões do revisor de código e
uma das observações dele foram promovidas a apontamentos aceitos, porque são o mesmo
defeito que a auditoria final pediu para fechar (documento ou marca que leva quem vier
depois a fazer a coisa errada), no texto que esta própria tarefa escreveu. Com apontamento
aceito na rodada 1, a tarefa volta ao implementador (rodada 2).

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| A | O `TODO #3` diz que "o envio passa a conferir" o veículo, mas o `architecture.md` §4 (`/minhas-rotas/nova`: "sem veículo, a tela convida a cadastrar — US03") e o 3º critério da US03 pedem o convite no lugar do formulário | código (sugestão) | aceito (promovido) | Quem fizer a US03 seguindo o `grep TODO #3` cairia no `submit()` e conferiria o veículo depois do formulário preenchido. Correção: a frase diz que a tela passa a convidar a cadastrar o veículo em vez de mostrar o formulário (RN02, US03, `architecture.md` §4), mantendo "até lá, nada confere o veículo antes de publicar". A marca continua no mesmo lugar, porque é o ponto em que hoje a publicação sai sem a conferência. |
| B | A nota da US04 no §3 põe o `weekday-picker` e o `segmented-control` em `shared/ui/` "porque não conhecem domínio nenhum", e a regra logo acima diz que só sobe para `shared/ui/` a caixa de mais de um domínio | código (sugestão) | aceito (promovido) | O documento não pode ter dois critérios para a mesma pasta. Correção: a regra do §3 ("Do Mapa de Componentes… para as pastas") passa a dizer que também sobe para `shared/ui/` a caixa que não conhece domínio nenhum (um controle genérico, que recebe e devolve valores), e a nota da US04 cita essa regra. Mover os dois componentes para as features seria mudar código numa tarefa que não muda comportamento. |
| C | O parágrafo dos resolvers no §4 transcreve o texto e o link do CA14 ("Não achamos esta rota" e o link "Minhas rotas"), detalhe de tela que o cabeçalho do documento manda deixar na spec | código (sugestão) | aceito (promovido) | O link vai mudar quando a busca (#5) levar visitantes à tela, e o §4 voltaria a não bater com o código. Correção: "a própria tela trata a rota que não existe e a falha da busca (CA14 da US04)", sem o texto da tela. |
| D | O `upcomingTrips` mora em `features/search/route-detail/`; quando a gravação em `trips` nascer (#6), quem gera as viagens vai ser um Service de `core/data/`, e o §3 proíbe `core/` de importar de `features/` | código (observação fora do diff) | aceito (promovido) | A marca `TODO #6` está neste diff, e é o lugar que a US07 vai ler. Correção: o `TODO #6` também avisa que, nessa hora, a função sobe para `core/` (o §3 não deixa `core/` importar de `features/`). O §5.1 não muda: ele já diz que a gravação nasce com a assinatura. |

## Observações que não foram promovidas

- **O `docs/architecture.md` não passa no `prettier --check`** (tabelas desalinhadas em vários
  §, de antes desta branch): candidata a Issue de manutenção (`chore`), junto com a decisão de
  formatar `docs/` ou pô-lo no `.prettierignore`. A CI não roda o Prettier.
- **Não existe nenhum resolver no código**, e o ID19 da ficha os cobra: os dois do mapa chegam
  com a edição da rota (US11, #8) e com o embarque. Já está no plano do fechamento da matéria
  (resolver na Atividade 15) e o ID19 ficou desmarcado no `docs/checklist.md`.
- **O build não foi rodado pelo revisor de conformidade** (ele grava em `dist/`): o implementador
  e o revisor de código o rodaram, e passou.
