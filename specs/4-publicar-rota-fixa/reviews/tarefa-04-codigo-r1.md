# Parecer de Código — Tarefa 4

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum.

Rodei os testes e o lint no working tree:
- `npm test`: 11 arquivos, 121 de 121 testes passando. São 33 a mais que na Tarefa 3:
  - 6 no `postal-code.service.spec.ts`, que é novo;
  - 13 no `postal-code.spec.ts`, que é novo;
  - 14 no `route-form.spec.ts`.
- `npm run lint`: "All files pass linting". A saída só apareceu com `rtk proxy`.
- `npx prettier --check` nos 7 arquivos, um comando que só confere e não grava: todos seguem o `.prettierrc` (§2.3).

Conferi o diff inteiro (`git diff 83abddd`) contra o `docs/architecture.md` (§2, §2.1, §2.2, §3 e §5.3) e a `.agents/rules/01-angular-strict-rules.md`. São 7 arquivos, todos previstos na tarefa.

- **`effect()` (ID13)** (`route-form.ts:137-149`):
  - É o uso que o §2 reserva ao `effect()`: um efeito colateral. Ele escreve num controle do formulário reativo, que é uma API fora dos signals. Não deriva estado de signal, que seria trabalho de `computed`.
  - Ele lê um signal só, o `postalCodeLookup`. Conferi no `@angular/forms` 22.2.4 (`forms.mjs:882-931`): os getters e setters de `status`, `pristine` e `touched` passam por `untracked`. Por isso o `setValue` e o `markAsDirty` dentro do effect não o inscrevem no estado do Bairro.
  - Se o inscrevessem, cada edição da pessoa no Bairro dispararia o effect de novo e escreveria o bairro do ViaCEP por cima. O teste "deixa editar o Bairro preenchido pelo CEP" prova o caso da edição seguida da saída do campo.
  - Não há laço: nada no effect muda o CEP, e nada lê o `valueChanges` do Bairro.
  - O effect nasce no construtor e morre com a tela, junto com os dois `toSignal`. O CA17 continua passando.
- **Ponte `toSignal`/`toObservable` (ID25)** (`route-form.ts:105-129`):
  - Segue o §2.1: "usa `toObservable()` quando um signal precisa disparar uma busca", com `switchMap`. O resultado volta à tela por `toSignal`, e o componente não tem `subscribe()`.
  - A ida e volta (`valueChanges` → signal → Observable) tem ganho; não é indireção sem motivo.
    - O `computed` `postalCodeToLookUp` é o único lugar que decide o que se busca.
    - Ele também segura os valores repetidos. Enquanto o CEP está incompleto, cada tecla dá `undefined`, o `computed` não muda e o `switchMap` não recebe nada.
    - Um `valueChanges` ligado direto no `switchMap` precisaria de um `distinctUntilChanged` para ter o mesmo efeito.
  - O `debounceTime` do exemplo do §2.1 não faz falta aqui: a busca só sai com os 8 números, e não a cada tecla.
  - O `switchMap` cancela a busca anterior, como mostra o teste "cancela a busca do CEP anterior".
  - A falha vira `{ status: 'failed' }` dentro do `switchMap`. Assim o `toSignal` nunca guarda um erro, o que evita o defeito da #23. A falha também não passa em silêncio: vira o aviso do CA8.
- **Camadas (§2.1 e §3):**
  - Só o `PostalCodeService` conhece o `HttpClient`, o endereço do ViaCEP e o formato da resposta.
  - Os nomes em português da resposta (`bairro`, `erro`) ficam no `ViaCepResponse` e no mapeador `toPostalCodeLookup`, ao lado do Service.
  - A tela recebe o `PostalCodeLookup`, em inglês. O Service exporta esse tipo do mesmo jeito que o `AuthService` exporta o `SignUpResult`.
  - `shared/validators/postal-code.ts` importa só de `@angular/forms`. A regex do formato existe uma vez só, e dois lugares a usam: o validador e o `isPostalCode`, que decide quando buscar.
  - A feature importa de `core/data/` e de `shared/`. Nada de `core/` importa de `features/`.
- **Decisões das triagens anteriores:**
  - O corte do bairro em 60 caracteres usa a mesma constante do `[maxlength]` do template (`route-form.ts:103`, `route-form.html:84`). O limite agora mora num lugar só.
  - Os avisos da busca não marcam o campo. Os testes os conferem pelo texto, como decidiu a triagem da Tarefa 1.
- **Duplicação:**
  - Procurei `replace(`, `\d{5}`, `viacep` e `catchError` em `apps/web/src`. O formato do CEP e o endereço do ViaCEP só existem neste diff.
  - A URL que se repete nos dois specs é o contrato esperado, e o teste deve escrevê-la por conta própria.
- **Sintaxe:**
  - O diff usa `inject()`, `@Service()`, `computed`, `effect`, `toSignal`, `toObservable`, `@let`, `@if`/`@else if`, Reactive Forms e `ValidatorFn` tipado.
  - Não há `any`, `*ng…`, `standalone: true`, decorator `@Input`/`@Output`, injeção pelo construtor nem `subscribe()` em componente.
  - O `constructor()` só cria o effect. O `subscribe` do `postal-code.service.spec.ts` está no teste, não no componente.
- **Estilo (§2.2):** só tokens (`text-caption`, `text-error`, `text-text-muted`). Não há `.css` por componente nem `style=`.
- **Testes:**
  - Quem faz o papel do ViaCEP é o `HttpTestingController`, e nenhum teste sai para a internet. Os dois specs fecham com `verify()` no `afterEach`.
  - Os testes da tela acham o campo pelo rótulo e o aviso pela descrição acessível. Não leem o `FormGroup` nem os signals do componente.
  - As duas falhas (sem conexão e 503) são testadas no Service e na tela.
- **Processo:**
  - Além do diff, dos testes, do lint e do `prettier --check`, usei o shell só para ler: `git status`, `git log`, `cat`, `sed`, `grep` e `find`, inclusive no `@angular/forms` do `node_modules`.
  - Nenhum arquivo foi alterado.

## Sugestões (não bloqueiam)
1. **A tela traduz a falha da busca, e o §2.1 manda o Service fazer isso** (`route-form.ts:58-59` e `:126`, `postal-code.service.ts:28-35`, `postal-code.service.spec.ts:75-91`).
   - O §2.1 diz: "Até ele [o `errorInterceptor`] nascer, o Service converte a falha no resultado que a tela espera, como o `AuthService` faz no cadastro (US01)".
   - Aqui o `lookup()` deixa o erro passar, e a tela cria o estado `failed` (`PostalCodeLookupState`) com um `catchError`. É o primeiro `catchError` dentro de um componente no app.
   - O diff segue o plano à risca: "A falha de rede chega como erro do `Observable`, e a tela a traduz (CA8)". Quem diverge do §2.1 é o plano, não a implementação.
   - Não bloqueia porque hoje não há prejuízo: o único chamador trata o erro, e a edição da rota (US11) reaproveita a mesma tela.
   - O risco fica para o próximo chamador. O tipo `Observable<PostalCodeLookup>` não mostra que a busca pode falhar. Quem ligar o `lookup()` num `toSignal` sem `catchError` repete o defeito da #23: o `toSignal` guarda o erro e o lança de novo a cada leitura.
   - Há dois caminhos, e a escolha é da triagem:
     - seguir o §2.1: o Service devolve `{ status: 'failed' }`. O `catchError` muda de lugar, o tipo extra da tela some e o teste do Service passa a esperar `failed`;
     - ou manter o plano e registrar no §2.1, no fechamento da história, que a busca numa API de terceiros devolve o erro e quem chama o traduz.
2. **O comentário do endereço cita o §5.3 para algo que o §5.3 não diz** (`postal-code.service.ts:24-26`).
   - O comentário diz que o endereço "mora aqui, e não no `environment` (architecture.md §5.3)". O §5.3, ao pé da letra, diz o contrário: "Os Services leem `environment.apiUrl` e nunca escrevem URL à mão".
   - Mesmo assim, isto não é a "URL de ambiente escrita no código" que reprova. O endereço do ViaCEP é o mesmo no `ng serve`, na Vercel e na E3. O argumento do comentário está certo; o problema é que a regra que ele cita não existe.
   - Prejuízo provável: o próximo agente lê o comentário como regra do §5.3 e escreve à mão o endereço de algo que muda por ambiente.
   - Basta o comentário deixar de citar o §5.3 até o documento registrar a exceção (ver as Observações).
3. **O `markAsDirty()` não tem teste nem leitor** (`route-form.ts:146`).
   - Nada no app lê `dirty` nem a classe `ng-dirty`, e tirar a linha não quebra nenhum teste. Esse comportamento entrou sem um teste vermelho que o pedisse.
   - Pela convenção do Angular, `dirty` quer dizer que a pessoa mudou o valor na tela. Aqui quem mudou foi o app. As duas leituras se defendem.
   - Vale decidir quando a edição da rota (US11) precisar saber o que mudou, e prender a decisão num teste. Até lá, a linha afirma algo que ninguém confere.

## Observações fora do escopo deste diff
- **A primeira API de terceiros não está no `architecture.md`.** Este diff é o primeiro a chamar pelo `HttpClient` um endereço fora do `environment.apiUrl`; é o ID20 da ficha. O documento ainda não prevê isso em três pontos:
  - **§2.1, Services:** diz "um por entidade principal do §5.1", e o `PostalCodeService` não tem entidade.
  - **§5.3, endereços:** diz "nunca escrevem URL à mão" (ver a sugestão 2).
  - **§2.1, interceptors:** os dois, quando nascerem, vão pegar toda requisição do `HttpClient`, inclusive a do ViaCEP.
    - O `errorInterceptor` está descrito como "o único lugar que traduz erro HTTP": a falta de rede vira "Sem conexão" e o 401 encerra a sessão. Se ele valer para o ViaCEP, contraria o CA8, que pede um aviso no campo sem bloquear nada.
    - O `authInterceptor` já fala em "toda requisição à API do Supabase". Mas, se for escrito sem conferir o endereço, manda o `Bearer <accessToken>` para `viacep.com.br`.
  - Convém ratificar isso no fechamento da história, junto com o §3:
    - Services de API de terceiros cabem em `core/data/`;
    - o endereço fixo pode morar no Service;
    - os interceptors conferem o endereço (`environment.apiUrl`) antes de agir.
- As observações das Tarefas 1 a 3 continuam valendo, e o diff só segue esses padrões:
  - o §3 diverge do plano (`direction-toggle`, `seat-stepper`, `weekday-picker`);
  - o anel de foco se repete em cada controle;
  - o botão desligado continua sem motivo visível.
