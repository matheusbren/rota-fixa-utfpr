# Decisões — Tarefa 2, rodada 1

Os dois pareceres vieram APROVADO, sem apontamento bloqueante. As quatro sugestões do
revisor de código foram triadas: uma foi promovida a apontamento aceito, e as outras três
ficaram de fora, com o motivo abaixo.

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | O checkbox escondido `.drawer-toggle` continua focável abaixo de `lg`: o primeiro Tab vai para um controle invisível, anunciado como "Fechar menu" mesmo com a gaveta fechada (`app-shell.html:2-9`). Sugestão: `tabindex="-1"` e `aria-hidden="true"` no `<input>` | código (sugestão) | aceito (promovido a apontamento) | É defeito de hoje, não de amanhã: o PRD §7 pede navegação completa por teclado, e o ☰ (`<button>`) já é o controle acessível da gaveta. O conserto é pequeno e não muda o CA2 |
| 2 | Levar o foco ao primeiro link quando a gaveta abre e devolvê-lo ao ☰ quando ela fecha, com `effect()` sobre `drawerOpen` e `aria-expanded` no ☰ | código (sugestão) | recusado | Vai além do CA2, que só pede abrir e fechar. Mexer no foco envolve `effect()`, `aria-expanded` e passar o estado ao `top-bar` por `input()`: é uma melhoria de acessibilidade da casca inteira. Fica registrada como candidata a Issue de manutenção, para não inchar esta tarefa (constituição §3) |
| 3 | Com a gaveta aberta ao cruzar o `lg` (tablet girado), o DaisyUI 5.7.50 trava a rolagem do `:root`, porque o seletor dele só reconhece a classe literal `.drawer-open` | código (sugestão) | recusado nesta tarefa | Depende de CSS e de tamanho de tela, que o jsdom não simula, e o CA2 é sobre o celular. Fica para a conferência no navegador do Passo 8: se a trava aparecer lá, vira tarefa nova no plano, pelo `/utf-task`, como o enunciado manda para diferença de aparência |
| 4 | Tipar `navLinks` e o `input` do `SideNav` como `readonly NavLink[]`, para um `push` futuro não passar despercebido pelo `@for` | código (sugestão) | recusado | Sem prejuízo hoje: a lista tem um item e nada a altera. A própria sugestão aponta que a US02 (#2) troca a lista por um `computed()` sobre a sessão; é lá que o tipo vai ser decidido |
