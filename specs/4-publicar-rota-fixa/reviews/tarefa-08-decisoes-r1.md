# Decisões — Tarefa 8, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Sugestões do revisor de código

- **Os testes dependem da ordem dos parâmetros da busca:** passada à Tarefa 10, que volta a usar a busca das rotas ativas: conferir os parâmetros pelo nome, e não a URL inteira.
- **O `findActiveByDriver` deixa o erro passar:** passada à Tarefa 10 como decisão a tomar lá. "Minhas rotas" precisa do aviso de falha (CA16) sem repetir o defeito da #23: a busca da tela devolve uma união com `failed`, como o `findById`.
- **Citar a RN05 no comentário do `findConflict`:** fica para a US07 (#6), que é quem vai reaproveitar a regra para as assinaturas.
- **Quarta cópia da caixa de erro:** entra na manutenção decidida na Tarefa 5.
- **Id só de dígitos no `db.json` vira número no filtro do json-server:** registrar no §2 (notas do json-server) no fechamento da história.
