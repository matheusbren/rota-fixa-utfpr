# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1: "Dado que abro o app na raiz, em `/criar-conta` ou em um endereço que não existe, quando a página carrega, então vejo a tela de cadastro no palco central, entre o cabeçalho (em cima) e o rodapé (embaixo)." (tem que continuar valendo com a gaveta) | atendido | `apps/web/src/app/core/layout/app-shell/app-shell.html:12-18`: o `drawer-content` mantém a ordem `app-top-bar`, `<main>` com o outlet e `app-footer`. O `drawer-side` (`app-shell.html:19-22`) fica depois e fora do palco. O teste `apps/web/src/app/app.spec.ts:19-41` continua passando nos três endereços. |
| CA2, parte 1: "quando toco no ☰ do cabeçalho, então a gaveta abre com o link 'Criar conta'" | atendido | O botão ☰ (`aria-label="Abrir menu"`) está em `apps/web/src/app/core/layout/top-bar/top-bar.html:4-11` e emite `menuOpen` (`top-bar.ts:8`). A emissão chega a `openDrawer()` (`app-shell.html:13`, `app-shell.ts:19-21`), e o signal marca o `.drawer-toggle` (`app-shell.html:9`). O link vem de `app-shell.ts:15` e é desenhado em `side-nav/side-nav.html:5-12`, dentro do `.drawer-side` (`app-shell.html:19-22`). Teste: `app-shell.spec.ts:77-84`. |
| CA2, parte 2: "quando toco no link, então a gaveta fecha e a tela de cadastro aparece" | atendido | O link tem `routerLink` e `(click)="linkSelect.emit()"` (`side-nav.html:7,10`), e a emissão chega a `closeDrawer()` (`app-shell.html:21`, `app-shell.ts:23-25`). O teste `app-shell.spec.ts:87-94` parte de `/outra-tela` e verifica três coisas: a gaveta fechou, a URL é `/criar-conta` e o palco mostra o cadastro. O caminho testado vem do `navLinks` real. Quem prova que `/criar-conta` mostra o `app-sign-up` de verdade é o `app.spec.ts:19-41`. |
| CA2, parte 3: "quando toco fora da gaveta, então ela fecha e a tela continua como estava" | atendido | O overlay é `<label for="app-drawer" class="drawer-overlay">` (`app-shell.html:20`), e o `(change)` devolve o estado do checkbox ao signal (`app-shell.html:10`). O teste `app-shell.spec.ts:97-108` verifica que a gaveta fecha, que a URL e o título do palco não mudam e que o ☰ volta a abrir depois do overlay. Com `tabindex="-1"` e `aria-hidden="true"` no `<input>`, o toque no `<label>` continua marcando e desmarcando o checkbox, e o teste segue verde. |
| Abandono no meio: "Abre a gaveta e desiste. Toca fora dela sem escolher nada." | atendido | A prova é a mesma da parte 3 do CA2 (`app-shell.spec.ts:97-108`). O fechamento por Esc (`app-shell.ts:11`, teste em `app-shell.spec.ts:111-120`) é o mesmo gesto de desistir, feito pelo teclado. Ele vem da decisão "Estado da gaveta" do `plan.md` ("para o link, o overlay e a tecla Esc poderem fechá-la"), então não é escopo inflado. |
| Apontamento 1 aceito na rodada 1 (`tarefa-02-decisoes-r1.md`), com base no PRD §7: "Navegação completa por teclado". O `.drawer-toggle` não pode ser parada de Tab nem ser anunciado | atendido | `app-shell.html:7-8` (`tabindex="-1"` e `aria-hidden="true"`). O teste `app-shell.spec.ts:124-129` exige que a primeira parada de Tab seja o ☰ e que o checkbox tenha `aria-hidden="true"`. Sem a correção ele falharia: o `<input>` é o primeiro focável no documento e teria `tabIndex` 0. A correção só remove um defeito: não acrescenta comportamento nem muda o CA2. |
| Fora de escopo: "hoje o menu só tem 'Criar conta'" | atendido | `app-shell.ts:15` tem um item só. |
| CA3: o cadastro válido grava a conta como pendente e avisa que falta verificar o e-mail | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA4: o e-mail fora do domínio UTFPR mostra "Use o seu e-mail da UTFPR" e desabilita o botão | fora desta tarefa | Tarefa 4 do `plan.md` |
| CA5: a senha fora dos requisitos mostra o requisito que falta e desabilita o botão | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA6: o e-mail com conta ativa mostra "Este e-mail já tem conta" com o link "Entrar" | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA7: o e-mail com conta pendente mostra o aviso e "Reenviar e-mail de verificação" | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA8: durante a gravação, o botão mostra "Criando conta…" e fica bloqueado | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA9: se a gravação falha, aparece a mensagem de erro, os campos ficam preenchidos e é possível tentar de novo | fora desta tarefa | Tarefa 9 do `plan.md` |

**Testes:** `npm test` passou com 2 arquivos e 8 de 8 testes: os 3 do CA1 em `app.spec.ts` e os 5 da gaveta em `app-shell.spec.ts`, um deles novo nesta rodada.

**Diff:** o diff completo contra `e32672e` mexe em 7 arquivos, todos nas pastas que a Tarefa 2 previu (`core/layout/app-shell/`, `core/layout/side-nav/`, `core/layout/top-bar/`). O diff não cria nenhum termo de dados do glossário. Os seletores `app-top-bar` e `app-side-nav` são os do §3 do `docs/architecture.md`.

## Apontamentos
