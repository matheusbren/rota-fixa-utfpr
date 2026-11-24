# Parecer de Conformidade — Tarefa 9

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA9: com a gravação falhando **sem conexão**, aparece "Não foi possível criar a conta. Tente de novo." | atendido | `apps/web/src/app/core/auth/auth.service.ts:37` (`catchError` → `'failed'`), `apps/web/src/app/features/auth/sign-up/sign-up.html:85-92`. Prova: `apps/web/src/app/features/auth/sign-up/sign-up.spec.ts:261` (`request.error(new ProgressEvent('error'))`, ou seja, status 0) e `:279-281` (texto exato do `[role="alert"]`) |
| CA9: com a gravação falhando por **erro do servidor**, aparece a mesma mensagem | atendido | os mesmos pontos do código. Prova: `sign-up.spec.ts:262-266` (500) e `:279-281` |
| CA9: "os campos continuam preenchidos" | atendido | `sign-up.html:44-106`: com `failed` a tela continua no ramo `@else`, então o formulário segue montado e não é resetado. Prova: `sign-up.spec.ts:282-284` confere nome, e-mail e senha nos dois cenários |
| CA9: "posso confirmar de novo" | atendido | `sign-up.ts:48-50`: com `failed`, `submitting()` vale false e o botão volta a habilitar (`sign-up.html:96`). `sign-up.ts:53`: `getRawValue()` cria um objeto novo a cada envio, então o signal emite de novo. A tentativa anterior já terminou, então o `exhaustMap` aceita a nova. Prova: `sign-up.spec.ts:286-294`. Esse trecho toca o botão, espera um novo GET e um **novo** `POST /users` com o mesmo corpo. Se o botão estivesse desabilitado, o clique não enviaria nada e o `expectOne` falharia |
| CA8 na nova tentativa (o botão trava de novo enquanto grava) | atendido | `sign-up.ts:43` (`startWith(undefined)` zera o resultado a cada envio). Sem isso, o `failed` ficaria valendo durante a nova tentativa, o botão continuaria livre e voltaria o risco de conta duplicada. Por isso não conta como escopo inflado: é o que mantém o CA8 valendo depois da falha. Prova: `sign-up.spec.ts:295-296` |
| Abandono: "A conexão cai ou o servidor falha no meio do envio" | atendido | `auth.service.ts:37`: o `catchError` fica no pipe de fora, então pega a falha da busca do e-mail (GET) e a da gravação (POST), como diz o plano ("qualquer erro de rede"). Observação não bloqueante: só a falha do POST tem teste, que é o que o plano pede. O caminho da falha no GET, afirmado no comentário de `auth.service.ts:21-22`, não tem teste próprio, nem em `sign-up.spec.ts` nem em `apps/web/src/app/core/auth/auth.service.spec.ts` |
| Escopo: arquivos previstos no plano | atendido | o diff mexe só em `core/auth/auth.service.ts` e `features/auth/sign-up/` (`.ts`, `.html`, `.spec.ts`), como o plano previa |
| Glossário (`docs/architecture.md` §5.1) | atendido | nenhum termo de domínio novo. O `'failed'` de `SignUpResult` (`auth.service.ts:12`) é o nome que o próprio plano dá ("`created`, `active`, `pending` ou `failed`") |

## Apontamentos

## Testes executados
- `npm test` (raiz): 6 arquivos, **43 testes passando, nenhuma falha**. No modo verbose aparecem os dois casos novos do CA9, os dois passando:
  - `SignUp > avisa que não criou a conta sem conexão, mantém os campos e deixa confirmar de novo`
  - `SignUp > avisa que não criou a conta com erro do servidor, mantém os campos e deixa confirmar de novo`
- `npm run lint` (raiz): "All files pass linting."
- O RED ("Falha antes porque o erro não é tratado") não foi reproduzido. Para isso eu teria de mexer no working tree, o que é proibido para mim. Pela leitura do código, sem o `catchError` o erro HTTP chegaria ao `toSignal` e a leitura de `result()` lançaria exceção, então o teste falharia antes da mudança.

## Arquivos relevantes
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/spec.md
- /home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/plan.md
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/core/auth/auth.service.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.ts
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.html
- /home/vinicius/Projetos/rota-fixa-utfpr/apps/web/src/app/features/auth/sign-up/sign-up.spec.ts

Gravar o parecer em `/home/vinicius/Projetos/rota-fixa-utfpr/specs/1-criar-conta/reviews/tarefa-09-conformidade-r1.md` fica com o fluxo. Não gravei nenhum arquivo: o Bash só rodou `git diff`, `git status`, `ls`, `grep`, testes e lint.
