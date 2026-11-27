# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| Regra geral — "Toda mensagem de erro de campo aparece **depois que a pessoa sai do campo** (o campo 'tocado'), e nunca antes: abrir a tela não mostra aviso nenhum. Enquanto houver qualquer erro, o botão 'Publicar rota' fica desligado." | atendido | **Mensagem só depois de sair do campo:** `apps/web/src/app/features/driver/route-form/route-form.ts:75-82`. O `errorOf` não devolve nada enquanto o controle não está `touched`. **Botão:** `route-form.html:138` (`[disabled]="form.invalid"`). **Testes:** o "nunca antes" é conferido com o valor já digitado e antes de sair do campo (`route-form.spec.ts:282`, `:309`, `:354`). O botão desligado é conferido em `:288`, `:315` e `:360` |
| CA2 — "quando saio do campo Campus sem escolher nenhum, então vejo 'Uma das pontas precisa ser um campus da UTFPR' e o botão continua desligado; quando escolho um campus, então a mensagem some." | atendido | **Regra:** `route-form.ts:55` (`Validators.required`). **Texto:** `route-form.ts:15`. **Tela:** `route-form.html:4-21`, com o aviso em `:18-20` e o `aria-invalid`/`aria-describedby` em `:10-11`. **Teste:** `route-form.spec.ts:278-295`. Ele sai da lista sem escolher (`:284`), confere o texto e o botão (`:286-288`), escolhe um campus e vê o aviso sumir (`:290-294`) |
| CA3 — "quando saio do campo Bairro vazio ou só com espaços, então vejo 'Informe o bairro da outra ponta'; quando saio dele com menos de 3 caracteres (sem contar os espaços das pontas), então vejo 'O bairro precisa ter pelo menos 3 letras'. Com 3 ou mais, a mensagem some. O campo não deixa digitar mais de 60 caracteres." | atendido | **Regras:** `route-form.ts:59`, com os validadores de `apps/web/src/app/shared/validators/trimmed.ts:6-8` e `:12-17`. **Textos:** `route-form.ts:18-19`. **Tela:** `route-form.html:58-74`, com `maxlength="60"` em `:64` e o aviso em `:69-73`. **Testes:** vazio, só espaços, `"Ce"` e `"  Ce  "` em `route-form.spec.ts:297-317`. O aviso some com 3 caracteres em `:319-333`, e o limite de 60 é conferido em `:383-391`. Os validadores sozinhos são testados em `trimmed.spec.ts:9-30` |
| CA4 — "quando saio do campo Ponto de encontro vazio ou só com espaços, então vejo 'Descreva o ponto de encontro'; quando saio dele com menos de 5 caracteres, então vejo 'Descreva o ponto de encontro com pelo menos 5 caracteres'. O campo mostra, antes de qualquer erro, a dica 'Um lugar público, como a frente de uma padaria. Nunca o endereço da sua casa.' e não deixa digitar mais de 120 caracteres." | atendido | **Regras:** `route-form.ts:60`. **Textos:** `route-form.ts:22-23`. **Tela:** `route-form.html:76-100`, com `maxlength="120"` em `:83`, a dica sempre presente em `:92-94` e o aviso em `:95-99`. **Testes:** a dica aparece quando a tela abre, sem marcar erro (`route-form.spec.ts:335-341`). Vazio, só espaços e `"Praç"` são recusados em `:343-362`. Com `"Praça"` o aviso some e o botão liga (`:364-381`). O limite de 120 é conferido em `:383-391`. O validador é testado com 5 caracteres em `trimmed.spec.ts:32-36` |
| CA1 (Tarefa 1) — "[...] nenhuma mensagem de erro, e o botão 'Publicar rota' desligado." | atendido | O teste `route-form.spec.ts:232-251` continua passando. A dica do Ponto de encontro não é erro: não leva `aria-invalid`, e o `expectNoMessages()` de `:249` continua valendo |
| CA17 (Tarefa 1) — "[...] o formulário vem em branco, sem mensagens, e nada foi gravado." | atendido | O teste `route-form.spec.ts:253-276` continua passando. Agora o `leave('Ponto de encontro')` de `:265`, com o campo vazio, faz aparecer o aviso "Descreva o ponto de encontro", com `aria-invalid="true"`. Assim o `expectNoMessages()` da volta (`:273`) passa a provar o "sem mensagens", em vez de não ter o que achar como na Tarefa 1 |
| CA5 — dias da semana (de 1 a 5) | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA6 — horário de saída | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA7 — vagas (de 1 a 4, inteiras) | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA8 — CEP pelo ViaCEP | fora desta tarefa | Tarefa 4 do `plan.md` |
| CA9 e CA10 — envio, "Publicando…" e o segundo toque | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA11 — falha no envio | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA12 — conflito com outra rota minha | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA13 e CA14 — tela da rota | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA15 — próximas viagens | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16 — Minhas rotas | fora desta tarefa | Tarefa 10 do `plan.md` |

**Testes:** o `npm test` passou: 8 arquivos e 74 de 74 testes. A lista detalhada mostra 16 testes no `route-form.spec.ts` (os 3 da Tarefa 1 e 13 novos) e 15 no `trimmed.spec.ts`, todos passando. Os testes provam o que dizem provar:
- **Textos dos avisos:** o teste lê o texto ligado ao campo pelo `aria-describedby` (`route-form.spec.ts:198-201`), como o `sign-up.spec.ts:80-82` da US01. Ele compara a lista inteira (`toEqual`). Por isso, no Ponto de encontro, prova ao mesmo tempo a dica e o aviso, nessa ordem.
- **Botão:** o `fillInValidRouteExcept` (`:209-220`) deixa válidos todos os outros campos, sem tocá-los. Assim, o botão desligado vem da regra testada, e não de outro campo. Quando o campo é corrigido, o botão liga (`:294`, `:332`, `:380`). Isso prova que aquela regra era a única que o bloqueava.
- **Limites de 60 e 120:** o jsdom não impede a digitação além do `maxlength`. O teste confere a propriedade `maxLength` (`:390`), que é o que faz o navegador real impedir. É a prova possível no navegador simulado, e é o mecanismo que o "não deixa digitar" pede.

**Leitura adotada no CA4 (não é apontamento):** o CA4 diz "menos de 5 caracteres" e não repete o "(sem contar os espaços das pontas)" do CA3. O código usa `trimmedMinLength(5)` (`route-form.ts:60`). Por isso, `"Praç "` (5 caracteres, um deles espaço) mostra o aviso de 5 caracteres. Não aponto porque:
- o `plan.md` aprovado (`:35-36`) atribui `trimmedMinLength(n)` aos dois campos;
- o próprio CA4 trata "só com espaços" como vazio, e isso só faz sentido contando sem os espaços das pontas.

Fica registrado para a pessoa saber qual leitura foi adotada.

**Diff:** o diff contra `2ab20b4` mexe em 5 arquivos, todos nos "Arquivos previstos" da Tarefa 2.
- **Glossário (`docs/architecture.md` §5.1):** os controles são `campusId`, `neighborhood` e `meetingPoint`, os nomes de `FixedRoute`. Os validadores reutilizáveis estão em `shared/validators/` (§2.1).
- **Escopo:** o diff não traz comportamento que a spec não pediu.
  - **`aria-invalid` e `aria-describedby`:** seguem o padrão de mensagens da US01 (`sign-up.html:67-68`, `:82-83`) e a convenção adotada em `tarefa-01-decisoes-r1.md`.
  - **"Um erro por vez":** o `trimmedMinLength` não aponta o campo vazio (`trimmed.ts:15`). Isso é o que faz cada caso do CA3 e do CA4 mostrar uma frase só.
  - **Dica junto com o erro:** a dica continua visível quando o erro aparece. A spec pede que ela apareça antes de qualquer erro e não pede que ela suma depois.
- **Abandono:** nenhum caso do "Abandono no meio" é desta tarefa, e o CA17 continua atendido.

## Apontamentos
