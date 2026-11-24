# Parecer de Conformidade — Tarefa 11

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| "O problema" (`spec.md:15-17`) e CA1 (`spec.md:32-34`): a tela de cadastro fica no palco central, entre o cabeçalho e o rodapé, dentro da casca que as próximas telas compartilham | atendido | `docs/architecture.md:384-389`: uma casca só, o `AppShell`, com `top-bar` em cima, o `<main>` com o `<router-outlet />` e o `footer` embaixo. Confere com o código: `apps/web/src/app/app.routes.ts:7-16` (rota pai `AppShell`, filhas por `loadChildren`), `features/auth/auth.routes.ts:4` (`criar-conta`), `core/layout/app-shell/app-shell.html:12-18`. Teste que prova, verde: `apps/web/src/app/app.spec.ts:19-41` |
| "O problema" (`spec.md:18-19`) e CA2 (`spec.md:35-38`): abaixo de `lg` os links vão para a gaveta do ☰; a partir de `lg` ficam fixos na lateral esquerda | atendido | `docs/architecture.md:390-392`. Confere com o código: `core/layout/top-bar/top-bar.html:4-11` (botão "Abrir menu" com `lg:hidden`), `app-shell.html:1` (`drawer … lg:drawer-open`) e `:19-22` (`drawer-side` com o `app-side-nav`). Teste da gaveta, verde: `core/layout/app-shell/app-shell.spec.ts:77-108`. A parte do `lg` é aparência, que a spec deixa para os prints do PR (`spec.md:20-22`): conferi pelas classes, não por teste |
| Tarefa 11 (a): §4 com uma casca só, `/criar-conta` como filha, gaveta do ☰ abaixo de `lg`, o mesmo `side-nav` fixo a partir de `lg` (opção B); "casca pública" e `bottom-nav` saem | atendido | `docs/architecture.md:384-392`. As duas linhas antigas ("Casca pública" e "Casca do app … `bottom-nav`") saíram no diff |
| Tarefa 11 (b): §3 com `app-shell` e `footer` em `core/layout/` e sem `bottom-nav`, na árvore e na tabela "Onde mora" | atendido | `docs/architecture.md:323` (árvore) e `:355` (tabela). As pastas existem: `core/layout/app-shell/`, `footer/`, `side-nav/`, `top-bar/`. O parêntese "o seletor já é `app-shell`" confere com `app-shell.ts:8`. O `offline-page` continua listado sem existir, o que a nota "Pasta nasce com a história" (`architecture.md:363-365`) cobre e esta tarefa não pediu mudar |
| Tarefa 11 (c): a frase do §2 passa a dizer que a E3 também registra o `authInterceptor` no `app.config.ts`, sem mudar tela nenhuma | atendido | `docs/architecture.md:60`: "A troca atinge os Services e o `app.config.ts`, que na E3 passa a registrar o `authInterceptor`; tela nenhuma muda (§2.1)". Bate com o §2.1 (`:120-126`) e com o código de hoje (`apps/web/src/app/app.config.ts:11`, `provideHttpClient()` sem interceptor). É a sugestão 1 de `reviews/tarefa-10-codigo-r1.md`, que o item 3 de `reviews/tarefa-10-decisoes-r1.md` remeteu a esta ratificação |
| Tarefa 11 (d): breakpoints sem a "barra de abas"; papel do token `tab` sem citar a barra de abas, com o token mantido no tema | atendido | `docs/design-tokens.md:151` (base: "menu lateral na gaveta que o ☰ da barra do app abre"), `:154` (`lg`: "menu lateral fixo na esquerda, sem a gaveta nem o ☰") e `:123` (`tab`: "sem uso em tela hoje; o token continua no tema"). A afirmação sobre o `tab` é verdadeira: `grep -rn "text-tab" apps/web/src` só acha a definição em `apps/web/src/styles.css:83-85`, que o diff não tocou |
| Tarefa 11 (e): a linha do #1 no `specs/README.md` conta as tarefas feitas de verdade | atendido | `specs/README.md:5`: "11 tarefas feitas". O plano tem hoje 10 tarefas `[x]` e a Tarefa 11 `[ ]` (`plan.md:148`); a conta fecha em 11 quando o fluxo marcar esta tarefa, como o despacho avisou |
| Tarefa 11: "A versão e a data sobem em cada documento, com linha no histórico onde ele existe" | atendido | `docs/architecture.md:4-5` (1.1.2 → 1.1.3; a data já era 22/11/2026, da Tarefa 10, e é a de hoje) e a linha nova do §7 em `:700`, que resume as três mudanças com as seções certas. `docs/design-tokens.md:4-5` (1.1.0 → 1.1.1, 03/11 → 22/11/2026); o documento não tem seção de histórico (`grep` de "Histórico" não acha nada), então vale o "onde ele existe". A menção a `design-tokens.md` 1.1.0 em `architecture.md:246` é registro do setup da Atividade 07 (§2.3), não a versão atual, e não precisava subir |
| Os quatro passos da Issue #21 (`gh issue view 21`, OPEN) | atendido | passo 1 é o item (a), passo 2 o (b), passo 3 o (d), passo 4 a linha de versão acima |
| Prova da tarefa: o `grep` de `bottom-nav`, "casca pública" e "barra de abas" não acha nada nos dois documentos fora do histórico | atendido | `grep -n -i` nos dois arquivos devolve uma linha só, `docs/architecture.md:700`, que é a linha 1.1.3 do histórico. Em `docs/design-tokens.md`, nada. Fora dos dois documentos, os termos só aparecem em `specs/1-criar-conta/plan.md` e nos pareceres antigos |
| Prova da tarefa: suíte e lint continuam verdes | atendido | `npm test`: 6 arquivos, 43 testes passando. `rtk proxy npm run lint`: "All files pass linting." |
| Escopo: só os arquivos previstos e só os itens (a) a (e) | atendido | o diff mexe em três arquivos, os previstos: `docs/architecture.md`, `docs/design-tokens.md`, `specs/README.md`. Nenhum arquivo de código mudou e não há arquivo novo. O texto traz quatro detalhes que a tarefa não dita palavra por palavra: o item "Moldura" do §4, "o ☰ some", "sem a gaveta nem o ☰" e o parêntese do seletor. Os quatro descrevem o que o código monta (linhas citadas acima) e ficam dentro dos trechos que (a), (b) e (d) mandam reescrever, então não contei como escopo inflado |
| Glossário e nomes (`docs/architecture.md` §3) | atendido | `app-shell`, `top-bar`, `side-nav` e `footer` são os nomes das pastas e, com o prefixo, os seletores do código (`app-shell.ts:8`, `top-bar.ts:4`, `side-nav.ts:10`, `footer.ts:4`). "Barra do app" e "menu lateral" são os termos que o `design-tokens.md` já usava na paleta (`:39`, `:44-45`) |
| CA3 a CA9 e "Abandono no meio" | fora desta tarefa | a tarefa não cobre critério de aceite novo e não muda comportamento; a suíte que prova os nove continua verde |

## Apontamentos

## Observações não bloqueantes
1. **"Presente em quase toda tela" ficou na linha que o diff reescreveu.** `docs/architecture.md:355`, coluna "Por quê": "Moldura do app: uma instância, presente em quase toda tela". Com duas cascas, o "quase" eram `/entrar` e `/criar-conta`, que ficavam na casca pública. Com a casca única do §4 (`:384-386`), o documento não diz mais qual tela ficaria fora. Não é apontamento: os itens (a) a (e) não listam essa célula, e a frase não chega a ser falsa, porque o documento não define se `/sem-conexao` (`offline-page`, `:412`) entra na casca. Fica para a triagem decidir se o "quase" continua.

## Testes executados
- `npm test` (raiz): 6 arquivos, **43 testes passando, nenhuma falha**. É o mesmo número da Tarefa 10, coerente com uma tarefa que só muda documentação.
- `rtk proxy npm run lint` (raiz): "All files pass linting."
- `rtk proxy git diff f0e816d`: 3 arquivos, 19 inserções e 14 remoções.
- Não há RED a reproduzir: a tarefa declara "Teste primeiro: não há".
- As três alterações já estavam no índice (`M ` na primeira coluna do `git status`), sem commit, quando comecei. O `HEAD` é `f0e816d`.

Não gravei nem alterei nenhum arquivo. O terminal só rodou `git diff`, `git status`, `git log`, `git ls-files`, `git rev-parse`, `grep`, `cat`, `ls`, `sed -n` (leitura), `gh issue view 21`, os testes e o lint. Gravar este parecer em `specs/1-criar-conta/reviews/tarefa-11-conformidade-r1.md` fica com o fluxo.

### Critical Files for Implementation

Não há plano de implementação neste parecer. Estes são os arquivos do diff e os que serviram de régua:
- /home/matheus/ATVroni/rota-fixa-utfpr/docs/architecture.md
- /home/matheus/ATVroni/rota-fixa-utfpr/docs/design-tokens.md
- /home/matheus/ATVroni/rota-fixa-utfpr/specs/README.md
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/layout/app-shell/app-shell.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/app.routes.ts
