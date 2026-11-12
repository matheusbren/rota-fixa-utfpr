# Parecer de Código — Tarefa 1

**Veredito:** APROVADO

## Apontamentos (bloqueiam)
Nenhum. Rodei `npm test` (3 de 3 passando) e `npm run lint` ("All files pass linting"), e conferi o diff contra `docs/architecture.md` §2, §2.1, §3 e §4 e contra `.agents/rules/01-angular-strict-rules.md`:
- **Camadas:** `core/layout/` não importa de `features/`, `features/auth/` não importa de outra feature, e só o `app.routes.ts` raiz conhece as duas pontas (§3, "Regra de dependência").
- **Rotas da feature:** a feature expõe as rotas em `auth.routes.ts`, carregado por `loadChildren` (§3, §4).
- **Sintaxe Angular:** nada de `standalone: true`, `NgModule`, decorator de `@Input`/`@Output` ou injeção pelo construtor.
- **Nomes:** arquivos sem o sufixo `.component` e seletores com o prefixo `app-`.
- **Estilo:** nenhum `.css` por componente, cores só por tokens do tema (`bg-neutral`, `border-primary`, `text-text-muted`, `text-title-1`/`-2`, `text-caption`) e espaçamento na escala de 4 px.
- **Pastas:** nenhuma pasta vazia.
- **Segredos:** nenhuma URL ou segredo no código.
- **Teste:** prova comportamento (URL final depois do redirecionamento, presença e ordem no documento) e não estado interno. A estrutura de gaveta prevista para a Tarefa 2 (`drawer-content` com top-bar, `<main>` e footer) mantém essa ordem, então o teste continua valendo.

## Sugestões (não bloqueiam)
- `apps/web/src/app/app.routes.ts:11-14`: o filho `path: ''` com `loadChildren` casa como prefixo com qualquer URL. Por isso o roteador baixa o chunk de `auth` para testar toda navegação que chega até ele. Hoje não há prejuízo, porque todo caminho termina no cadastro. Quando `agenda`, `search` e as outras features entrarem como filhas do `AppShell`, declare-as antes desse item, com caminho fixo. Senão a primeira ida a `/agenda` também baixa o chunk de `auth`.

## Observações fora do escopo deste diff
- `apps/web/src/app/app.config.ts:9`: `provideRouter(routes)` está sem o `withComponentInputBinding()` que o §4 ("Configuração") exige. Já era assim antes deste diff, mas vira defeito na primeira rota com parâmetro (`/rotas/:routeId`, #5), porque o `input()` com o nome do parâmetro não recebe nada.
- `apps/web/src/app/app.ts:11`: `title = signal('web')` é sobra do gerador e não é lido em nenhum template, nem antes nem depois deste diff. Pode sair numa limpeza.
- O `docs/architecture.md` agora descreve uma casca diferente da que o código monta:
  - a tabela do §3 não lista `app-shell` nem `footer` em `core/layout/`;
  - o §4 ainda descreve uma "casca pública sem barra de navegação" para `/criar-conta` e a `bottom-nav` no celular.

  O `plan.md` já anota essa ratificação, itens (a), (b) e (c). Vale abrir agora a Issue de manutenção, para que nenhum agente leia o §4 na Tarefa 2 e monte uma segunda casca.
- O mapa do §4 põe o `guestGuard` em `/criar-conta`, e nenhuma tarefa do plano o cobre. Isso faz sentido, porque o guard depende de sessão, que só nasce na #2. Convém registrar na #2 que o guard entra lá, em `/entrar` e em `/criar-conta`.
