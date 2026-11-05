---
trigger: glob
globs: apps/web/src/**/*
---

# 01 - ANGULAR STRICT RULES

Ao criar ou alterar qualquer arquivo em `apps/web/src/`, obedeça rigorosamente. O porquê de cada lei está no `docs/architecture.md` (§2, §2.1 e §3). Esta regra vale mais que qualquer skill: se uma skill sugerir algo que ela proíbe, siga a regra.

1. PARADIGMA ANGULAR (22, standalone e zoneless):

- STANDALONE: PROIBIDO criar ou sugerir `NgModule`, `SharedModule` ou `app.module.ts`. Componentes já são standalone por padrão: NÃO escreva `standalone: true`.
- ZONELESS: PROIBIDO `zone.js` e `provideZoneChangeDetection()`.
- CONTROL FLOW: SEMPRE `@if`, `@for` (com `track`) e `@switch`. PROIBIDO `*ngIf`, `*ngFor` e `*ngSwitch`.
- ESTADO: `signal()` e `computed()` para estado local. RxJS só na fronteira com o assíncrono, convertido com `toSignal()`. PROIBIDO `subscribe()` manual em componente e `BehaviorSubject` para estado de tela.
- COMUNICAÇÃO: `input()`, `output()` e `model()` como funções. PROIBIDO os decoradores `@Input()` e `@Output()`.
- INJEÇÃO: SEMPRE `inject()`. PROIBIDO injeção pelo construtor.
- TIPAGEM: TypeScript estrito. PROIBIDO `any`.
- FORMULÁRIOS: SEMPRE Reactive Forms (`FormGroup`, `FormControl`, `Validators`), conforme `docs/architecture.md`. PROIBIDO Signal Forms, mesmo que a skill os recomende.
- NOMES: arquivos no padrão do gerador, sem sufixo `.component` (`app.ts`, NUNCA `app.component.ts`), e seletor com prefixo `app-`. Código em inglês; texto da tela em português.
- TESTES: Vitest, com o `*.spec.ts` ao lado do arquivo testado. PROIBIDO Karma e Jasmine (`jasmine.*`): use `vi.fn()` e `vi.spyOn()`.

2. ESTILO (Tailwind 4 + DaisyUI 5, tema `rota-fixa`):

- Cor, fonte e espaçamento SÓ pelos tokens do `docs/design-tokens.md` (ex.: `bg-primary`, `text-base-content`, `text-error`). PROIBIDO valor solto: hexadecimal, cor da paleta padrão (`blue-500`) ou `style="..."`.
- Classes utilitárias do Tailwind e do DaisyUI no template. Botão é `<button class="btn btn-primary">`, não um componente.
- PROIBIDO criar `.css` ou `.scss` por componente: o único arquivo de estilo é o global, `apps/web/src/styles.css`. O `app.css` vazio que veio do `ng new` continua vazio. Ao gerar componente pelo CLI, use `--style=none`.

3. ESTRUTURA (feature-driven, conforme `docs/architecture.md` §3):

- `core/`: o que existe uma vez no app (modelos, services de dados, auth, interceptors e a casca do app em `core/layout/`). PROIBIDO importar de `features/`.
- `shared/`: componentes burros (só `input()`/`output()`), pipes e validators. Do projeto, importa só de `core/models/`, e NUNCA injeta Service.
- `features/`: uma pasta por domínio, com rotas próprias em `<feature>.routes.ts`, carregadas por `loadChildren`. PROIBIDO uma feature importar outra.
- Componente NUNCA acessa dados direto (`HttpClient`, `resource()`, `httpResource()`): só por um Service de `core/data/` injetado.
- Pasta nasce com a história que precisa dela: PROIBIDO criar pasta vazia.
