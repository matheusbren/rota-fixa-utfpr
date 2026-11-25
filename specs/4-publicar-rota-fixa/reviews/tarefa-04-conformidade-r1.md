# Parecer de Conformidade — Tarefa 4

**Veredito:** APONTAMENTOS

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| Abertura da seção do CEP: "O CEP é só uma ajuda para preencher o Bairro: [...] o Bairro continua editável, preenchido ou não pelo CEP." | atendido | **Código:** o `effect()` só faz `setValue` e `markAsDirty` no Bairro (`apps/web/src/app/features/driver/route-form/route-form.ts:141-148`). O campo não ganha `readonly` nem `disabled` (`apps/web/src/app/features/driver/route-form/route-form.html:79-94`). **Teste:** `apps/web/src/app/features/driver/route-form/route-form.spec.ts:568-583`. Depois do preenchimento pelo CEP, o teste confere que o campo não está `readOnly` nem `disabled`. Em seguida digita "Vila Carli" e sai do campo: o valor continua o digitado, então o `effect` não escreve de novo por cima. Sem CEP, o Bairro é digitado como nas Tarefas 2 e 3 (`:335-371`) |
| Abertura da seção do CEP: "[...] ele não é gravado [...]" | atendido | Vale para esta tarefa. Nada no diff grava ou guarda o CEP. A única requisição nova é o GET ao ViaCEP (`apps/web/src/app/core/data/postal-code.service.ts:30-35`), e o mapeador devolve só o bairro (`:17-19`). O app não usa `localStorage` nem `sessionStorage`. O envio ainda não existe: provar que o POST não leva o CEP é trabalho da Tarefa 6 (CA9). Fica o alerta para ela: o controle `postalCode` continua dentro do `form` (`route-form.ts:88`) |
| CA8: "quando termino de digitar os 8 números de um CEP que existe (com ou sem o traço), então o campo Bairro é preenchido com o bairro desse CEP e continua editável" | atendido | **Regra:** só o CEP completo é buscado (`route-form.ts:111-114`; `apps/web/src/app/shared/validators/postal-code.ts:4-9`). A busca sai do `valueChanges`, sem esperar a pessoa sair do campo (`route-form.ts:106-108`). O traço é tirado antes da busca (`postal-code.service.ts:31`). O bairro achado vai para o campo (`route-form.ts:141-148`). **Testes:** com `85010-000` e com `85010000`, o teste responde no papel do ViaCEP sem sair do campo. O Bairro vazio passa a "Santa Cruz", sem aviso e com o botão ligado (`route-form.spec.ts:551-566`). O Service pede a mesma URL, só com os números, nos dois formatos (`apps/web/src/app/core/data/postal-code.service.spec.ts:37-50`). Só a resposta do último CEP digitado vale (`route-form.spec.ts:705-716`). O "continua editável" está na primeira linha da tabela |
| CA8: "quando saio do campo CEP com um formato que não é de CEP, então vejo 'O CEP tem 8 números' e o botão fica desligado até eu corrigir ou apagar o CEP" | atendido | **Regra:** `postal-code.ts:11-15`. O vazio passa, porque o CEP é opcional. A regra é ligada em `route-form.ts:88`, e o texto está em `route-form.ts:32-34`. O aviso fica em `route-form.html:67-70`, com `aria-invalid` e `aria-describedby` em `:58-65`. **Testes:** com 7 números, 9 números e com letra, nenhum aviso aparece antes de sair do campo (`route-form.spec.ts:624`). Depois de sair, o teste confere o texto, o campo marcado e o botão desligado (`:626-630`), e que nenhuma busca saiu (`:631`). Apagar (`:635-649`) e corrigir (`:651-666`) tiram o aviso e ligam o botão. O validador sozinho aceita `''`, `85010-000` e `85010000` e recusa seis formatos (`apps/web/src/app/shared/validators/postal-code.spec.ts:10-21`) |
| CA8: "quando o CEP não existe, então vejo 'Não achamos este CEP. Digite o bairro.'" | atendido | **Código:** a resposta com `erro` vira `not-found` (`postal-code.service.ts:17-19`). A tela mostra o aviso, ligado ao campo pelo `aria-describedby` (`route-form.ts:63-66` e `:132-135`; `route-form.html:71-75`). **Testes:** `postal-code.service.spec.ts:52-59` e `route-form.spec.ts:671-675`, com o corpo em `:687-703`. O apontamento 1 trata deste mesmo aviso no CEP que existe mas vem sem bairro |
| CA8: "quando a busca falha (sem conexão ou o ViaCEP fora do ar), então vejo 'Não deu para buscar o CEP agora. Digite o bairro.'" | atendido | **Código:** o Service repassa a falha como erro (`postal-code.service.ts:28-35`). A tela a converte em `failed` (`route-form.ts:124-126`) e mostra o aviso (`:63-66`). **Testes:** sem conexão (`ProgressEvent`) e com 503, no Service (`postal-code.service.spec.ts:76-91`) e na tela (`route-form.spec.ts:676-686`, com o corpo em `:687-703`) |
| CA8: "Nos dois últimos casos, o Bairro fica como estava e o botão não é bloqueado pelo CEP." | atendido | **Código:** o `effect` só escreve no Bairro quando a busca acha o bairro (`route-form.ts:143`). O aviso da busca não é erro de validação: não entra no `form.invalid` (`route-form.html:172`) e não marca o campo. **Teste:** os três casos usam a rota válida, com o Bairro "Centro". O teste confere o texto exato, o CEP sem `aria-invalid`, o Bairro ainda "Centro" e o botão ligado (`route-form.spec.ts:697-701`) |
| Regra geral, aplicada ao CEP e ao Bairro preenchido pelo CEP: "Toda mensagem de erro de campo aparece depois que a pessoa sai do campo [...] Enquanto houver qualquer erro, o botão 'Publicar rota' fica desligado." | atendido | O aviso de formato passa pelo `errorOf`, que exige o campo tocado (`route-form.ts:152-159`). O teste confere antes e depois de sair do campo (`route-form.spec.ts:623-628`). O Bairro curto que vem do CEP desliga o botão sem aviso até a pessoa sair do Bairro, como se ela mesma o tivesse digitado (`:599-615`). Os avisos da busca estão na leitura 1, abaixo |
| CA1 (Tarefa 1) | atendido | `route-form.spec.ts:277-289` continua passando. O CEP vazio é válido (`postal-code.ts:15`). Abrir a tela não dispara busca (`route-form.ts:111-114`): o `httpTesting.verify()` de `:113` recusaria um GET a mais. Nenhum aviso aparece |
| CA2, CA3 e CA4 (Tarefa 2) | atendido | `route-form.spec.ts:316-419` e `:528-536` não mudaram e passam. O limite do Bairro virou `[maxlength]="neighborhoodMaxLength"` (`route-form.html:84`; `route-form.ts:103`) e continua 60, e o teste do limite confere esse valor |
| CA5, CA6 e CA7 (Tarefa 3) | atendido | `route-form.spec.ts:421-526` não mudaram e passam |
| CA17 (Tarefa 1) | atendido | `route-form.spec.ts:291-314` continua passando. O resultado da busca fica em signals do próprio componente (`route-form.ts:106-135`), que é criado de novo a cada vez que a tela abre. A busca é um GET, que não conta como gravação (`isWrite`, `route-form.spec.ts:91-93`) |
| CA9 e CA10: envio, "Publicando…" e segundo toque | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA11: falha no envio | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA12: conflito com outra rota minha | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA13 e CA14: tela da rota | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA15: próximas viagens | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16: Minhas rotas | fora desta tarefa | Tarefa 10 do `plan.md` |

**Testes:** o `npm test` passou, com 11 arquivos e 121 de 121 testes (eram 88 na Tarefa 3). Os 33 novos são 6 no `postal-code.service.spec.ts`, 13 no `postal-code.spec.ts` e 14 no `route-form.spec.ts`. Todos passam e provam o que dizem provar:
- **O teste é o ViaCEP:** toda resposta sai do `HttpTestingController`, que confere a URL exata (`route-form.spec.ts:538-545`). O `verify()` do `afterEach` recusa busca a mais, e nenhum teste chama a internet.
- **Bairro:** o teste lê o valor do campo na tela (`:547-549`). A rota está válida, menos o Bairro, então o botão ligado prova que o valor chegou ao formulário, e não só à tela.
- **Avisos:** são conferidos pelo texto exato, lido pelo `aria-describedby` (`toEqual`), como foi combinado em `tarefa-01-decisoes-r1.md`.

**Leituras adotadas (não são apontamentos):**
1. **Quando os avisos da busca aparecem.** Os avisos de CEP não achado e de falha aparecem assim que a resposta chega, mesmo com o cursor ainda no CEP, porque o `postalCodeLookupNotice` não confere se o campo foi tocado (`route-form.ts:132-135`).
   - **Por que não é falha:** a regra "depois que a pessoa sai do campo" vale para erro de campo. O CA8 liga estes avisos ao resultado da busca ("quando o CEP não existe", "quando a busca falha") e diz que eles não bloqueiam o botão. Então eles não são erro de campo.
   - **O que o teste não fixa:** os testes conferem o aviso depois de sair do campo (`route-form.spec.ts:695`), então também passariam com a outra leitura.
2. **Bairro do ViaCEP cortado em 60 caracteres** (`route-form.ts:145`; teste em `route-form.spec.ts:585-597`). Não é escopo inflado. É a decisão da triagem da Tarefa 2 (`tarefa-02-decisoes-r1.md`), que junta o limite do CA3 com o CA8.
3. **"O ViaCEP não responde"** (spec, "Abandono no meio"). A busca não tem prazo, e a spec não define um.
   - **O que continua garantido:** enquanto a busca espera, o botão não é bloqueado e o Bairro continua editável. A pessoa "digita o bairro e segue", como a spec pede.
   - **Consequência:** o aviso de falha só aparece quando o navegador desiste da requisição. Uma resposta atrasada que traga bairro substitui o que a pessoa digitou enquanto esperava. É o que o primeiro caso do CA8 descreve.

**Diff:** o diff contra `83abddd` mexe em 7 arquivos, todos nos "Arquivos previstos" da Tarefa 4 e todos no índice. Não há arquivo fora dele.
- **Glossário (§5.1):** o campo preenchido é o `neighborhood`, como em `FixedRoute`. O CEP não é atributo do modelo, porque a spec não o grava. Ele aparece como `postalCode` e `PostalCodeService`, os nomes do `plan.md:24-26` e `:35-38`.
- **Escopo:** o cancelamento da busca anterior (`switchMap`, `route-form.ts:119-129`) está no `plan.md:44-47`. É ele que garante que o Bairro recebe o bairro "desse CEP", o último digitado. A única exceção de escopo é o apontamento 1.
- **Abandono:** o caso "O ViaCEP não responde ou o CEP não existe" está tratado (leitura 3 e as linhas do CA8 na tabela). O CA17 continua atendido.

## Apontamentos
1. **O CEP que existe mas vem sem bairro aparece para a pessoa como CEP que não existe** — `apps/web/src/app/core/data/postal-code.service.ts:15-19`
   Critério violado: CA8, "quando o CEP não existe, então vejo 'Não achamos este CEP. Digite o bairro.'". E a seção "O problema": "cada regra de validação está escrita aqui, com a mensagem que a pessoa lê, e não fica para o implementador decidir."
   Evidência:
   - **O que o código faz:** o mapeador devolve `not-found` também quando o ViaCEP acha o CEP e o `bairro` vem vazio (`erro || !bairro`, `:18`). O comentário (`:15-16`) e o teste `apps/web/src/app/core/data/postal-code.service.spec.ts:61-74` registram a decisão: "CEP de cidade inteira não tem bairro: para a tela, é o mesmo que não achar".
   - **O que a pessoa vê:** "Não achamos este CEP" para um CEP que o ViaCEP achou.
   - **O que a spec diz:** quando a busca tem resposta, ela só prevê dois resultados. Ou o CEP existe e o Bairro é preenchido, ou o CEP não existe e aparece o aviso. O CEP de cidade inteira não cabe em nenhum dos dois. Ler o primeiro ao pé da letra (preencher o Bairro com o bairro vazio) também não está escrito. É um caso que a spec não previu e que foi decidido no código.
   - **Precedente:** a triagem da Tarefa 1 (`tarefa-01-decisoes-r1.md`, apontamento 1) registrou a regra para esses casos: o implementador não inventa tratamento que a spec não pediu, e o caso não previsto vira Issue. A decisão é do usuário.
   - **Teste:** só o Service testa este caso. A tela não tem teste dele.

### Critical Files for Implementation
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/postal-code.service.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/core/data/postal-code.service.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/apps/web/src/app/features/driver/route-form/route-form.spec.ts
- /home/matheus/ATVroni/rota-fixa-utfpr/specs/4-publicar-rota-fixa/spec.md
