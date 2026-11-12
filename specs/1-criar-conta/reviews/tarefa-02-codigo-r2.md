# Parecer de Código — Tarefa 2

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no estado atual:
- `npm test`: 2 arquivos, 8 de 8 testes passando. São os 3 do `app.spec.ts` e os 5 do `app-shell.spec.ts`, que agora tem o teste novo do Tab.
- `npm run lint`: "All files pass linting".

**O apontamento aceito na rodada 1 está resolvido.**
- `app-shell.html:7-8`: o checkbox `.drawer-toggle` ganhou `tabindex="-1"` e `aria-hidden="true"`.
- O `<label for="app-drawer">` do overlay continua marcando e desmarcando o checkbox. A ativação pelo label não depende da ordem do Tab nem da árvore de acessibilidade. Os testes do overlay (`app-shell.spec.ts:97-108`) e do Esc (`:111-120`) continuam verdes, e o ☰ continua abrindo a gaveta depois do overlay.
- A partir de `lg`, o DaisyUI 5.7 aplica `display: none` ao `.drawer-toggle` dentro do `drawer-open`. O conserto não muda nada no desktop.
- O teste novo (`app-shell.spec.ts:124-129`) prova o defeito de verdade. Sem o `tabindex`, o jsdom dá `tabIndex` 0 ao `<input>`, então `firstTabStop()` devolveria o checkbox e não o ☰. O teste falha antes do conserto e passa depois.
- O teste segue o mesmo critério da rodada 1: olha o DOM que o DaisyUI usa (o checkbox), e não o estado interno do `AppShell`.
  - `firstTabStop()` (`:64-68`) aproxima a ordem do Tab pela ordem do documento, com `tabIndex >= 0` e sem `disabled`. Isso basta, porque nenhum elemento do diff usa `tabindex` positivo.
  - Conferir o atributo `aria-hidden` é o que o jsdom permite, já que ele não calcula o nome acessível.

Conferi de novo o diff inteiro contra o `docs/architecture.md` (§2, §2.1, §3 e §4), a `.agents/rules/01-angular-strict-rules.md` e o `docs/design-tokens.md`.
- **Camadas:**
  - `app-shell/`, `side-nav/` e `top-bar/` ficam em `core/layout/`, como na tabela do §3.
  - Nada importa de `features/`. O spec usa telas de mentira (`FakeSignUp`, `FakeOtherPage`), então nem o teste fura a regra de dependência.
  - Nenhuma peça acessa dados.
- **Sintaxe Angular:**
  - O diff usa `signal()`, `input.required()`, `output()` e `@for` com `track`.
  - O Esc é declarado em `host` (`app-shell.ts:12`).
  - Não há `standalone: true`, decorator `@Input`/`@Output`/`@HostListener`, injeção por construtor, `any` nem `subscribe()`.
- **Estado:** um signal só, o `drawerOpen`, que é a decisão "Estado da gaveta" do `plan.md`. O ☰, o link e o Esc gravam nele, e o overlay grava pelo `(change)`.
- **Nomes:** os arquivos não têm o sufixo `.component`. Os seletores `app-shell`, `app-side-nav` e `app-top-bar` têm o prefixo `app-`.
- **Estilo:**
  - Não há `.css` por componente nem `style=`.
  - As cores vêm só de tokens: `bg-neutral`, `text-neutral-content`, `outline-primary` e `bg-surface-dark-active` no item ativo.
  - Tipografia por `text-body-strong` e raio por `rounded-md`.
  - Os alvos de toque têm 48 px (`min-h-12` e o `btn`).
  - O anel de foco é de 3 px em `primary` sobre a superfície escura.
- **Segredos e erros:** não há URL de ambiente, chave nem tratamento de erro no diff.
- **Abstração:** o `SideNav` recebendo os links por `input()` e o `TopBar` emitindo `menuOpen` são o desenho que o `plan.md` decidiu. Não é indireção sem uso.
- **Duplicação:** o `NavLink` é a única definição desse tipo no repositório.

## Sugestões (não bloqueiam)
- Nenhuma nova. As três sugestões recusadas na rodada 1 (foco e `aria-expanded`, trava de rolagem ao cruzar o `lg`, `readonly NavLink[]`) seguem recusadas, como registrado em `tarefa-02-decisoes-r1.md`. Não as reabro.

## Observações fora do escopo deste diff
- **Mais um dado para a futura Issue de foco da casca (decisão 2 da rodada 1, não é apontamento).**
  - No Chromium, tocar no `<label for="app-drawer">` do overlay também leva o foco para o controle ligado a ele. O `tabindex="-1"` tira o checkbox da ordem do Tab, mas ele continua recebendo foco pelo clique.
  - Então, depois de fechar pelo overlay, o foco fica num elemento com `aria-hidden="true"`. A especificação ARIA diz que `aria-hidden` não deve ser usado em elemento que pode receber foco.
  - Para quem usa teclado não há prejuízo: o próximo Tab cai no ☰. Para quem usa leitor de tela, o foco fica num ponto mudo.
  - Isso cabe na mesma Issue que vai tratar o foco ao abrir e fechar a gaveta.
- **A documentação continua descrevendo outra casca.** São os itens (a), (b) e (c) do `plan.md`, já registrados nos pareceres da Tarefa 1 e da rodada 1:
  - `docs/architecture.md` §4 ainda diz "`top-bar` e `bottom-nav` no celular, `side-nav` a partir de `lg`" e "Casca pública — sem barra de navegação";
  - a tabela de `core/layout/` no §3 também segue desatualizada;
  - a tabela de breakpoints do `docs/design-tokens.md` ainda fala em "barra de abas embaixo".

  Não consegui conferir se a Issue de manutenção já existe, porque o MCP do GitHub não conectou nesta sessão.
- **`withComponentInputBinding()` ainda falta** (`apps/web/src/app/app.config.ts:9`). O `provideRouter(routes)` continua sem ele, embora o §4 o exija. É pendência anterior a esta tarefa.
