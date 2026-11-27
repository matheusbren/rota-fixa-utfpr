# Decisões — Tarefa 6, rodada 1

Os dois pareceres vieram APROVADO: não há apontamento para triar.

## Sugestões do revisor de código

- **O `?publicada=1` fica na URL depois do aviso:** aceito como consequência do que o plano decidiu. Quem recarrega ou recebe o link copiado vê "Rota publicada" sobre uma rota que de fato está publicada; o texto não mente. Se incomodar no uso, vira manutenção (guardar o aviso num signal e tirar o parâmetro com `replaceUrl`).
- **Parâmetro de URL lido como `input()` precisa ter o nome em português** (o lint proíbe `alias`): registrar no §4 no fechamento da história.
- **"Publicando…" preso se a navegação falhar:** candidata a Issue no fechamento. A chance é pequena (o pedaço da tela da rota não baixar justo depois de gravar), e a spec não tem texto para esse caso.
- **O teste do CA9 no `route-form.spec.ts` confere de novo os dados da tela da rota:** mantido. É a prova, de ponta a ponta, de que a pessoa chega à tela com "os dados que informei"; se a Tarefa 9 mudar a marcação da lista, os dois specs mudam juntos.
