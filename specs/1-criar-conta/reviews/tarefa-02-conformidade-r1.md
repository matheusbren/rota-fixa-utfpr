# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1: "Dado que abro o app na raiz, em `/criar-conta` ou em um endereço que não existe, quando a página carrega, então vejo a tela de cadastro no palco central, entre o cabeçalho (em cima) e o rodapé (embaixo)." (precisa continuar valendo depois da gaveta) | atendido | `apps/web/src/app/core/layout/app-shell/app-shell.html:10-16`: o `drawer-content` mantém a ordem `app-top-bar`, `<main>` com o outlet e `app-footer`, e o `drawer-side` vem depois, fora do palco. O teste `apps/web/src/app/app.spec.ts:19-41` continua passando nos três endereços. |
| CA2, parte 1: "quando toco no ☰ do cabeçalho, então a gaveta abre com o link 'Criar conta'" | atendido | O botão ☰ (`aria-label="Abrir menu"`) está em `apps/web/src/app/core/layout/top-bar/top-bar.html:4-11` e emite `menuOpen` (`top-bar.ts:8`). A emissão chega a `openDrawer()` (`app-shell.html:11`, `app-shell.ts:19-21`), e o signal marca o `.drawer-toggle` (`app-shell.html:2-9`). O link vem de `app-shell.ts:15` e é desenhado em `side-nav/side-nav.html:5-11`, dentro do `.drawer-side` (`app-shell.html:17-20`). O teste está em `app-shell.spec.ts:69-76`. |
| CA2, parte 2: "quando toco no link, então a gaveta fecha e a tela de cadastro aparece" | atendido | O link tem `routerLink` e `(click)="linkSelect.emit()"` (`side-nav.html:7,10`), e a emissão chega a `closeDrawer()` (`app-shell.html:19`, `app-shell.ts:23-25`). O teste `app-shell.spec.ts:79-86` parte de `/outra-tela` e verifica que a gaveta fechou, que a URL é `/criar-conta` e que o palco mostra o cadastro. A tela no palco é de mentira, mas o caminho vem do `navLinks` real. Que `/criar-conta` mostra o `app-sign-up` de verdade, quem prova é o `app.spec.ts:19-41`. |
| CA2, parte 3: "quando toco fora da gaveta, então ela fecha e a tela continua como estava" | atendido | O overlay é `<label for="app-drawer" class="drawer-overlay">` (`app-shell.html:18`), e o `(change)` devolve o estado do checkbox ao signal (`app-shell.html:8`). O teste `app-shell.spec.ts:89-100` verifica que a gaveta fecha, que a URL e o título do palco não mudam e que o ☰ volta a abrir depois do overlay. |
| Abandono no meio: "Abre a gaveta e desiste. Toca fora dela sem escolher nada." | atendido | É a mesma prova da parte 3 do CA2 (`app-shell.spec.ts:89-100`). O fechamento por Esc (`app-shell.ts:11`, teste em `app-shell.spec.ts:103-112`) não é escopo inflado: é o mesmo gesto de desistir, feito pelo teclado. Ele vem da decisão "Estado da gaveta" do `plan.md` ("para o link, o overlay e a tecla Esc poderem fechá-la") e atende ao PRD §7 ("Navegação completa por teclado"). |
| Fora de escopo: "hoje o menu só tem 'Criar conta'" | atendido | `app-shell.ts:15` tem um item só. |
| CA3: o cadastro válido grava a conta como pendente e avisa que falta verificar o e-mail | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA4: o e-mail fora do domínio UTFPR mostra "Use o seu e-mail da UTFPR" e desabilita o botão | fora desta tarefa | Tarefa 4 do `plan.md` |
| CA5: a senha fora dos requisitos mostra o requisito que falta e desabilita o botão | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA6: o e-mail com conta ativa mostra "Este e-mail já tem conta" com o link "Entrar" | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA7: o e-mail com conta pendente mostra o aviso e "Reenviar e-mail de verificação" | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA8: durante a gravação, o botão mostra "Criando conta…" e fica bloqueado | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA9: se a gravação falha, aparece a mensagem de erro, os campos ficam preenchidos e é possível tentar de novo | fora desta tarefa | Tarefa 9 do `plan.md` |

Evidência dos testes: `npm test` passou com 2 arquivos e 7 de 7 testes: os 3 do CA1 em `app.spec.ts` e os 4 da gaveta em `app-shell.spec.ts`. O diff mexe só nos arquivos previstos pela Tarefa 2 (`core/layout/app-shell/`, `core/layout/side-nav/`, `core/layout/top-bar/`). Os nomes `top-bar` e `side-nav` são os da tabela do §3 do `docs/architecture.md`.

## Apontamentos
