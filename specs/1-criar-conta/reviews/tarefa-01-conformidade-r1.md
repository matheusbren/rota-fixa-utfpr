# Parecer de Conformidade — Tarefa 1

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — "Dado que abro o app na raiz, em `/criar-conta` ou em um endereço que não existe, quando a página carrega, então vejo a tela de cadastro no palco central, entre o cabeçalho (em cima) e o rodapé (embaixo)." | atendido | `apps/web/src/app/app.routes.ts:6` (raiz → `criar-conta`), `apps/web/src/app/app.routes.ts:7-16` (casca pai com `loadChildren`), `apps/web/src/app/app.routes.ts:18` (coringa → `criar-conta`); `apps/web/src/app/core/layout/app-shell/app-shell.html:2-6` (`app-top-bar`, `<main>` com o outlet, `app-footer`); `apps/web/src/app/features/auth/auth.routes.ts:4`; `apps/web/src/app/features/auth/sign-up/sign-up.html:1`; o teste está em `apps/web/src/app/app.spec.ts:19-41` (3 de 3 passando no `npm test`) |
| CA2 — a gaveta do ☰ abre com "Criar conta", fecha ao tocar no link e fecha ao tocar fora | fora desta tarefa | Tarefa 2 do `plan.md` |
| CA3 — o cadastro válido grava a conta como pendente e avisa que falta verificar o e-mail | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA4 — o e-mail fora do domínio UTFPR mostra "Use o seu e-mail da UTFPR" e desabilita o botão | fora desta tarefa | Tarefa 4 do `plan.md` |
| CA5 — a senha fora dos requisitos mostra o requisito que falta e desabilita o botão | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA6 — o e-mail com conta ativa mostra "Este e-mail já tem conta" com o link "Entrar" | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA7 — o e-mail com conta pendente mostra o aviso e "Reenviar e-mail de verificação" | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA8 — durante a gravação, o botão mostra "Criando conta…" e fica bloqueado | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA9 — se a gravação falha, aparece a mensagem de erro, os campos ficam preenchidos e é possível tentar de novo | fora desta tarefa | Tarefa 9 do `plan.md` |

## Apontamentos

