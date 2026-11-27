# Parecer de Código — Tarefa 11

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum. O diff só acrescenta comentários e corrige o `docs/architecture.md`. Não muda camada, sintaxe, tratamento de erro nem teste. Conferi o texto novo contra o código:
- §3: o `segmented-control` tem `input` de opções e `model` do valor; o `weekday-picker` é `ControlValueAccessor`; a lista de viagens é um `<ul>` no `route-detail.html`.
- §4: o `search.routes.ts` não tem resolver, e o `route-detail.html` trata "Não achamos esta rota", o link e "Tentar de novo".
- §5.1: as viagens saem de `upcomingTrips(lookup.route, now, 4)` no `computed`.
- §6: o `my-routes.ts` e o `route-form.ts` injetam o `AuthService`.

O `grep FixedRouteService` não acha mais nada no `architecture.md`. Os quatro TODO seguem o estilo dos que já existem (`// TODO #n:` no TS, `<!-- TODO #n: ... -->` em várias linhas no HTML, como no `sign-up.html`). O `fixed-routes.service.ts` não ficou com o texto repetido: a frase "Na E2 a conferência é daqui…" saiu do comentário geral e foi para dentro do `TODO #20`.

Verificação, da raiz:
- `npm test -- --watch=false`: 17 arquivos e 184 testes passando.
- `npm run lint`: "All files pass linting".
- `npm run build`: concluído sem erro.
- `prettier --check` nos quatro arquivos de `apps/`: passa.
- `prettier --check` no `docs/architecture.md`: continua falhando. Comparei os trechos que o Prettier quer mudar antes e depois do diff: são os mesmos 16 trechos de tabela, só deslocados. Os parágrafos novos não criam nenhum trecho a mudar.

## Sugestões (não bloqueiam)
- **O `TODO #3` aponta a mudança futura para o lugar errado** (`apps/web/src/app/features/driver/route-form/route-form.ts:198-199`).
  - O texto diz que "o envio passa a conferir se a pessoa tem veículo cadastrado".
  - Mas o `architecture.md` §4 (linha 435, `/minhas-rotas/nova`: "sem veículo, a tela convida a cadastrar — US03") e o 3º critério da US03 pedem outra coisa: ao abrir a tela, ver o convite "em vez de um formulário que não posso concluir".
  - A spec, em "Fora de escopo", também fala do "convite para cadastrar o veículo antes de publicar".
  - O lugar do comentário segue o plano. O problema é a frase. Quem fizer a US03 seguindo o `grep TODO #3` cai no `submit()` e é levado a conferir o veículo depois do formulário preenchido.
  - Proposta: "a tela passa a convidar a cadastrar o veículo em vez de mostrar o formulário (RN02, US03, architecture.md §4)", mantendo o "até lá, nada confere o veículo".
- **A nota da US04 no §3 dá um motivo diferente do da regra** (`docs/architecture.md:374-379`).
  - A nota diz que o `weekday-picker` e o `segmented-control` moram em `shared/ui/` "porque não conhecem domínio nenhum".
  - A regra logo acima (linhas 359-361) diz que vai para `shared/ui/` a caixa que aparece em mais de um domínio, e que a caixa de um domínio só fica na feature. A coluna "Por quê" da linha 367 diz "Aparecem em dois ou mais domínios".
  - Hoje cada um é usado por um domínio só (`driver` e `search`). O documento passa a ter dois critérios para a mesma pasta.
  - No próximo componente genérico de um domínio só, quem implementa cita a nota e quem revisa cita a regra.
  - Proposta: acrescentar à regra das linhas 359-361 o critério "ou não conhece domínio nenhum", ou trocar o motivo da nota pelo critério do mapa.
- **O §4 copia detalhe de tela da spec** (`docs/architecture.md:457-459`).
  - O cabeçalho do documento (linhas 8-9) diz que detalhe de tela não se decide ali.
  - O trecho transcreve o texto e o link do CA14 ("Não achamos esta rota" e o link "Minhas rotas").
  - Quando a busca (#5) levar visitantes à tela, esse link quase certamente muda, porque "Minhas rotas" exige `authGuard`. Aí o §4 volta a não bater com o código, que é a pendência que esta tarefa fecha.
  - Basta dizer que "a própria tela trata a rota que não existe e a falha da busca (CA14 da US04)".

## Observações fora do escopo deste diff
- O `docs/architecture.md` continua reprovado no `prettier --check`. São tabelas desalinhadas no §1, §2.2, §2.3, §3, §4, §5.1, §6 e §7, que já estavam assim antes da branch. Candidata a Issue `chore` (formatar o arquivo, ou decidir se `docs/` entra no `.prettierignore`).
- Com o alinhamento do §4, não existe nenhum resolver no código. Os dois do mapa (`fixedRouteResolver` e `tripResolver`) chegam com a edição da rota (US11, #8) e com o embarque. O ID19 da ficha pede guards funcionais e resolvers. Vale conferir em qual entrega ele é cobrado e se alguma história da E2 vai entregá-lo.
- O `upcomingTrips` mora em `features/search/route-detail/`. Quando a gravação em `trips` nascer com a assinatura (#6, o `TODO #6` em `route-detail.ts:64`), quem gera as viagens vai ser um Service de `core/data/`, e o §3 proíbe `core/` de importar de `features/`. A função vai precisar subir para `core/`, e nem o TODO nem o §5.1 avisam isso.
