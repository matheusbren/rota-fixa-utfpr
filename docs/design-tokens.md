# 🎨 Tokens de Design

**Projeto:** Rota Fixa UTFPR
**Versão:** 1.1.0
**Última atualização:** 03/11/2026

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada
> tela.** Não é um design system — é o mínimo que dá à prototipagem assistida algo a
> que obedecer.
>
> ✍️ **Não preencha na mão:** rode `/utf-design`.

---

## Decisões de base

- **Framework CSS:** Tailwind CSS 4 com DaisyUI 5, usando um tema próprio
  (`rota-fixa`) montado com os tokens deste documento. O Tailwind cuida dos
  utilitários e do Mobile-First; o DaisyUI entrega os componentes prontos (botão,
  campo, modal), que customizamos pelo tema (ID5). A escolha vale para o semestre.
- **Ideia visual:** a carona recorrente é tratada como uma linha de ônibus. Cada
  rota vira uma **placa de horário**, com a hora de saída grande e os dias em que
  ela roda. O amarelo vem da faixa do transporte escolar e da própria UTFPR; o
  fundo é cinza de calçada e o texto é asfalto. A fonte é a Overpass, desenhada a
  partir das placas de rodovia.
- **Ferramenta:** o protótipo foi feito inteiro no Figma, como o enunciado permite.
  O Stitch não liberou acesso para a conta Google usada pela equipe.

## Paleta

Nome semântico, nunca `blue-2` — a cor muda, o papel dela não. Os nomes estão em
inglês porque viram classe no código (`bg-primary`), e código é em inglês
(architecture.md §2). As cores que o DaisyUI já tem um papel para recebem o nome do
DaisyUI na classe (o tema `rota-fixa` faz a ligação); as outras viram variável no
bloco `@theme` do `styles.css`.

| Token | Valor | Classe no código | Onde se usa |
| --- | --- | --- | --- |
| `primary` | `#F5B800` | `bg-primary`, `btn-primary` (DaisyUI `primary`) | ação principal (Entrar, Assinar, Publicar) e faixa amarela da barra do app |
| `primary-hover` | `#DCA400` | `bg-primary-hover` | ação principal com o ponteiro em cima |
| `text-on-primary` | `#1D2226` | `text-primary-content` (DaisyUI `primary-content`) | texto e ícone em cima da primária |
| `background` | `#EDEFEA` | `bg-base-200` (DaisyUI `base-200`) | fundo das telas (cinza de calçada) |
| `surface` | `#FFFFFF` | `bg-base-100` (DaisyUI `base-100`) | fundo de placa, painel e campo |
| `surface-dark` | `#1D2226` | `bg-neutral` (DaisyUI `neutral`) | barra do app, menu lateral, dia em que a rota roda |
| `surface-dark-active` | `#30383E` | `bg-surface-dark-active` | item ativo do menu lateral |
| `text` | `#1D2226` | `text-base-content` (DaisyUI `base-content`) | texto padrão (asfalto) |
| `text-muted` | `#545B61` | `text-text-muted` | legenda, apoio |
| `text-on-dark` | `#FFFFFF` | `text-neutral-content` (DaisyUI `neutral-content`) | texto sobre a superfície escura |
| `border` | `#CDD2CB` | `border-base-300` (DaisyUI `base-300`) | contorno de placa, campo e divisória |
| `danger` | `#B3261E` | `bg-error`, `btn-error` (DaisyUI `error`) | erro, falta, cancelar e encerrar |
| `danger-hover` | `#921F18` | `bg-danger-hover` | botão de perigo com o ponteiro em cima |
| `danger-soft` | `#FBE9E7` | `bg-danger-soft` | fundo de aviso de falta ou erro |
| `success` | `#1B6E43` | `bg-success` (DaisyUI `success`) | confirmação, vaga garantida |
| `success-soft` | `#E3F1E8` | `bg-success-soft` | fundo de aviso de sucesso |
| `disabled` | `#DCDFDA` | `bg-disabled` | fundo de controle inativo |
| `text-disabled` | `#80867F` | `text-text-disabled` | texto de controle inativo |
| `focus` | `#1D2226` | `ring-focus`, `outline-focus` | anel de foco do teclado |

O texto sobre `danger` e sobre `success` é branco (`#FFFFFF`): no tema, `error-content`
e `success-content`.

No Figma, as variáveis da coleção "Tokens Rota Fixa" mantêm os nomes da versão
1.0.0, em português (`cor/<nome>`). A correspondência: `primaria` → `primary`,
`primaria-hover` → `primary-hover`, `texto-sobre-primaria` → `text-on-primary`,
`fundo` → `background`, `superficie` → `surface`, `superficie-escura` →
`surface-dark`, `superficie-escura-ativa` → `surface-dark-active`, `texto` → `text`,
`texto-suave` → `text-muted`, `texto-sobre-escuro` → `text-on-dark`, `borda` →
`border`, `perigo` → `danger`, `perigo-hover` → `danger-hover`, `perigo-suave` →
`danger-soft`, `sucesso` → `success`, `sucesso-suave` → `success-soft`,
`desabilitado` → `disabled`, `texto-desabilitado` → `text-disabled`, `foco` →
`focus`.

Contraste (WCAG) dos pares usados em texto: `text` sobre `background` 13,9:1;
`text-muted` sobre `background` 6,0:1; `text-on-primary` sobre `primary` 9,0:1;
branco sobre `danger` 6,5:1; branco sobre `success` 6,3:1; `danger` sobre
`danger-soft` 5,6:1; `success` sobre `success-soft` 5,4:1. Todos passam AA.
O par desabilitado fica abaixo de propósito: controle inativo não entra na regra.

## Escala de espaçamento

Uma progressão só, usada em tudo: múltiplos de 4 px, que é a escala padrão do
Tailwind (o passo do Tailwind é o valor em px dividido por 4).

| Token | Valor | Passo no Tailwind |
| --- | --- | --- |
| `xs` | 4 px | `1` |
| `sm` | 8 px | `2` |
| `md` | 16 px | `4` |
| `lg` | 24 px | `6` |
| `xl` | 32 px | `8` |
| `2xl` | 48 px | `12` |

Regras: margem lateral de 16 px no celular; 12 px (passo `3`) entre itens de uma
lista e entre campos de um formulário; alvo de toque nunca menor que 44 px
(botões e campos têm 48 px de altura).

### Raios

| Token | Valor | Classe no código | Onde se usa |
| --- | --- | --- | --- |
| `radius-sm` | 4 px | `rounded-sm`; no tema, `--radius-selector` | dia na faixa de dias, etiqueta |
| `radius-md` | 8 px | `rounded-md`; no tema, `--radius-field` | botão, campo, aviso |
| `radius-lg` | 12 px | `rounded-lg`; no tema, `--radius-box` | placa de horário, painel, folha e modal |
| `radius-full` | 999 px | `rounded-full` | indicador de vaga, avatar |

Sem sombra: a separação entre superfícies vem da borda de 1 px (`border`).

## Tipografia

Família única: **Overpass** (Google Fonts). Horários sempre com algarismos
tabulares (`tabular-nums`). Ícones: Material Symbols Rounded.

| Token | Família · tamanho · peso | Classe no código | Papel |
| --- | --- | --- | --- |
| `display` | Overpass · 56/60 · 900 (Black) | `text-display` | horário em destaque no detalhe da rota, marca na tela de entrada |
| `time` | Overpass · 40/44 · 900 (Black) | `text-time` | horário de saída na placa |
| `title-1` | Overpass · 28/34 · 800 (ExtraBold) | `text-title-1` | título da tela |
| `title-2` | Overpass · 20/26 · 800 (ExtraBold) | `text-title-2` | seção, cabeçalho de dia |
| `body` | Overpass · 16/24 · 400 (Regular) | `text-body` | texto corrido |
| `body-strong` | Overpass · 16/24 · 600 (SemiBold) | `text-body-strong` | informação principal de uma linha (lugar, nome) |
| `label` | Overpass · 14/20 · 600 (SemiBold) | `text-label` | rótulo de campo, faixa de dias, etiqueta |
| `caption` | Overpass · 13/18 · 400 (Regular) | `text-caption` | apoio, ajuda de campo |
| `tab` | Overpass · 12/16 · 600 (SemiBold) | `text-tab` | rótulo da barra de abas no celular |
| `button` | Overpass · 16/20 · 700 (Bold) | `text-button` | texto de botão |

Nomes anteriores (versão 1.0.0): `horario` → `time`, `titulo-1` → `title-1`,
`titulo-2` → `title-2`, `texto` → `body`, `texto-forte` → `body-strong`, `rotulo` →
`label`, `legenda` → `caption`, `aba` → `tab`, `botao` → `button`.

## Estados de botão

Quatro tipos: **primária** (amarela, texto asfalto), **secundária** (branca, borda
de 2 px em `text`), **perigo** (vermelha, texto branco) e **texto** (sublinhado,
sem fundo). Altura 48 px, `radius-md`, texto no token `button`.

| Estado | Aparência |
| --- | --- |
| normal | cores do tipo, como acima |
| hover | primária vai para `primary-hover`; secundária e texto ganham fundo `background`; perigo vai para `danger-hover` |
| foco (teclado) | anel de 3 px na cor `focus`, afastado 2 px do botão; sobre superfície escura o anel é `primary`. O contorno nunca é removido sem o anel no lugar |
| desabilitado | fundo `disabled`, texto `text-disabled`, sem hover; o motivo aparece em texto perto do botão (ex.: "Liberar a vaga precisa de conexão.") |
| carregando | mantém a largura, mostra o ícone girando e o verbo no gerúndio ("Assinando…", "Publicando…") e bloqueia um segundo clique |

## Breakpoints (Mobile-First)

O design nasce para a menor tela e cresce (ID2). Toda tela do protótipo tem
versão mobile antes da versão desktop. Os valores são os padrões do Tailwind.

| Token | Largura mínima | Vale para |
| --- | --- | --- |
| (base) | 0 | celular, desenhado em 360 px sem rolagem lateral: uma coluna, barra de abas embaixo |
| `sm` | 640 px | celular deitado: filtros da busca lado a lado |
| `md` | 768 px | tablet: resultados da busca em 2 colunas |
| `lg` | 1024 px | desktop: menu lateral no lugar da barra de abas; detalhe da rota e formulários em 2 colunas |
| `xl` | 1280 px | desktop largo: agenda como quadro semanal de 3 colunas |

## Identidade PWA

Os valores abaixo alimentam o `manifest.webmanifest` no `/utf-setup` (ID3).

| Campo | Valor |
| --- | --- |
| Nome (`name`) | Rota Fixa UTFPR |
| Nome curto (`short_name`) | Rota Fixa |
| Cor de tema (`theme_color`) | `#1D2226` (`surface-dark`, a cor da barra do app) |
| Cor de fundo (`background_color`) | `#EDEFEA` (`background`, a cor da tela de abertura) |
| Ícone | placa amarela (`#F5B800`) com o trajeto em asfalto: ponto vazado (bairro), linha e ponto cheio (campus). Tamanhos 192 px, 512 px e 512 px maskable, com o desenho dentro da zona segura de 80% |
| Modo de exibição (`display`) | `standalone` |
| Orientação (`orientation`) | `portrait` |
| URL inicial (`start_url`) | `/agenda` |
| Comportamento visual offline | A agenda dos próximos dias fica salva no aparelho (US17). Sem rede, a agenda abre com a faixa escura "Sem conexão. Agenda salva hoje às 17:42, pode estar desatualizada."; ações que precisam de rede (liberar vaga, ver embarque) ficam desabilitadas e dizem o motivo. Se o app nunca abriu com conexão, aparece a tela "Sem conexão" com o botão "Tentar de novo", e nunca uma tela em branco |

## Protótipo

**Link:** https://www.figma.com/design/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR
(acesso público para visualizar)

**Navegar no celular:** https://www.figma.com/proto/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR?page-id=2%3A71&node-id=2-376&starting-point-node-id=2%3A376&scaling=scale-down

**Navegar no desktop:** https://www.figma.com/proto/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR?page-id=2%3A71&node-id=2-1555&starting-point-node-id=2%3A1555&scaling=scale-down

**Telas (360 px e 1440 px):** entrar, criar conta, agenda da semana (com a folha de
liberar vaga), procurar rotas, detalhe da rota antes e depois de assinar, perfil
com o veículo, publicar rota, minhas rotas (com a folha de cancelar viagem) e
embarque com marcação de ausência. Em 360 px, também a abertura (splash), a agenda
sem conexão e a tela sem conexão.

**Páginas do arquivo:** Capa, Design System (tokens e componentes), Protótipo
(fluxos Celular, Desktop e PWA) e Mapa de Componentes (as telas com as caixas
`<app-...>` que viram componentes Angular).
