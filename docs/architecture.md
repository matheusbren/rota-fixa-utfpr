# 🛠️ Architecture / SSD

**Projeto:** Rota Fixa UTFPR
**Versão:** 1.0.0
**Última atualização:** 01/10/2026

> 🤖 **O `prd.md` responde _o quê_ o produto faz. Este responde _onde as coisas
> moram e como se chamam_.** Detalhe de tela — rota, componente, contrato —
> **não** se decide aqui: isso é trabalho da spec de cada história.
> (No texto oficial da disciplina este documento é o `ssd.md` — ID31.)
>
> ✍️ **Não preencha na mão:** rode `/utf-architecture` (depois do `/utf-prd`).
> A entrevista decide com você cada seção e garante o que o `/utf-setup` exige:
> **framework do frontend, o BaaS, a estrutura do projeto e como rodar os
> testes.**

---

## 🤖 1. Fontes de Contexto para a IA

> Onde a IDE agêntica busca a verdade. **Isto é o índice; a configuração mora
> nos arquivos** — documento não configura ferramenta.

| Fonte | Onde configurar | Serve para |
| :---- | :-------------- | :--------- |
| Constituição da IA | `.agents/rules/utf-rules.md` (via `CLAUDE.md`) | Regras inegociáveis: fases do SDD, 2 rodadas, revisores distintos, Gitflow |
| Fluxos da IA | `.agents/workflows/` | PRD, backlog, design, architecture, setup, ciclo por Issue, ciclo por tarefa, tutor |
| Agentes (subagentes) | `.agents/agents/` (cascas em `.claude/`, `.cursor/`, `.opencode/`) | Implementador, revisores, auditor final e tutor |
| Ficha da disciplina | `docs/checklist.md` | Regras do projeto, IDs e entregas |
| Protótipo (Stitch/Figma) | [link público] | Telas, jornadas e hierarquia visual (ID1) |
| MCPs da IDE | [ex.: Figma, Supabase, Context7] | Contexto exato do projeto para o agente (ID32) |

---

## 📦 2. Stack Tecnológica

> Definição **estrita**: nenhuma dependência entra sem aparecer aqui. Esta
> seção e o `package.json` contam a mesma história, ou o projeto já se perdeu.
> O que a ficha fixa entra como está; o que ela deixa livre é decidido na
> entrevista.

- **Frontend:** Angular 22+ — standalone, signals e zoneless (o padrão do
  gerador desde a linha 21; não se adiciona `zone.js`). A faixa de Node aceita
  pela linha está na tabela oficial (angular.dev/reference/versions): na
  linha 24, a partir de 24.15.
- **Padrões de código exigidos** (a ficha cobra cada um — IDs 4, 6, 7, 9, 10–15):
  `@if`/`@switch`, `@for` com `track`, `@defer`, signals (writable/computed) como
  fonte de estado, `model()` para two-way, `effect()` para efeitos colaterais,
  `input()`/`output()`, `inject()`, Pipes para formatação.
- **O que não se escreve** (o agente erra por memória de versões antigas):
  `standalone: true` (já é o padrão), `NgModule`, `*ngIf`/`*ngFor`/`*ngSwitch`,
  `@Input()`/`@Output()` com decorator, injeção pelo construtor,
  `provideZoneChangeDetection()`, `BehaviorSubject` para estado de tela.
- **Nomes:** código, dados e rotas internas em inglês; texto da interface e
  URL que a pessoa vê em português (`/minhas-rotas`). Arquivos em kebab-case,
  no padrão de nome que o gerador da linha 22 usa (o `/utf-setup` ratifica);
  seletor de componente com prefixo `app-`, igual às caixas do Mapa de
  Componentes no Figma.
- **Framework CSS:** [Tailwind, PrimeNG, …] (ID5)
- **Dados (em duas fases):** **json-server** no MVP (E2) → **Supabase** na E3, com autenticação (JWT) e CRUD reais (IDs 21–22). A troca atinge só os Services (§2.1).
  - **E2 — json-server (linha 1, ainda beta):** `db.json` na **raiz** do
    repositório, servido por `npm run api` em `http://localhost:3000`. Uma
    coleção por entidade do §5.1, com os nomes e campos de lá. Na linha 1 o
    `id` é sempre string (gerado se faltar), filtro usa operador no nome do
    parâmetro (`departsAt:gte=`), ordenação `_sort`, página `_page`/`_per_page`
    e relação `_embed`.
  - **E3 — Supabase:** Postgres com as tabelas do §5.2, Supabase Auth para
    conta e sessão, e Row Level Security escrita a partir da coluna "Não pode"
    do PRD §3. Escolhido porque o modelo é relacional (rota → viagem → vaga),
    o Auth já entrega verificação de e-mail (RN01) e JWT (ID21), e a RLS é o
    lugar natural das regras de visibilidade (RN17).
  - **Bibliotecas de dados:** `HttpClient` do Angular nas duas fases (é por
    ele que os interceptors passam — ID23) e, só na E3, `@supabase/supabase-js`
    **apenas para o Auth** (cadastro, entrada, saída, renovação da sessão). O
    CRUD continua por `HttpClient` contra a API REST do Supabase.
- **PWA:** `manifest.webmanifest` — ícones, cores de tema, splash, standalone, offline (ID3). Vem do pacote oficial `@angular/pwa` (`ng add`), que também instala o `@angular/service-worker`; os valores do manifest estão no `design-tokens.md` (Identidade PWA). A agenda sem conexão (US17) é um `dataGroup` do service worker com estratégia `freshness` para as leituras da agenda — nenhuma biblioteca de cache além dessa.
- **Formulários:** Reactive Forms (ID24). Os Signal Forms da linha 22 ainda são novos e a documentação recomenda Reactive Forms quando se quer estabilidade; a ficha cobra Reactive Forms pelo nome.
- **Datas, horas e dinheiro:** `DatePipe`, `CurrencyPipe` e o locale `pt-BR` do próprio Angular (`registerLocaleData` + `LOCALE_ID`). Nenhuma biblioteca de datas.
- **Fontes e ícones:** Overpass e Material Symbols Rounded pelo Google Fonts, sem pacote npm.
- **Testes e lint:** **Vitest**, o padrão do gerador do Angular (o Karma dos tutoriais antigos não entra), com os testes em `*.spec.ts` ao lado do arquivo testado (ID33). Da raiz: `npm test` roda a suíte e `npm run lint` roda o lint. O linter não vem no `ng new`: o setup instala o oficial (`ng add angular-eslint`), mais Prettier e `eslint-config-prettier` na raiz.
- **Deploy:** Vercel, a partir da `main` (E3).
- **Fora da stack, de propósito:** biblioteca de estado (NgRx e afins — signals nos Services bastam para o tamanho do app), biblioteca de componentes além do DaisyUI, biblioteca de mapa (o ponto de encontro é texto, PRD §6) e qualquer SDK de pagamento (RN16).

### 🌐 2.1. Camada de dados — regras estruturais

> Declaradas uma a uma na entrevista, percorrendo os IDs da ficha.

- **Componente não fala com o servidor:** todo acesso a dados passa por
  **Services** injetados via `inject()` (ID15) — mudança de contrato mexe só
  neles, nunca nas telas. **É esta regra que paga a migração da E3:** trocar o
  json-server pelo BaaS reescreve os Services, e nenhuma tela.
- **Quem faz o quê na camada:**
  - **Service** (`core/data/`): um por entidade principal do §5.1. É o único
    lugar que conhece URL, nome de coluna e formato do servidor. Recebe e
    devolve os **modelos** de `core/models/` (interfaces TypeScript em
    camelCase), nunca o formato cru da resposta.
  - **Mapeador:** função pura ao lado do Service que converte resposta ↔
    modelo. Na E2 é quase identidade (o `db.json` já usa os nomes do modelo);
    na E3 traduz o snake_case das tabelas para o camelCase do modelo. É ela
    que absorve a troca de fonte.
  - **Página** (componente de rota, em `features/`): injeta Services com
    `inject()`, guarda o estado da tela em signals e passa dados para baixo
    com `input()`. **Componente de `shared/` não injeta Service nenhum.**
- **Estado compartilhado:** mora em signals privados dentro do Service, expostos
  como somente leitura (`asReadonly()` ou `computed()`), e só o Service os
  altera. Exemplo: a sessão no `AuthService`, lida pela agenda, pelo perfil e
  pelos guards — é a comunicação entre telas não relacionadas do ID15.
- **Autenticação e sessão (JWT):**
  - **E2:** não existe autenticação real (o json-server não tem). O
    `AuthService` confere e-mail e senha contra a coleção `users` do
    `db.json` e guarda o usuário da sessão num signal, persistido em
    `localStorage` para sobreviver ao recarregar. É simulação, e está escrita
    como tal: senha em texto no `db.json` é aceitável só porque são dados
    fictícios de desenvolvimento.
  - **E3:** Supabase Auth com e-mail e senha. Cadastro restrito ao domínio da
    UTFPR (RN01) com verificação de e-mail ligada. O `@supabase/supabase-js`
    guarda e renova a sessão; o `AuthService` expõe `currentUser` e
    `accessToken` como signals, e é a única classe do app que importa o SDK.
    Os guards e as telas não mudam da E2 para a E3.
- **Interceptors funcionais** (`HttpInterceptorFn`, registrados com
  `provideHttpClient(withInterceptors([...]))` — ID23):
  - `authInterceptor`: na E3, coloca `apikey` (a chave publishable) e
    `Authorization: Bearer <accessToken>` em toda requisição à API do
    Supabase. Na E2 não acrescenta nada — existe desde o início para a troca
    não mexer em `app.config.ts`.
  - `errorInterceptor`: o único lugar que traduz erro HTTP em mensagem de
    gente (sem código técnico na tela — PRD §7). 401 encerra a sessão e
    leva para `/entrar`; falta de rede vira "Sem conexão"; o resto vira uma
    mensagem genérica em português. A tela recebe a mensagem pronta.
- **Assíncrono ↔ reativo:** Service devolve `Observable` (é o que o
  `HttpClient` entrega); a página converte para signal com `toSignal()` na
  leitura e usa `toObservable()` quando um signal precisa disparar uma busca
  (ex.: filtros da busca → requisição, com `switchMap` e `debounceTime`) —
  ID25. Nenhum `subscribe()` manual em componente.
- **Gravação:** toda operação que altera dado passa por um método do Service
  que devolve `Observable`; a página mostra carregando, depois sucesso ou erro
  (PRD §7 — "retorno visível em toda gravação").
- **Regras de negócio que dependem de dado de outras pessoas** (última vaga —
  RN04/RN08, conflito de horário — RN05, suspensão — RN10): na E2 o Service
  confere antes de gravar; na E3 a conferência vai para o banco (restrição,
  RLS ou função), porque só o servidor vê a corrida de duas pessoas pela mesma
  vaga. A tela não muda: ela continua recebendo "ficou sem vaga" como erro.
- **Formulários Reativos** com validação, mensagens claras e submit
  desabilitado quando inválido (ID24). Validação reutilizável (placa, domínio
  do e-mail, pelo menos um dia da semana) fica em `shared/validators/`.

---

## 🗂️ 3. Estrutura do Projeto

```text
.
├── .agents/               # constituição, workflows e prompts dos agentes (§1)
├── CLAUDE.md / AGENTS.md  # cascas por ferramenta (.claude/, .cursor/, .opencode/)
├── README.md              # a vitrine, na estrutura exigida pela ficha
├── docs/                  # prd.md, este arquivo, design-tokens.md, checklist.md e guias
├── specs/                 # uma pasta por história implementada
├── package.json           # a raiz do workspace: scripts de orquestração (§3.1)
└── apps/
    ├── web/               # o app Angular — package.json próprio
    └── api/               # reservada para uma API real, se um dia existir
```

> 📌 **Por que `apps/` com duas pastas se só uma tem código.** Nesta disciplina os
> dados vêm do json-server e depois do BaaS: não há backend para escrever. Mas a
> casca do monorepo custa nada agora e evita mover o projeto inteiro no dia em que
> uma API própria fizer sentido. **`apps/api/` nasce vazia, e continua vazia** — o
> setup não gera backend nenhum; ela só guarda o lugar (e o `db.json` do
> json-server, se o documento assim declarar).

### 📦 3.1. A raiz do monorepo (npm workspaces)

O `package.json` da raiz declara os subprojetos e concentra os comandos:

```json
{
  "name": "[nome-do-projeto]",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "start": "npm run start -w apps/web",
    "build": "npm run build -w apps/web",
    "test":  "npm run test -w apps/web",
    "lint":  "npm run lint -w apps/web",
    "format": "prettier --write .",
    "api":   "json-server db.json"
  }
}
```

> 📌 **O que os workspaces resolvem aqui.** Um `npm install` na raiz instala as
> dependências de todos os `apps/*` de uma vez, num `node_modules` só: quem clona o
> repositório roda **um** comando, não um por pasta. A flag `-w` executa um script
> dentro de um subprojeto sem `cd`. O curinga `apps/*` faz qualquer pasta nova ali
> dentro ser reconhecida sem editar este arquivo, e `"private": true` impede a
> publicação acidental no npm. **`apps/api/` não tem `package.json` e é ignorada pelo
> npm** — nada a fazer nela.

### Organização interna do app (`apps/web/src/app/` — feature-driven)

[decidido na entrevista: `core/` (singletons: guards, interceptors, services de
dados), `shared/` (componentes burros, pipes), `features/` (uma pasta por
domínio) — com a regra de dependência: features não importam umas das outras.]

---

## 🧭 4. Roteamento e Navegação

> A ficha cobra a API funcional moderna (IDs 16–19): `provideRouter` com
> `withComponentInputBinding()`, parâmetros de rota via Signal `input()`,
> rotas filhas para hierarquia de layout, Functional Guards e Resolvers.

[mapa inicial de rotas nasce aqui; cada história nova preenche uma linha no §6]

---

## 🗄️ 5. Arquitetura de Dados (BaaS)

### 📖 5.1. Glossário Técnico (Mapeamento)

> A ponte entre o português do negócio (PRD §2) e o inglês do código.
> **Dados e código em inglês, interface em português.**

| Termo PRD (PT-BR) | Entidade/Tabela (EN) | Atributos principais |
| :---------------- | :------------------- | :------------------- |
| | | |

### 📊 5.2. Diagrama ER (Mermaid)

> As tabelas do BaaS e seus relacionamentos — o mesmo diagrama vai renderizado
> no README, como a ficha exige.

```mermaid
erDiagram
```

### 🔒 5.3. Segredos e ambientes

> Chaves do BaaS: a *anon key* pública vive em `environment.ts` (é pública por
> design — a segurança vem das regras de acesso do BaaS, ex.: RLS no Supabase);
> **service keys e segredos nunca entram no repositório**.

| Fase | App roda em | Dados |
| :--- | :--- | :--- |
| **Local (E2/MVP)** | `ng serve` | json-server (`db.json` local) |
| **Local (E3)** | `ng serve` | [BaaS — projeto de dev] |
| **Produção (E3)** | [Vercel/Render] | [BaaS — projeto de produção] |

---

## 🗺️ 6. Mapa de Domínios e Rotas

> **Este índice cresce.** Não é para preencher agora: **uma linha por história
> implementada** — a spec é que define rota e contrato. Aqui fica só o mapa de
> quem já existe.

| Domínio | Rota | Guard | Dados (service) | US |
| :------ | :--- | :---- | :-------------- | :-- |
| | | | | |

---

## 📅 7. Histórico

| Data | Versão | O que mudou |
| :--- | :----- | :---------- |
| | 1.0.0 | Versão inicial via `/utf-architecture` |

---

## 🛑 O que ainda **não** está neste documento

Detalhes de funcionalidade — contratos de uma tela específica, máquinas de
estado de uma história — **não entram aqui**: nascem sob demanda no `spec.md`
de cada história. Este documento guarda só o que vale para o sistema inteiro.
