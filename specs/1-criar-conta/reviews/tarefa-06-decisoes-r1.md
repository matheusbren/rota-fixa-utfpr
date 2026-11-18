# Decisões — Tarefa 6, rodada 1

Os dois pareceres vieram APROVADO, sem apontamento bloqueante. O usuário promoveu as três
observações do revisor de conformidade (A, B e C) a apontamentos aceitos, escolhendo a
correção de cada uma, e não promoveu nenhuma das quatro sugestões do revisor de código.
Com apontamento aceito na rodada 1, a tarefa volta ao implementador (rodada 2).

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| A | O teste do CA6 inverte as maiúsculas do texto da tarefa (conta `ana@`, digita `ANA@`), em vez de "conta ativa em `ANA@utfpr.edu.br`, cadastrar `ana@utfpr.edu.br`" | conformidade (observação) | aceito (promovido) | Correção escolhida pelo usuário: o teste da tela segue o texto literal do plano (o servidor devolve a conta `ANA@utfpr.edu.br` e a pessoa digita `ana@utfpr.edu.br`). A prova da busca normalizada continua no `auth.service.spec.ts` |
| B | Conta pendente também recebe "Este e-mail já tem conta" com "Entrar" (`TODO #1`), o que a seção "Abandono no meio" da spec proíbe | conformidade (observação) | aceito (promovido) | Correção escolhida pelo usuário: só conta com `emailVerified: true` vira `'active'`; a conta pendente segue o caminho de gravação até a Tarefa 7 (CA7) tratá-la, com um teste provando que conta pendente não mostra o aviso de conta ativa |
| C | O aviso saiu com ponto final ("Este e-mail já tem conta."), diferente da spec e das mensagens do CA4/CA5; o link "Entrar" não muda nada visível até a US02 | conformidade (observação) | aceito (promovido) | Correção escolhida pelo usuário: só tirar o ponto final e conferir o texto exato no teste. O link continua em `/entrar`, conforme o "Assume que" da spec (#2) |
| 1 | A caixa de aviso agora existe em dois lugares (`sign-up.html` e `app-banner`); decidir variantes do banner na Tarefa 7 | código (sugestão) | não promovida | Decisão do usuário: nenhuma sugestão do revisor de código promovida. Fica como orientação para a Tarefa 7 |
| 2 | `findByEmail` depende de receber o e-mail já normalizado (garantido só por comentário) | código (sugestão) | não promovida | Decisão do usuário: nenhuma sugestão do revisor de código promovida |
| 3 | A URL exata da busca é conferida duas vezes (tela e service); a da tela quebra na E3 | código (sugestão) | não promovida | Decisão do usuário: nenhuma sugestão do revisor de código promovida |
| 4 | O tratamento de erro da Tarefa 9 precisa cobrir a cadeia inteira (GET + POST) | código (sugestão) | não promovida | Decisão do usuário: nenhuma sugestão do revisor de código promovida. Fica como orientação para a Tarefa 9 |
