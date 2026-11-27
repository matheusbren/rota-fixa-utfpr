# Parecer de Código — Tarefa 8

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no working tree, pelo `rtk proxy`:
- `npm test`: 15 arquivos e 160 testes, todos passando. Em relação à Tarefa 7 são 1 arquivo e 16 testes a mais: 9 no `find-conflict.spec.ts`, que é novo, 5 no `fixed-routes.service.spec.ts` e 2 no `route-form.spec.ts`.
- `npm run lint`: "All files pass linting".
- `npx prettier --check` nos 7 arquivos do diff passou. Esse comando só confere, não grava.

Li o diff inteiro (`git diff 8fda488`, pelo `rtk proxy` para vir completo) e comparei com o `docs/architecture.md` (§2, §2.1, §3, §5.1 e §5.3) e com a `.agents/rules/01-angular-strict-rules.md`. O diff tem 7 arquivos, exatamente os "Arquivos previstos" da tarefa. O `db.json` não foi tocado.

- **A regra é uma função pura (ID33)** (`find-conflict.ts:16-26`):
  - O `findConflict` não injeta nada, não conhece URL nem relógio e só importa de `core/models/`. Ele recebe a rota nova e as rotas ativas e devolve a primeira que conflita, ou `undefined`.
  - Ele fica ao lado do `FixedRoutesService`, como o plano decidiu. O teste fica ao lado dele e roda sem `TestBed`, como pedem o ID33 e o §2 ("Testes e lint").
  - O teste cobre as duas bordas, para antes e para depois. Com 59 minutos de diferença (`08:29` e `06:31`) a rota é recusada; com 60 (`08:30` e `06:30`), aceita. Cobre também o mesmo horário, dias sem nada em comum, um único dia em comum e a escolha da primeira rota entre várias.
  - O limite de 60 minutos virou a constante `MINIMUM_GAP_MINUTES`, com o motivo no comentário.
  - O `minutesOf` lê só as horas e os minutos. Assim o `time` do Postgres na E3, que chega como `"07:30:00"`, dá o mesmo resultado sem mudar a regra.
  - Procurei outra conta de horário no repositório (`split(':')`, `* 60`) e não achei. A regra não está duplicada.
- **O Service confere antes de gravar (§2.1)** (`fixed-routes.service.ts:121-127` e `:164-178`):
  - O `publish` busca as rotas ativas do motorista, chama a regra pura e só faz o POST quando não há conflito. É o que o §2.1 manda para a E2 ("o Service confere antes de gravar").
  - O comentário de `:133-135` registra que na E3 a conferência vai para o banco e a tela não muda.
  - O conflito entrou como mais um membro da união `FixedRoutePublication` (`:40-51`), como o comentário da Tarefa 7 tinha anunciado. A tela continua recebendo um resultado só, nunca o erro técnico.
  - Os testes do Service provam a ordem:
    - com conflito, `expectNone` do POST (`fixed-routes.service.spec.ts:149`);
    - sem conflito, o POST sai (`:160`);
    - com a busca sem conexão ou com 500, nada é gravado e o resultado é `failed`, sem erro no Observable (`:176`).
  - Se o POST saísse em paralelo com a busca, o primeiro desses testes quebraria.
  - O `catchError` passou para depois do `switchMap`, por isso pega também a falha da busca, que é o que o teste de `:176` pede. Ele também pega o erro do mapeador, mas isso já foi registrado para a #20 e não aponto de novo.
  - O `findActiveByDriver` passa pelo mapeador `toFixedRoute` (§2.1). Os filtros vão em `params`, e o `HttpParams` codifica o id.
  - Conferi no `parse-where.js` do json-server 1.0.0-beta.15: parâmetro sem operador vira igualdade (`eq`). Ou seja, o `?driverId=…&status=active` filtra como o comentário diz.
- **A tela** (`route-form.html:171-183`, `route-form.ts:11` e `:75`):
  - O componente não ganhou lógica. O `submitting` (`route-form.ts:165-171`) já libera o botão para qualquer resultado que não seja `published`, então o conflito libera o botão sem código novo. O `effect` da navegação só reage a `published`.
  - O `exhaustMap` cobre o `publish` inteiro, a busca e a gravação. Por isso o segundo toque durante a conferência também é ignorado. O teste de `route-form.spec.ts:960` mostra "Publicando…" e o botão bloqueado antes de a busca responder (CA10).
  - Os dias são formatados pelo `WeekdaysPipe` de `shared/pipes/`, que a feature pode importar (§3), e Pipe é o padrão do §2 para formatação. O texto do aviso não é montado no TypeScript.
  - O template usa `@if`/`@else if` com `@let`. Não há `subscribe()` nem estado novo fora de signals.
  - A caixa usa só tokens do tema (`border-error`, `bg-danger-soft`, `text-error`, `text-body`).
- **Os testes da tela** (`route-form.spec.ts:940` e `:960`):
  - A rota nova tem bairro, dias e horário diferentes dos da rota do Centro. Assim o texto do aviso só confere se os dados vierem da rota que conflita, não do formulário.
  - Os testes leem a tela pelo `role="alert"`, pelos rótulos e pelo texto do botão. O `afterEach` com `verify()` garante que nenhuma outra requisição saiu.
  - Nos testes antigos do envio, a única mudança é o `answerActiveRoutes([])` antes do POST. O que eles conferem não mudou.
- **Processo:**
  - Usei o shell só para ler: `git status`, `git diff`, `git log`, `cat`, `sed`, `grep` e `ls`, inclusive no `json-server` do `node_modules`.
  - Rodei também `npm test`, `npm run lint` e `prettier --check`.
  - Nenhum arquivo foi alterado.

## Sugestões (não bloqueiam)
1. **Os testes dependem da ordem dos parâmetros da busca** (`fixed-routes.service.spec.ts:19` e `route-form.spec.ts:38`).
   - As duas constantes escrevem a URL com `driverId` antes de `status`. O `expectOne({ url })` compara o endereço inteiro, parâmetros incluídos.
   - Se alguém trocar a ordem das chaves em `fixed-routes.service.ts:125`, o json-server recebe a mesma busca, mas os dois specs falham com "nenhuma requisição encontrada".
   - É a primeira busca com parâmetros do app. A Tarefa 10 ("Minhas rotas") vai usar o mesmo método e tende a copiar a constante.
   - Saída: conferir com um predicado (`req.url === FIXED_ROUTES_URL && req.params.get('driverId') === … && req.params.get('status') === 'active'`). Isso cabe nos dois `answerActiveRoutes` e em `fixed-routes.service.spec.ts:181`, que já concentram o uso.
   - É sugestão porque o prejuízo é pequeno: a falha aparece na hora e o conserto são poucas linhas.
2. **O `findActiveByDriver` deixa o erro passar, e a Tarefa 10 vai ligá-lo a uma tela** (`fixed-routes.service.ts:123-127`).
   - Hoje o único chamador é o `publish`, que converte a falha em `failed` (`:177`). Por isso não há prejuízo agora.
   - O CA16 pede "Não foi possível carregar as suas rotas. Tente de novo." A exceção decidida na Tarefa 4 (quem chama traduz a falha) vale só para API de terceiros, como o ViaCEP. Para a API do próprio app, o §2.1 manda o Service converter a falha, como o `findById` faz neste mesmo Service.
   - Vale decidir isso na Tarefa 10, entre dois caminhos:
     - a busca devolve uma união com `failed`, como o `findById`, e o `publish` passa a ler essa união;
     - ou a busca crua fica privada, só para o `publish`, e nasce outro método para a tela.
   - Sem isso, a tela que ligar o método num `toSignal` sem `catchError` cai no caso já registrado na #23.
3. **A RN05 é a mesma regra, mas o comentário só cita o CA12** (`find-conflict.ts:13-15`).
   - A RN05 do PRD proíbe ao passageiro duas assinaturas ativas no mesmo dia com menos de 60 minutos entre as saídas. É a mesma conta, feita sobre as rotas assinadas.
   - A função já está em `core/` e recebe `FixedRoute`, então a US07 (assinar) pode reaproveitá-la.
   - Uma linha no comentário citando a RN05 ajuda quem fizer a US07 a achar a função antes de escrever outra em `features/search/`.
   - Prejuízo provável sem essa linha: uma segunda cópia da regra dos 60 minutos, que pode divergir justamente na borda (`<` contra `<=`).

## Observações fora do escopo deste diff
- **Agora são quatro cópias da caixa de erro**: duas no `route-form.html` (`:173` e `:179`), mais as do `sign-up.html` e do `route-detail.html`. Não aponto de novo, porque a manutenção já foi decidida na Tarefa 5. Fica só a contagem atualizada para a Issue.
- **Filtro do json-server com valor só de dígitos.** O `coerceValue` do `parse-where.js` transforma em número o valor de filtro que só tem dígitos.
  - Por isso, um id escrito à mão no `db.json` como `"1"` não casa com `?driverId=1`: a busca volta vazia, a conferência não acha conflito e "Minhas rotas" sai vazia.
  - Os ids de hoje não caem nesse caso: o `sample-user` e os que o json-server gera, de 11 caracteres em base64url, que na prática nunca são só dígitos.
  - Candidata a uma linha no §2 (notas do json-server) no fechamento: id escrito à mão no `db.json` não pode ser só dígitos.

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/find-conflict.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/fixed-routes.service.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.html
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts
