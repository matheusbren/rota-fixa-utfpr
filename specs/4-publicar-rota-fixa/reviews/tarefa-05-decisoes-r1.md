# Decisões — Tarefa 5, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Sugestões do revisor de código

- **Rota e campus em duas buscas, em vez do `_embed` do json-server:** mantido. Trocar agora mexeria no `route-detail.spec.ts`, que só volta a ser tocado na Tarefa 9, e a lista de câmpus tem 13 itens. "Minhas rotas" (Tarefa 10) pode buscar a lista uma vez para todos os cartões. Na troca para o Supabase (#20) a junção vira uma consulta só, no mapeador.
- **A caixa de erro copiada entre telas:** candidata a manutenção (uma variante de erro no `Banner` de `shared/ui/`), junto com o `errorOf` repetido.
- **Nome do arquivo do pipe (`weekdays.pipe.ts`):** a convenção do repositório (`.service.ts`, `.pipe.ts`) é ratificada no §2.3 no fechamento da história.
- **O tipo `FixedRouteDirection` ainda não chegou ao `route-form.ts`:** passa formalmente para a Tarefa 6, que já mexe no `route-form` para montar o envio.
- **O comentário que cita a Tarefa 10 em `route-detail.html`:** apagado no commit de documentos do fechamento, depois que "Minhas rotas" existir.
