# Decisões — Tarefa 11, rodada 1

Os dois pareceres da rodada 1 vieram APROVADO, sem apontamento bloqueante. A observação do
parecer de conformidade e as cinco sugestões do parecer de código foram triadas no
fechamento da história: nenhuma foi promovida a apontamento aceito, com o motivo abaixo.

| # | Observação/sugestão (resumo) | Origem | Decisão | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | A frase nova do §2 ("a troca atinge os Services e o `app.config.ts`") se afasta da letra da ficha, que diz "só os Services" (`docs/checklist.md:29-31`), e o documento não explica por quê (`architecture.md:60`) | código (sugestão 1) | não promovida | A frase é a verdadeira e remete ao §2.1, que explica quando o `authInterceptor` nasce. A ficha opõe Services a telas, e a frase mantém "tela nenhuma muda". Voltar ao "só" recriaria a contradição que a Tarefa 10 tirou. A explicação fica para a defesa da E3 |
| 2 | O `/entrar` ficou por inferência no §4, e a tabela "Onde mora" ainda diz "presente em quase toda tela" (`architecture.md:384-386` e `:355`) | código (sugestão 2); também observação 1 do parecer de conformidade | não promovida | "Uma casca só, com as telas como rotas filhas" já decide o caso do `/entrar`, sem ambiguidade. Quem fixa a tela de entrar dentro da casca é a spec da US02 (#2); fica como orientação para ela. O "quase" não é falso: o documento não define se `/sem-conexao` entra na casca |
| 3 | "Opção B" não tem referente no repositório fora do `plan.md` e da Issue #21 (`architecture.md:390`) | código (sugestão 3) | não promovida | O parêntese do próprio texto descreve o que é a opção (links na lateral, barra superior só com contexto). O rótulo é o mesmo do plano e da #21, que este PR fecha |
| 4 | A coluna "Papel" do token `tab` guarda um estado ("sem uso em tela hoje"), não um papel (`design-tokens.md:123`) | código (sugestão 4) | não promovida | É o que a tarefa pediu: não inventar um papel que nenhuma tela tem. Decidir se o token sai do tema ou ganha um uso é código (`styles.css`), fora desta tarefa: fica como candidata a Issue de manutenção |
| 5 | A contagem "11 tarefas feitas" é escrita à mão e já ficou velha uma vez (`specs/README.md:5`) | código (sugestão 5) | não promovida | O número fica verdadeiro no commit desta tarefa, e a linha muda de novo no merge. O formato da observação segue o que a equipe já usava |

Observações fora do escopo do diff, registradas como candidatas a Issue de manutenção: o
token `--text-tab` sem uso (`styles.css:83-85`, `architecture.md` §2.2 e `design-tokens.md`);
o Mapa de Componentes do Figma, que não foi conferido contra a casca nova; os três
documentos do diff fora do `prettier --check` (já estavam em `f0e816d`); e o
`withComponentInputBinding()` que falta no `app.config.ts`, registrado desde o parecer da
Tarefa 1.
