# Decisões — Tarefa 3, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Leituras registradas pelo revisor de conformidade

- O aviso dos dias aparece no toque (o CA5 diz "quando marco um dia e desmarco"), e não ao sair do grupo: mantido, é o que a spec descreve.
- O "2,5" do CA7 é testado como `2.5` no jsdom: conferir no celular junto com os prints do PR.

## Sugestões do revisor de código

- **Aviso dos dias sem anúncio para leitor de tela:** candidata a manutenção de acessibilidade, junto com os avisos de campo que não são região viva (padrão herdado da US01).
- **`weekday-picker` sem teste próprio, sem ordenar no `writeValue` e sem `setDisabledState`:** fica para a US11 (#8), que reaproveita o seletor com uma rota já gravada; o que a US04 grava sai do `toggle`, que ordena.
- **`ControlValueAccessor` em `shared/ui/`:** registrar no §3 do `architecture.md` no fechamento da história, junto com o mapa de componentes.
