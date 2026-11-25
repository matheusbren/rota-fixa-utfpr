# Parecer de Código — Tarefa 7

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no working tree:
- `npm test`: 14 arquivos e 144 testes, todos passando. São 4 a mais que na Tarefa 6: 2 no `fixed-routes.service.spec.ts` e 2 no `route-form.spec.ts`, que são os dois casos do `it.each` em cada arquivo.
- `npm run lint`: "All files pass linting". A saída só apareceu com `rtk proxy`.
- `npx prettier --check` nos 5 arquivos do diff passou. Esse comando só confere, não grava. Todos seguem o `.prettierrc` (§2.3).

Li o diff inteiro (`git diff 5e4d075`) e comparei com o `docs/architecture.md` (§2, §2.1, §3 e §5.3) e com a `.agents/rules/01-angular-strict-rules.md`. O diff tem 5 arquivos: os "Arquivos previstos" da tarefa e o `fixed-routes.service.spec.ts`, que o despacho autorizou.

- **A falha vira resultado dentro do Service (§2.1)** (`fixed-routes.service.ts:43` e `:148`):
  - O `publish` devolve `{ status: 'failed' }` como mais um membro da união `FixedRoutePublication`. O Observable nunca termina em erro.
  - A forma é a mesma do `AuthService.signUp` (`auth.service.ts:49`) e do `findById` deste mesmo Service. É o que o §2.1 manda "até o `errorInterceptor` nascer", e o comentário de `:117-118` cita essa regra.
  - O `errorInterceptor` continuar sem existir está certo. Só esta tela traduz a falha, e o §2.1 só cria o interceptor quando uma história precisar traduzir erro "no app inteiro".
  - A falha não é engolida em silêncio: ela chega à tela como um aviso com `role="alert"`.
  - Como o `publication` nunca recebe erro, o `toSignal` não tem o que relançar. A situação da #23 não se repete.
- **A tela (§2.1, gravação com retorno visível)** (`route-form.ts:151-169` e `route-form.html:169-174`):
  - A única mudança de lógica é o `publication`, que passou de `private` para `protected` para o template poder lê-lo.
  - O `submitting` já estava escrito para a união desde a Tarefa 6: a condição `publication.status === 'published'` faz o `failed` liberar o botão sem nenhum código novo.
  - O `startWith(undefined)` faz a nova tentativa começar sem resultado. Assim, o aviso some e o "Publicando…" volta já no toque.
  - O componente não tem `subscribe()`, a sintaxe é `@if` e o único estado é o que já estava nos signals.
- **Corrida no novo toque:** conferi a janela entre o `submission.set` e a emissão do `toObservable`. Dois toques antes da emissão viram uma emissão só, porque o signal guarda só o último valor. Um toque depois da emissão cai no `exhaustMap`, que ignora envio novo enquanto o anterior está em andamento. Nos dois casos sai um POST só, e o CA10 continua protegido.
- **Camadas (§3):** o diff não acrescenta nenhum import. A tela continua falando com o servidor só pelo `FixedRoutesService`, e a URL vem do `environment` (§5.3).
- **Estilo (regra 2):** a caixa de erro usa só tokens (`border-error`, `bg-danger-soft`, `text-error`, `text-body`), sem valor solto. As classes são as mesmas do `sign-up.html:92` e do `route-detail.html:46`.
- **Testes:**
  - O `fixed-routes.service.spec.ts:84-106` confere o contrato: o Observable não termina em erro e devolve `{ status: 'failed' }`, com rede caída e com 500. O teste não depende de como o `catchError` foi escrito.
  - O `route-form.spec.ts:838-889` lê a tela como a pessoa a vê, pelo `role="alert"`, pelo rótulo dos campos e pelo texto do botão.
    - Ele compara o `formState()` com uma foto tirada antes do toque, em vez de repetir os valores.
    - Ele confere que o corpo da nova tentativa é o mesmo da primeira, a menos do `createdAt`.
    - Ele reaproveita o mesmo nó do botão, que é a proteção que o parecer da Tarefa 6 já tinha elogiado.
  - O `it.each` com `request.error(new ProgressEvent('error'))` e o `flush` com 500 é o mesmo do `sign-up.spec.ts:261`.
  - O `fillInEveryField` (`:586`) é uma extração sem mudança de comportamento: o teste do CA9 (`:771`) continua conferindo o mesmo corpo do POST.
  - O `NEW_ROUTE` do spec do Service é a mesma extração.
  - O `expectNoMessages()` já considerava qualquer `role="alert"` em `main` como aviso do formulário. Agora ele passa a pegar também um aviso de falha que apareça sem motivo nos testes antigos.
- **Processo:**
  - Usei o shell só para ler e conferir: `git diff`, `git log`, `git status`, `cat`, `sed`, `awk`, `grep` e `ls`. Rodei também `npm test`, `npm run lint` e `prettier --check`.
  - Nenhum arquivo foi alterado.

## Sugestões (não bloqueiam)
1. **O `catchError` também pega erro do mapeador, e numa gravação isso pode virar rota repetida** (`fixed-routes.service.ts:143-148`).
   - Ele está depois do `map`. Por isso, qualquer exceção ao montar a resposta vira `failed`, mesmo quando o servidor já gravou a rota. Se a pessoa toca de novo, que é exatamente o que esta tarefa permite, grava uma segunda rota igual.
   - Hoje isso não acontece, porque o json-server sempre devolve o objeto criado e o `toFixedRoute` não lança exceção. Por isso é sugestão.
   - O risco aparece na troca para o Supabase (#20). A API REST dele, por padrão, responde ao POST sem corpo, e aí o `toFixedRoute(null)` lança exceção. Com `Prefer: return=representation`, a resposta vem como lista. Vale conferir esses dois comportamentos na documentação atual (Context7) quando a #20 começar.
   - Saídas possíveis:
     - deixar o `catchError` só em volta do `http.post`, antes do `map`;
     - ou registrar na #20 que o `publish` reescrito precisa diferenciar "não gravou" de "gravou, mas a resposta veio diferente".

## Observações fora do escopo deste diff
- **A caixa de erro tem agora uma terceira cópia** (`route-form.html:171`, além de `sign-up.html:90-95` e `route-detail.html:46`). Não estou apontando de novo: a `tarefa-05-decisoes-r1.md` já decidiu que isso vira manutenção. Fica só a contagem atualizada para a Issue (uma variante de erro no `Banner` de `shared/ui/`).

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.spec.ts
