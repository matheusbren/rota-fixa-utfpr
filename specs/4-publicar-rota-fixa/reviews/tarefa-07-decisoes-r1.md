# Decisões — Tarefa 7, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Sugestões do revisor de código

- **O `catchError` do `publish` também pega erro do mapeador:** hoje não acontece (o json-server sempre devolve a rota criada). Registrado para a troca para o Supabase (#20): o `publish` reescrito precisa diferenciar "não gravou" de "gravou, mas a resposta veio diferente", porque a API REST do Supabase responde ao POST sem corpo, a não ser com `Prefer: return=representation`.
- **Terceira cópia da caixa de erro:** entra na mesma manutenção decidida na Tarefa 5 (variante de erro no `Banner`).
