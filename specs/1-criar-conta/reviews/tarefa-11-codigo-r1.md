# Parecer de Código — Tarefa 11

**Veredito:** APROVADO

Diff revisado: `rtk proxy git diff f0e816d`, com 3 arquivos, 19 linhas acrescentadas e 14 removidas. São os três arquivos previstos na tarefa, todos no índice e nenhum commitado. Nenhum arquivo de `apps/web/src` mudou.

Testes e lint, rodados da raiz:
- `npm test`: 6 arquivos, 43 testes passando, nenhuma falha. É o mesmo número da Tarefa 10, coerente com uma tarefa que só muda documentação.
- `rtk proxy npm run lint`: "All files pass linting."

Réguas usadas: `docs/architecture.md` (§2, §2.1, §2.2, §3, §4, §5.3 e §7), `docs/design-tokens.md` e o código que os dois descrevem.

## Apontamentos (bloqueiam)

Nenhum.

O que conferi, documento contra código, e está conforme:
- **§4, casca única.** `app.routes.ts:7-16` tem uma rota pai sem caminho com `AppShell`, e `criar-conta` entra como filha pelo `loadChildren` de `features/auth/auth.routes.ts:4`. Não existe outra casca no código.
- **§4, moldura.** `app-shell.html:13-17` monta `app-top-bar`, o `<main>` com o `<router-outlet />` e `app-footer`, nessa ordem.
- **§4, navegação.**
  - A casca é `drawer lg:drawer-open` (`app-shell.html:1`) e o botão de menu (☰) tem `lg:hidden` (`top-bar.html:6`).
  - O `app-side-nav` é um só, dentro do `drawer-side` (`app-shell.html:21`): "o mesmo `side-nav`" está certo.
  - No DaisyUI 5.7 instalado, o `drawer-side` fica no início da linha (`inset-inline-start: 0`), então "lateral esquerda" também está certo.
- **§3, árvore e tabela "Onde mora".**
  - `core/layout/` tem `app-shell/`, `top-bar/`, `side-nav/` e `footer/`. O `offline-page` ainda não existe e continua como contrato, pela nota "Pasta nasce com a história" (`architecture.md:363-365`).
  - Os seletores conferem: `app-shell`, `app-top-bar`, `app-side-nav` e `app-footer`.
  - O parêntese "(o seletor já é `app-shell`)" é necessário e está correto: pela convenção da coluna `app-…`, o leitor esperaria `app-app-shell`.
- **§2, troca da E3.**
  - `app.config.ts:11` tem `provideHttpClient()` sem interceptor, e `core/http/` não existe.
  - A frase nova concorda com o §2.1 (`architecture.md:120-126`) e com as duas afirmações de que nenhuma tela muda (`architecture.md:88-91` e `:119`).
  - Sem o "só", ela também deixa de contradizer o §5.3, que já previa campos novos no `environment` na E3.
- **`design-tokens.md`, breakpoints.** As linhas "(base)" e `lg` descrevem o mesmo comportamento do §4 e do código, com o vocabulário que o documento já usava ("barra do app", "menu lateral").
- **`design-tokens.md`, token `tab`.** `text-tab` não é usado em nenhum template; só existe em `styles.css:83-85`. O §2.2 (`architecture.md:204`) continua listando `tab` na escala, coerente com "o token continua no tema".
- **Versões.**
  - `architecture.md`: cabeçalho e §7 concordam em 1.1.3 e 22/11/2026, e a linha do histórico resume as três mudanças com as seções certas.
  - `design-tokens.md`: 1.1.1 e 22/11/2026. O documento não tem seção de histórico.
  - A citação "`design-tokens.md` 1.1.0" em `architecture.md:246` é registro do que o setup usou e continua verdadeira.
- **Prova por `grep`.** `bottom-nav`, "casca pública" e "barra de abas" só aparecem na linha de histórico (`architecture.md:700`). No resto do repositório, só no `plan.md`.
- **`specs/README.md`.** O plano tem 11 tarefas. A 11ª é marcada no commit desta tarefa (`utf-task.md:97`), então a contagem fica verdadeira no momento em que entra.
- **Issue #21.** Li a Issue pelo `gh`. Os quatro passos dela estão no diff, e a frase do §2 e o papel do `tab` vão além deles, como a tarefa pede.

## Sugestões (não bloqueiam)

1. **A frase nova do §2 se afasta da letra da ficha, e o documento não diz por quê** — `docs/architecture.md:60`
   - A ficha diz que a troca "deve atingir **só os Services**" (`docs/checklist.md:29-31`). O fluxo `/utf-architecture` manda registrar exatamente isso (`.agents/workflows/utf-architecture.md:41`).
   - A frase nova é a verdadeira. Desde a Tarefa 10 o `authInterceptor` nasce na E3; o texto anterior o mantinha "desde o início para a troca não mexer em `app.config.ts`".
   - Voltar ao "só os Services" recriaria a contradição com o §2.1. Por isso não é apontamento.
   - Prejuízo: na #20 e na defesa da E3, quem comparar a régua com a ficha acha as duas em desacordo literal. Uma nova rodada do `/utf-architecture` tende a "consertar" a frase de volta.
   - Meia oração resolve: a ficha opõe Services a telas, e o registro do interceptor é exigido pelo ID23 da própria ficha.

2. **O `/entrar` ficou por inferência, e era o motivo da ratificação** — `docs/architecture.md:384-386` e `:355`
   - O texto removido citava `/entrar` e `/criar-conta` na casca pública. O novo cita só `/criar-conta`.
   - "Uma casca só" já decide o caso, então não há ambiguidade real.
   - A Issue #21 justifica a mudança justamente pela US02, e a linha da tabela "Onde mora" ainda diz "presente em quase toda tela". Esse "quase" é resto do desenho de duas cascas.
   - Prejuízo: quem planejar a US02 pode ler o "quase" como brecha para uma tela fora da casca.
   - "Inclusive `/entrar` e `/criar-conta`" e tirar o "quase" fecham as duas pontas.

3. **"Opção B" não tem referente no repositório** — `docs/architecture.md:390`
   - O rótulo só existe no `plan.md` e na Issue #21. A opção A não está escrita em lugar nenhum.
   - O parêntese explica o conteúdo, então o prejuízo é pequeno: daqui a três semanas alguém pergunta "B de quê?".
   - Tirar o rótulo e manter a descrição resolve.

4. **A coluna "Papel" do `tab` guarda um estado, não um papel** — `docs/design-tokens.md:123`
   - O texto é o que a tarefa pediu. Mas "sem uso em tela hoje" não diz se o token está livre para um rótulo de 12 px ou marcado para sair.
   - Prejuízo: a próxima tela que precisar de texto pequeno não sabe se pode usá-lo, e o documento existe para a IA não decidir isso sozinha.
   - Citar a Issue que o remove, ou o uso para o qual fica reservado, resolve.

5. **A contagem escrita à mão já ficou velha uma vez** — `specs/README.md:5`
   - O item (e) da tarefa existe porque o "9 tarefas feitas" não acompanhou a Tarefa 10.
   - "Todas as tarefas do plano feitas" não envelhece se uma auditoria abrir a 12ª.

## Observações fora do escopo deste diff

- **`--text-tab` virou token sem uso.** Está em `apps/web/src/styles.css:83-85`, no §2.2 (`architecture.md:204`) e no `design-tokens.md`. O plano tirou a remoção desta tarefa por ser código, mas nenhuma Issue a carrega. É candidata a Issue de manutenção: remover dos três lugares ou dar um papel a ele.
- **Não consegui conferir o Figma**, porque o conector não conectou nesta sessão.
  - O §3 afirma que "os seletores são os do mapa" (`architecture.md:351`).
  - Se o Mapa de Componentes e as telas de 360 px ainda mostram `app-bottom-nav` e não mostram `app-shell` nem `app-footer`, a frase deixou de valer para a linha `core/layout/`.
  - O protótipo é fonte de contexto da IA (§1). Vale a equipe conferir e, se for o caso, abrir Issue para alinhar o desenho ou anotar a divergência.
- **Os três arquivos do diff não passam no `prettier --check`, e já não passavam em `f0e816d`.**
  - Linhas que o Prettier mudaria, antes e depois: `architecture.md` 235 e 237; `design-tokens.md` 140 e 140; `specs/README.md` 6 e 6.
  - É a mesma pendência registrada na Tarefa 10 para o `architecture.md`; ela vale também para os outros dois.
  - Sem `rtk proxy`, o comando devolveu o resumo "All files formatted correctly", que é falso. A saída crua lista os três arquivos. Quem usar o Prettier como prova precisa rodar com `rtk proxy`.
- **`withComponentInputBinding()` continua faltando** no `provideRouter(routes)` (`app.config.ts:10`), embora o §4 o exija (`architecture.md:379-382`). A pendência está registrada desde o parecer da Tarefa 1. O `LOCALE_ID` que o comentário da árvore cita (`architecture.md:316`) também ainda não existe.

Não alterei nenhum arquivo. Usei o terminal para `git diff`, `git status`, `git log`, `git show`, `gh issue view 21`, leitura com `cat`, `grep` e `sed -n`, `prettier --check` e para rodar os testes e o lint. O `git status` ficou igual antes e depois. Não gravei o parecer em `specs/1-criar-conta/reviews/`: isso cabe ao fluxo.

### Critical Files for Implementation

Não há plano de implementação neste parecer. Estes são os arquivos que uma sugestão aceita na triagem tocaria, e os dois de código que servem de referência:
- /home/matheus/ATVroni/rota-fixa-utfpr/docs/architecture.md
- /home/matheus/ATVroni/rota-fixa-utfpr/docs/design-tokens.md
- /home/matheus/ATVroni/rota-fixa-utfpr/specs/README.md
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/app.routes.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/layout/app-shell/app-shell.html
