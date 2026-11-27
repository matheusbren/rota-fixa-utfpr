# Parecer de Código — Tarefa 1

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)
1. **Nenhum lugar trata a falha do GET `/campuses`, e o erro chega cru ao template** — `apps/web/src/app/features/driver/route-form/route-form.ts:25`, `apps/web/src/app/core/data/campuses.service.ts:18-20`
   Regra violada: `docs/architecture.md` §2.1, no item do `errorInterceptor`: "Até ele nascer, o Service converte a falha no resultado que a tela espera, como o `AuthService` faz no cadastro (US01)". O `list()` devolve o erro do `HttpClient` do jeito que ele vem. A página o entrega direto ao `toSignal`, sem `catchError` e sem estado de erro. Isso fere também o PRD §7, que o §2.1 usa como régua das mensagens: "Qualquer ação que exija rede e falhe avisa explicitamente — nunca falha em silêncio".
   Prejuízo concreto:
   - O GET falha sempre que o json-server está desligado ou o celular está sem rede. O `ngsw-config.json` não tem `dataGroup`, então o service worker não guarda `/campuses`.
   - O `toSignal` guarda o `HttpErrorResponse` e o lança de novo a cada leitura de `campuses()`. Com isso, toda passada da detecção de mudanças da página para no `@for` do `<select>` (`route-form.html:11`).
   - Tudo o que vem depois no template deixa de atualizar: o `[disabled]` do botão (`route-form.html:106`) e as mensagens de campo que as Tarefas 2 a 4 vão colocar ali.
   - A pessoa vê o select só com "Escolha o campus". Ela não consegue publicar e não recebe aviso nenhum, porque o erro só aparece no console.
   - Nenhuma tarefa seguinte do plano cobre esse caminho. A Tarefa 7 trata a falha do envio, não a da leitura dos câmpus.
   - A spec não traz o texto do aviso. Cabe à triagem decidir se ele entra na spec ou numa Issue. O que este apontamento cobra é que a falha vire um resultado que a tela entende, e não uma exceção dentro do template.

Rodei os testes e o lint no working tree:
- `npm test`: 7 arquivos, 46 de 46 testes passando. Entre eles estão os 3 novos do `route-form.spec.ts`: o CA1 e as duas saídas do CA17.
- `npm run lint`: "All files pass linting".

Conferi o diff inteiro (`git diff 9e2bf09`, 9 arquivos) contra o `docs/architecture.md` (§2, §2.1, §3, §4, §5.1 e §5.3) e a `.agents/rules/01-angular-strict-rules.md`. Fora o item acima, nada reprova:
- **Camadas (§2.1 e §3):**
  - O `RouteForm` injeta só o `CampusesService`. Só o Service conhece o `HttpClient` e a URL, e o mapeador `toCampus` fica ao lado dele.
  - A feature importa só de `core/data/` e de `shared/ui/`.
  - Nada em `core/` importa de `features/`. O menu conhece `/minhas-rotas/nova` apenas como texto.
- **Rotas (§3 e §4):** a feature expõe o `driverRoutes`, carregado por `loadChildren` e declarado antes do filho `''` de auth. Era o que a sugestão do parecer da Tarefa 1 da US01 pedia.
- **Sintaxe:** o diff usa `inject()`, `toSignal()`, Reactive Forms (`FormBuilder.nonNullable`) e `@for` com `track`. Não há `standalone: true`, decorator `@Input`/`@Output`, injeção por construtor, `any`, `subscribe()` manual nem `*ng…`.
- **URL e segredo (§5.3):**
  - O Service e o teste leem `environment.apiUrl`.
  - A senha da pessoa de exemplo no `db.json` é a simulação que o §2.1 aceita para dados fictícios.
- **Modelo (§5.1):**
  - `Campus` tem `id`, `name` e `city`.
  - As coleções `campuses` e `fixed_routes` têm o nome das tabelas.
  - O `id` é string.
- **Estilo:**
  - Só tokens: `text-title-1`, `text-label`, `text-body`, `text-button`, `outline-focus`, `bg-disabled` e `text-text-disabled`.
  - Não há `.css` por componente nem `style=`.
- **Teste:**
  - Acha cada campo pelo rótulo, cada grupo pela legenda e o botão pelo texto.
  - Confere o contrato pelo `HttpTestingController` e fecha com `verify()`.
  - Não lê estado interno do componente.

## Sugestões (não bloqueiam)
- **O teste do `driver` depende da tela de cadastro** (`route-form.spec.ts:64-67` e `:216`).
  - O spec sobe o `app.routes` de verdade, começa em `/criar-conta` e sai da tela pelo link "Criar conta". Assim, o `SignUp` de `features/auth` é carregado e montado dentro do teste de outra feature. O `app-shell.spec.ts:7` evita isso de propósito, com telas de mentira no palco.
  - Prejuízo provável: uma mudança no cadastro pode quebrar o CA1 e o CA17 sem que nada do `route-form` tenha mudado.
    - Se o cadastro passar a fazer um GET ao abrir, falham o `verify()` do `afterEach` (`:74`) e o do `closeTabAndReopen` (`:188`).
    - Quando a #2 tirar "Criar conta" do menu de quem tem sessão, a saída "pelo menu" fica sem o link.
  - O CA1 pede a abertura "pelo menu", então a casca e a rota real do `driver` precisam ficar. Só a outra ponta da saída pode mudar, de dois jeitos:
    - usar o link "Minhas rotas" quando a Tarefa 10 o criar;
    - ou montar as rotas do teste com a casca, o `driverRoutes` e uma tela de mentira em `criar-conta`.
- **O `expectNoMessages()` ainda não consegue falhar** (`route-form.spec.ts:157-160`).
  - Hoje a tela não tem mensagem nenhuma, então as duas checagens passam sem conferir nada.
  - Elas só protegem o CA1 e o CA17 se as Tarefas 2 a 4 puserem `aria-invalid="true"` em todo campo com erro e `role="alert"` em todo aviso.
  - Os avisos do CEP ("Não achamos este CEP…" e "Não deu para buscar o CEP agora…") não invalidam o campo (CA8). Se saírem como texto simples ou com `role="status"`, o "sem mensagens" do CA17 não os vê.
  - Vale fixar essa convenção na Tarefa 2, ou conferir também os textos conhecidos.
- **A rota `/minhas-rotas` entra sem o `authGuard` e sem a dívida declarada** (`app.routes.ts:13-16`).
  - O §4 põe `authGuard` em `/minhas-rotas` e em `/minhas-rotas/nova`. O guard ainda não existe porque a entrada é a #2 (spec, "Assume que"), e isso está certo.
  - O próprio `app.routes.ts` já marca as dívidas da #2 e da #5 com `// TODO #<issue>` (linhas 5 e 23), e o auditor final procura essas marcas.
  - O `TODO #2` previsto para a Tarefa 6 fica no `AuthService` e marca a pessoa de exemplo, não o guard. Sem uma linha aqui, quem fizer a #2 não encontra no código o aviso de que esta rota precisa do guard.
- **O sentido perde o tipo do modelo** (`route-form.ts:36`).
  - `direction: 'to_campus'` vira `FormControl<string>`, mas o §5.1 fixa `to_campus | from_campus`.
  - O TypeScript estrito vai cobrar isso na Tarefa 6, ao montar a `FixedRoute`. Tipar o controle com a união quando o modelo nascer (Tarefa 5) evita que essa cobrança vire um `as` no envio.
- **Terceira cópia dos ajudantes de teste** (`route-form.spec.ts:76-80`, `:97-103` e `:171-181`).
  - `tap`, `field`, `fillIn` e `leave` já existem quase iguais no `sign-up.spec.ts`, e o `tap` também no `app-shell.spec.ts`.
  - Ainda não pesa. Mas a próxima mudança no jeito de achar o campo vai ter de ser feita em três lugares, e o `field` daqui já difere: é genérico e restrito ao `main`.
  - É candidato a um ajudante comum, numa Issue de manutenção.

## Observações fora do escopo deste diff
- **O plano diverge do mapa de componentes do §3.**
  - A linha de `features/driver/` lista `direction-toggle` e `seat-stepper` como caixas do `route-form`. O `plan.md` não prevê nenhum dos dois, e este diff segue o plano: o Sentido é um par de `radio` e as Vagas são um `input type="number"`.
  - O plano cria um `weekday-picker` em `shared/ui/` que não está no mapa, onde aparece o `weekday-strip`.
  - O §3 diz "A árvore acima é o contrato". Convém ratificar no fechamento da história, atualizando o §3 ou o plano. Assim nenhum agente cria um `direction-toggle` por conta própria quando a edição da rota chegar (US11).
- **O anel de foco se repete em cada controle.**
  - `focus:outline-3 focus:outline-offset-2 focus:outline-focus`, ou a versão `focus-visible:`, aparece em 16 linhas dos templates. O padrão veio da US01, e o diff só o segue.
  - Hoje, mudar o estado de foco do `design-tokens.md` significa editar todas essas linhas.
  - É candidato a uma Issue de manutenção que leve esse estado uma vez só para o `styles.css`.
