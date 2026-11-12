# Parecer de Código — Tarefa 2

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint:
- `npm test`: 2 arquivos, 7 de 7 testes passando (os 3 do `app.spec.ts` e os 4 novos do `app-shell.spec.ts`).
- `npm run lint`: "All files pass linting".

Conferi o diff contra o `docs/architecture.md` (§2, §2.1, §3 e §4), a `.agents/rules/01-angular-strict-rules.md` e o `docs/design-tokens.md`:

- **Camadas:** as três peças ficam em `core/layout/`, como manda a tabela do §3, e nenhuma importa de `features/`. O spec usa telas de mentira no lugar do `SignUp`, então nem o teste fura a regra de dependência. Nenhuma das peças acessa dados.
- **Sintaxe Angular:** o diff usa `input.required()`, `output()`, `signal()` e `@for` com `track`. O Esc é declarado em `host`, sem `@HostListener`. Não há `standalone: true`, decorator `@Input`/`@Output`, injeção por construtor, `any` nem `subscribe()`.
- **Estado:** a gaveta tem um signal só, o `drawerOpen` (`app-shell.ts:17`), e todo caminho que mexe no checkbox passa por ele. O ☰, o link e o Esc gravam direto no signal; o overlay grava pelo `(change)`. É a decisão "Estado da gaveta" do `plan.md`.
- **Nomes:** `side-nav.ts` não tem o sufixo `.component`. Os seletores `app-side-nav` e `app-top-bar` são os do Mapa de Componentes (§3).
- **Estilo:**
  - Não há `.css` por componente nem `style=`.
  - As cores vêm só de tokens: `bg-neutral`, `text-neutral-content`, `outline-primary` e `bg-surface-dark-active` no item ativo, que é justamente o papel que o `design-tokens.md` dá a esse token.
  - Tipografia por `text-body-strong`, raio por `rounded-md` e espaçamento na escala de 4 px.
  - Os alvos de toque têm 48 px: `min-h-12` no link e, no ☰, o `btn` com `--size-field`.
  - O foco segue a regra para superfície escura: anel de 3 px em `primary`, afastado 2 px. No ☰, o afastamento vem do `outline-offset: 2px` da base do `.btn` do DaisyUI.
- **Pastas:** `side-nav/` nasce já com os arquivos.
- **Teste:** prova comportamento, e não estado interno: a URL final, o título no palco e se o checkbox `.drawer-toggle` está marcado.
  - É esse checkbox que o CSS do DaisyUI usa para mostrar a gaveta. Então ele é o sinal mais fiel de "aberta" que existe no jsdom.
  - Refatorar o `AppShell` (renomear o signal, trocar os handlers) não quebra o teste.
  - O teste reabre a gaveta depois do overlay (`app-shell.spec.ts:97-99`). Isso pega justamente a dessincronização entre o signal e o checkbox, que é o defeito típico desse desenho.

## Sugestões (não bloqueiam)
- **O checkbox escondido vira uma parada de Tab invisível no celular** (`app-shell.html:2-9`).
  - O `.drawer-toggle` do DaisyUI 5.7 fica com `opacity: 0` e tamanho zero, mas continua focável abaixo de `lg`.
  - O DaisyUI compensa isso desenhando o contorno num `label.drawer-button` (`.drawer-toggle:focus-visible ~ .drawer-content label.drawer-button`). Aqui o ☰ é um `<button>`, então essa compensação não funciona.
  - Resultado: o primeiro Tab da página leva o foco a um controle que ninguém vê. E o nome acessível dele vem do `<label for="app-drawer" aria-label="Fechar menu">`, então ele se anuncia como "Fechar menu" mesmo com a gaveta fechada.
  - Como o ☰ já é o controle acessível, `tabindex="-1"` e `aria-hidden="true"` no `<input>` resolvem. O toque no overlay continua funcionando, porque a ativação pelo `<label>` não depende do Tab.
- **Foco ao abrir e fechar a gaveta** (`app-shell.html:11` e `17-19`).
  - Ao abrir, o foco fica no ☰, atrás do overlay. Como o `drawer-side` vem depois do `<main>` e do rodapé no DOM, quem usa teclado precisa atravessar o palco inteiro até chegar em "Criar conta". A partir da Tarefa 3, esse palco é o formulário.
  - Ao fechar pelo Esc com o foco num link, o foco cai no `<body>` assim que o `drawer-side` fica `visibility: hidden`.
  - Um `effect()` sobre `drawerOpen` resolve: leva o foco ao primeiro link na abertura e o devolve ao ☰ no fechamento. O §2 reserva o `effect()` exatamente para efeito colateral. Se isso entrar, vale pôr junto o `aria-expanded` no ☰.
- **A gaveta aberta ao cruzar o `lg` trava a rolagem** (`app-shell.html:1`).
  - O DaisyUI 5.7.50 tira a rolagem do `:root` sempre que existe um `.drawer-toggle:checked` (`base/rootscrolllock.css`).
  - A exceção só vale para a classe literal `.drawer-open`: o seletor `:root:has(.drawer-open>.drawer-toggle:checked)` não pega o `lg:drawer-open`.
  - Exemplo: a pessoa abre a gaveta num tablet em retrato e gira para paisagem (1024 px ou mais). O `drawerOpen()` continua `true`, o ☰ some e a página para de rolar até ela apertar Esc ou tocar num link.
  - Vale testar isso no navegador quando forem tirados os prints do PR. Se acontecer, basta fechar a gaveta ao entrar em `lg` (`matchMedia('(min-width: 1024px)')`).
- **`navLinks` é uma lista mutável** (`app-shell.ts:15`).
  - Na #2 os links passam a depender da sessão ("Entrar" só para visitante).
  - Se alguém resolver isso com `navLinks.push(...)`, a referência não muda. O `input()` do `SideNav` não avisa a mudança e o `@for` não redesenha o menu.
  - Tipar como `readonly NavLink[]` aqui e no `input` de `side-nav.ts:16` fecha esse caminho agora. Na #2, o natural é um `computed()` sobre o `currentUser` do `AuthService`.

## Observações fora do escopo deste diff
- **Documentação desatualizada.** A divergência entre código e documentação, que até aqui era só uma anotação do `plan.md`, agora está no código: o `side-nav` também é a gaveta do celular e não existe `bottom-nav`. Os documentos ainda descrevem outra casca:
  - `docs/architecture.md` §4: "`top-bar` e `bottom-nav` no celular, `side-nav` a partir de `lg`" e "Casca pública — sem barra de navegação";
  - `docs/architecture.md` §3: a tabela de `core/layout/`;
  - `docs/design-tokens.md`: a tabela de breakpoints ("barra de abas embaixo" na base e "menu lateral no lugar da barra de abas" em `lg`).

  São os itens (a), (b) e (c) do `plan.md`, já apontados no parecer da Tarefa 1. Se a Issue de manutenção ainda não existe, este é o momento de abri-la. Não consegui conferir no GitHub nesta sessão, porque o MCP do GitHub não conectou.
- **`withComponentInputBinding()` ainda falta** (`apps/web/src/app/app.config.ts:9`). O `provideRouter(routes)` continua sem ele, embora o §4 o exija. Já estava registrado no parecer da Tarefa 1 e segue pendente.
