# Decisões — Tarefa 1, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | A falha do GET `/campuses` não é tratada: o `toSignal` relança o erro e a tela para de atualizar | código | recusado | A spec aprovada não descreve esse caso nem o texto do aviso, e o implementador é proibido de inventar tratamento de erro que a spec não pediu. Pela constituição (§3, "não inche a spec") e pelo enunciado da Atividade 13, caso que ninguém previu vira Issue nova, e não mudança no meio da história: registrado na #23, com o passo a passo para reproduzir. O caminho que a spec cobre (envio fora do ar, CA11) acontece com os câmpus já carregados. |

## Sugestões do revisor de código

Não bloqueiam e não entram na triagem. Destino de cada uma:

- **Teste do `driver` saindo pela tela de cadastro:** fica como está nesta tarefa; quando a Tarefa 10 criar o link "Minhas rotas", a saída do CA17 pode usá-lo.
- **`expectNoMessages()` ainda sem o que achar:** adotada como convenção para as próximas tarefas: todo campo com erro leva `aria-invalid="true"`, e os avisos do CEP (Tarefa 4) são conferidos pelo texto.
- **`/minhas-rotas` sem o `authGuard` e sem `TODO`:** adotada na Tarefa 5, que já mexe no `app.routes.ts`: um `// TODO #2` registra o guard que falta.
- **`direction` sem o tipo do modelo:** adotada na Tarefa 5, quando o `FixedRoute` nascer.
- **Ajudantes de teste repetidos, anel de foco repetido e o §3 com `direction-toggle`/`seat-stepper`:** candidatos a manutenção; o §3 é ratificado no fechamento da história.
