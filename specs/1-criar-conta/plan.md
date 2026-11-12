# Plano — Issue #1

## Decisões técnicas

- **Rotas e casca (ID18).** Uma rota pai sem caminho carrega o `AppShell`
  (`core/layout/app-shell/`); as telas entram como rotas filhas, dentro do
  `<router-outlet />` do palco central. A feature expõe as próprias rotas em
  `features/auth/auth.routes.ts` (`loadChildren`), com `criar-conta` → `SignUp`.
  A raiz e o coringa `**` redirecionam para `criar-conta` (`// TODO #2` na raiz e
  `// TODO #5` no coringa). O `app.html` fica só com `<router-outlet />`: a página
  de teste do setup sai.
- **A gaveta é o `drawer` do DaisyUI 5.** O `AppShell` monta `drawer lg:drawer-open`:
  o `drawer-content` leva o `app-top-bar`, o palco (`<main>` com o outlet) e o
  `app-footer`; o `drawer-side` leva o overlay e o `app-side-nav`. Abaixo de `lg`, o
  ☰ do cabeçalho (`lg:hidden`) abre a gaveta; a partir de `lg`, o `drawer-open` deixa
  o menu fixo na esquerda. É a **opção B** da navegação no desktop (links na lateral,
  barra superior só com contexto), a mesma do protótipo e do `design-tokens.md`. Um
  componente cobre celular e desktop.
- **Estado da gaveta.** Um signal `drawerOpen` no `AppShell`, ligado ao toggle, para o
  link, o overlay e a tecla Esc poderem fechá-la.
- **Menu.** O `app-side-nav` recebe os links por `input()`, uma lista de
  `{ label, path }`. Hoje tem um item, "Criar conta"; cada história acrescenta o seu.
- **Camada de dados (§2.1).** `User` em `core/models/user.ts` (`id`, `email`,
  `fullName`, `role`, `emailVerified`, `createdAt`; a senha não faz parte do modelo).
  `UsersService` em `core/data/` é o único que conhece a URL `/users` e o campo
  `password` do `db.json`; devolve e recebe `User`. `AuthService` em `core/auth/`
  decide o resultado do cadastro (`created`, `active` ou `pending`) e é o que a tela
  injeta. A tela não fala com o servidor.
- **E-mail normalizado.** `trim()` e minúsculas antes de procurar e de gravar. A busca
  é `GET /users?email=<normalizado>` (igualdade, na linha 1 do json-server).
- **Validadores** em `shared/validators/`, funções puras (`ValidatorFn`):
  `institutionalEmail` (olha o texto depois do último `@` e só aceita
  `alunos.utfpr.edu.br` ou `utfpr.edu.br`, nada parecido) e `password` (8 ou mais
  caracteres, com letra e número). As mensagens do CA4 e do CA5 ficam num mapa na tela.
- **Formulário.** Reactive Forms com `inject(FormBuilder)`: `fullName`, `email`,
  `password`. O erro aparece quando o campo foi tocado; o botão "Criar conta" fica
  desabilitado com o formulário inválido e enquanto grava (signal `submitting`). O
  resultado da tela é um signal (`created`, `active`, `pending` ou `failed`). Os
  componentes `app-form-field` e `app-banner`, que o `architecture.md` já lista em
  `shared/ui/`, nascem aqui, porque é a primeira tela com formulário e com aviso.
- **Reenvio.** `AuthService.resendVerification()` não envia nada na E2: devolve
  sucesso e leva `// TODO #20`.
- **Falha.** O `AuthService` converte qualquer erro de rede em um único resultado de
  falha, e a tela mostra o texto do CA9. O `errorInterceptor` global do §2.1 não entra
  aqui: nasce com a primeira história que precise traduzir 401 ou rede no app inteiro.
- **Dados.** O `db.json` ganha `"users": []`.
- **A ratificar no `architecture.md` e no `design-tokens.md`**, numa branch de
  manutenção depois desta história: (a) a `bottom-nav` e a barra de abas do celular
  saem, porque a gaveta do ☰ faz a navegação do celular (§3, §4 e a tabela de
  breakpoints); (b) a "casca pública sem barra de navegação" deixa de existir:
  `/criar-conta` vive dentro da casca (§4); (c) `app-shell` e `app-footer` entram em
  `core/layout/` (§3).

## Tarefas

- [x] **Tarefa 1 — Montar a casca com o palco central**
  - Cobre: CA1
  - Teste primeiro: abre o app na raiz, em `criar-conta` e em um endereço que não
    existe, e prova que o `<main>` com a tela de cadastro fica entre o `app-top-bar` e
    o `app-footer`. Falha antes porque nenhuma dessas peças existe.
  - Arquivos previstos: `apps/web/src/app/core/layout/app-shell/`, `core/layout/top-bar/`,
    `core/layout/footer/`, `features/auth/sign-up/` (só o título da tela),
    `features/auth/auth.routes.ts`, `app.routes.ts`, `app.html`, `app.spec.ts`

- [x] **Tarefa 2 — Abrir e fechar a gaveta no celular**
  - Cobre: CA2
  - Teste primeiro: prova que tocar no ☰ abre a gaveta com o link "Criar conta", que
    tocar no link fecha a gaveta e mostra o cadastro, e que tocar no overlay fecha sem
    mudar de tela. Falha antes porque a gaveta não existe.
  - Arquivos previstos: `core/layout/app-shell/`, `core/layout/side-nav/`,
    `core/layout/top-bar/`

- [ ] **Tarefa 3 — Criar a conta pendente**
  - Cobre: CA3
  - Teste primeiro: preenche nome, e-mail e senha válidos, confirma e prova, com o
    `HttpTestingController`, que sai um `POST /users` com o e-mail normalizado,
    `role: 'member'` e `emailVerified: false`, e que a tela mostra "falta verificar o
    e-mail". Falha antes porque a tela, o service e o modelo não existem.
  - Arquivos previstos: `core/models/user.ts`, `core/data/users.service.ts`,
    `core/auth/auth.service.ts`, `features/auth/sign-up/`, `shared/ui/form-field/`,
    `shared/ui/banner/`, `db.json`

- [ ] **Tarefa 4 — Recusar e-mail fora do domínio**
  - Cobre: CA4
  - Teste primeiro: prova que `ana@gmail.com` e `ana@utfpr.edu.br.exemplo.com` mostram
    "Use o seu e-mail da UTFPR", desabilitam o botão e não geram requisição, e que
    `Ana@UTFPR.edu.br ` é aceito. Falha antes porque o validador não existe.
  - Arquivos previstos: `shared/validators/institutional-email.ts`,
    `features/auth/sign-up/`

- [ ] **Tarefa 5 — Recusar senha fora dos requisitos**
  - Cobre: CA5
  - Teste primeiro: prova que uma senha com menos de 8 caracteres e uma sem letra ou
    sem número mostram a mensagem do requisito que falta, desabilitam o botão e não
    geram requisição. Falha antes porque o validador não existe.
  - Arquivos previstos: `shared/validators/password.ts`, `features/auth/sign-up/`

- [ ] **Tarefa 6 — Avisar que o e-mail já tem conta**
  - Cobre: CA6
  - Teste primeiro: com uma conta ativa em `ANA@utfpr.edu.br`, cadastrar
    `ana@utfpr.edu.br` mostra "Este e-mail já tem conta" com o link "Entrar" e não gera
    `POST`. Falha antes porque o `AuthService` sempre cria.
  - Arquivos previstos: `core/auth/auth.service.ts`, `core/data/users.service.ts`,
    `features/auth/sign-up/`

- [ ] **Tarefa 7 — Avisar conta pendente e reenviar**
  - Cobre: CA7
  - Teste primeiro: com uma conta pendente para o e-mail, confirmar o cadastro mostra
    o aviso de verificação pendente com o botão de reenviar e não gera `POST`; tocar
    em reenviar mostra "E-mail reenviado". Falha antes porque o caso pendente não é
    tratado.
  - Arquivos previstos: `core/auth/auth.service.ts`, `features/auth/sign-up/`

- [ ] **Tarefa 8 — Mostrar a gravação em andamento**
  - Cobre: CA8
  - Teste primeiro: com o `POST` ainda sem resposta, o botão mostra "Criando conta…" e
    está desabilitado, e um segundo toque não gera segunda requisição. Falha antes
    porque o botão continua ativo.
  - Arquivos previstos: `features/auth/sign-up/`

- [ ] **Tarefa 9 — Mostrar a falha da gravação**
  - Cobre: CA9
  - Teste primeiro: com o `POST` falhando (sem rede e erro 500), aparece "Não foi
    possível criar a conta. Tente de novo.", os campos seguem preenchidos e confirmar de
    novo envia outra requisição. Falha antes porque o erro não é tratado.
  - Arquivos previstos: `core/auth/auth.service.ts`, `features/auth/sign-up/`

## Critérios sem tarefa
