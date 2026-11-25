# Parecer de Conformidade — Tarefa 1

**Veredito:** APROVADO

## Critérios verificados
| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — "Dado que abro 'Publicar uma rota fixa' pelo menu, quando a tela carrega, então vejo os campos Campus (com os 13 câmpus da UTFPR), Sentido ('Vou para o campus', já marcado, ou 'Volto do campus'), CEP do bairro (opcional), Bairro, Ponto de encontro, Dias da semana (segunda a sábado), Horário de saída e Vagas, nenhuma mensagem de erro, e o botão 'Publicar rota' desligado." | atendido | **Menu:** `apps/web/src/app/core/layout/app-shell/app-shell.ts:15-18` liga "Publicar uma rota fixa" a `/minhas-rotas/nova`. **Rota:** `apps/web/src/app/app.routes.ts:13-16` (`loadChildren`) e `apps/web/src/app/features/driver/driver.routes.ts:5`. **Campos da tela:** `apps/web/src/app/features/driver/route-form/route-form.html`: Campus em `:4-15`, com as opções vindas de `campuses()`; Sentido em `:17-39`; CEP do bairro (opcional) em `:41-50`; Bairro em `:52-59`; Ponto de encontro em `:61-68`; Dias da semana em `:70-82`; Horário de saída em `:84-91`; Vagas em `:93-102`; botão em `:104-110`, com `[disabled]="form.invalid"`. **Valores iniciais:** `route-form.ts:34-51` começa com `direction: 'to_campus'` e os campos obrigatórios vazios. Os dias de segunda a sábado estão em `route-form.ts:9-16`. **Câmpus:** a busca é o GET `/campuses` de `apps/web/src/app/core/data/campuses.service.ts:19`, e os 13 câmpus estão em `db.json:13-27`. **Teste:** `route-form.spec.ts:194-212` |
| CA17 — "Dado que preenchi parte do formulário, quando saio da tela (pelo menu ou fechando a aba) e volto a 'Publicar uma rota fixa', então o formulário vem em branco, sem mensagens, e nada foi gravado." | atendido | O formulário é campo de instância de `RouteForm` (`route-form.ts:34`): nasce com a tela e some com ela, e nada é guardado no navegador. O teste `route-form.spec.ts:215-237` cobre as duas saídas: pelo menu (`:216`) e fechando a aba (`:217`, simulada em `:186-191`) |
| Abandono no meio — "Sai da tela no meio do preenchimento. [...] o que foi digitado se perde, sem aviso [...] Vira o CA17, que também prova que nada é gravado pela metade." | atendido | A mesma prova do CA17 (`route-form.spec.ts:215-237`) |
| Fora de escopo — "Guardar rascunho do formulário" | atendido | Não há `localStorage` nem `sessionStorage` no diff. A aba é reaberta no mesmo jsdom (`route-form.spec.ts:183-191`), onde o armazenamento do navegador continua existindo. Um rascunho guardado ali voltaria ao formulário, e o teste da `:233` falharia |
| Fora de escopo — "O rateio sugerido (RN16): a rota é gravada sem rateio, e a tela não mostra o campo." | atendido | `route-form.html` tem só os oito campos do CA1, e `route-form.ts:34-51` não tem `suggestedFareCents` |
| Fora de escopo — "Exigir veículo cadastrado (RN02)" | atendido | `driver.routes.ts:5` não tem guard nem conferência de veículo |
| CA2 — campus vazio mostra "Uma das pontas precisa ser um campus da UTFPR" | fora desta tarefa | Tarefa 2 do `plan.md` |
| CA3 — regras e mensagens do Bairro (3 a 60 caracteres) | fora desta tarefa | Tarefa 2 do `plan.md` |
| CA4 — regras, mensagens e dica do Ponto de encontro (5 a 120 caracteres) | fora desta tarefa | Tarefa 2 do `plan.md` |
| CA5 — de 1 a 5 dias da semana | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA6 — horário de saída vazio mostra "Informe o horário de saída" | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA7 — vagas de 1 a 4, inteiras | fora desta tarefa | Tarefa 3 do `plan.md` |
| CA8 — o CEP preenche o Bairro pelo ViaCEP, com as três mensagens | fora desta tarefa | Tarefa 4 do `plan.md` |
| CA9 — publicar grava a rota ativa e abre a tela dela com "Rota publicada" | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA10 — "Publicando…", com o botão bloqueado e sem segunda gravação | fora desta tarefa | Tarefa 6 do `plan.md` |
| CA11 — falha no envio mostra a mensagem e mantém os campos preenchidos | fora desta tarefa | Tarefa 7 do `plan.md` |
| CA12 — conflito com outra rota ativa minha | fora desta tarefa | Tarefa 8 do `plan.md` |
| CA13 — a tela `/rotas/<id>` de uma rota que existe | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA14 — rota que não existe e falha ao carregar a tela da rota | fora desta tarefa | Tarefa 5 do `plan.md` |
| CA15 — próximas viagens, desta semana e das 4 semanas | fora desta tarefa | Tarefa 9 do `plan.md` |
| CA16 — "Minhas rotas" | fora desta tarefa | Tarefa 10 do `plan.md` |

**Testes:** o `npm test` passou: 7 arquivos e 46 de 46 testes. Rodado sozinho, o `route-form.spec.ts` passou com 3 de 3: o do CA1 e as duas saídas do CA17. Os testes provam o que dizem provar:
- **Câmpus:** o `expectOne` do GET `/campuses` (`:92`) falharia se os câmpus estivessem fixos no código. As opções da tela são comparadas com a resposta do servidor (`:200`).
- **Campos:** cada campo é achado pelo rótulo, e o teste exige o tipo de controle certo (`:97-103`).
- **Mensagens:** o `expectNoMessages` (`:157-160`) procura `aria-invalid="true"` e `role="alert"`. É o mesmo padrão de mensagens da US01 (`sign-up.html`). Hoje o template não tem mensagem nenhuma, então a verificação ainda não tem o que achar. Ela passa a valer quando as Tarefas 2 a 4 criarem as mensagens.
- **Formulário em branco:** antes de sair da tela, o CA17 confere que o formulário mudou (`:227`). Por isso a volta em branco (`:233`) prova alguma coisa.
- **Nada gravado:** o teste verifica isso em três pontos: o `expectNone(isWrite)` (`:235`), o `verify()` antes de fechar a aba (`:188`) e o `verify()` do `afterEach` (`:74`).

**Diff:** o diff contra `9e2bf09` mexe em 9 arquivos, e todos estão na lista de "Arquivos previstos" da Tarefa 1.
- **Glossário (`docs/architecture.md` §5.1):** o `Campus` tem `id`, `name` e `city`, e a coleção se chama `campuses`. Os campos do formulário usam os nomes de `FixedRoute`: `campusId`, `direction` (`to_campus` ou `from_campus`), `neighborhood`, `meetingPoint`, `weekdays` (dias ISO de 1 a 6), `departureTime` e `seats`. O `postalCode` é o CEP. O glossário não tem termo para ele porque o CEP não é gravado. A rota `/minhas-rotas/nova` e o `app-route-form` em `features/driver/` seguem os §§3 e 4.
- **Escopo:** o diff não traz comportamento que a spec não pediu.
  - **`Validators.required`:** sem mensagem nenhuma, eles são o mínimo para o botão nascer desligado (CA1). As mensagens ficam para as Tarefas 2 e 3.
  - **Pessoa de exemplo em `users` e `fixed_routes` vazio no `db.json`:** vêm do "Assume que" da spec e do "Contrato com o json-server" do `plan.md`.
- **Fora da spec:** a tela não trata a falha do GET `/campuses`. A spec não descreve esse caso: o "Abandono no meio" só cobre falha no envio (CA11) e na tela da rota (CA14). Por isso não é apontamento de conformidade.

## Apontamentos
