# 🎨 Tokens de Design

**Projeto:** Rota Fixa UTFPR
**Versão:** 1.0.0
**Última atualização:** 29/09/2026

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

Nome semântico, nunca `azul-2` — a cor muda, o papel dela não. No Figma, cada
token é uma variável da coleção "Tokens Rota Fixa" (`cor/<token>`).

| Token | Valor | Onde se usa |
| --- | --- | --- |
| `primaria` | `#F5B800` | ação principal (Entrar, Assinar, Publicar) e faixa amarela da barra do app |
| `primaria-hover` | `#DCA400` | ação principal com o ponteiro em cima |
| `texto-sobre-primaria` | `#1D2226` | texto e ícone em cima da primária |
| `fundo` | `#EDEFEA` | fundo das telas (cinza de calçada) |
| `superficie` | `#FFFFFF` | fundo de placa, painel e campo |
| `superficie-escura` | `#1D2226` | barra do app, menu lateral, dia em que a rota roda |
| `superficie-escura-ativa` | `#30383E` | item ativo do menu lateral |
| `texto` | `#1D2226` | texto padrão (asfalto) |
| `texto-suave` | `#545B61` | legenda, apoio |
| `texto-sobre-escuro` | `#FFFFFF` | texto sobre a superfície escura |
| `borda` | `#CDD2CB` | contorno de placa, campo e divisória |
| `perigo` | `#B3261E` | erro, falta, cancelar e encerrar |
| `perigo-hover` | `#921F18` | botão de perigo com o ponteiro em cima |
| `perigo-suave` | `#FBE9E7` | fundo de aviso de falta ou erro |
| `sucesso` | `#1B6E43` | confirmação, vaga garantida |
| `sucesso-suave` | `#E3F1E8` | fundo de aviso de sucesso |
| `desabilitado` | `#DCDFDA` | fundo de controle inativo |
| `texto-desabilitado` | `#80867F` | texto de controle inativo |
| `foco` | `#1D2226` | anel de foco do teclado |

Contraste (WCAG) dos pares usados em texto: `texto` sobre `fundo` 13,9:1;
`texto-suave` sobre `fundo` 6,0:1; `texto-sobre-primaria` sobre `primaria` 9,0:1;
branco sobre `perigo` 6,5:1; branco sobre `sucesso` 6,3:1; `perigo` sobre
`perigo-suave` 5,6:1; `sucesso` sobre `sucesso-suave` 5,4:1. Todos passam AA.
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

| Token | Valor | Onde se usa |
| --- | --- | --- |
| `raio-sm` | 4 px | dia na faixa de dias, etiqueta |
| `raio-md` | 8 px | botão, campo, aviso |
| `raio-lg` | 12 px | placa de horário, painel, folha e modal |
| `raio-pilula` | 999 px | indicador de vaga, avatar |

Sem sombra: a separação entre superfícies vem da borda de 1 px (`borda`).

## Tipografia

Família única: **Overpass** (Google Fonts). Horários sempre com algarismos
tabulares (`tabular-nums`). Ícones: Material Symbols Rounded.

| Token | Família · tamanho · peso | Papel |
| --- | --- | --- |
| `display` | Overpass · 56/60 · 900 (Black) | horário em destaque no detalhe da rota, marca na tela de entrada |
| `horario` | Overpass · 40/44 · 900 (Black) | horário de saída na placa |
| `titulo-1` | Overpass · 28/34 · 800 (ExtraBold) | título da tela |
| `titulo-2` | Overpass · 20/26 · 800 (ExtraBold) | seção, cabeçalho de dia |
| `texto` | Overpass · 16/24 · 400 (Regular) | texto corrido |
| `texto-forte` | Overpass · 16/24 · 600 (SemiBold) | informação principal de uma linha (lugar, nome) |
| `rotulo` | Overpass · 14/20 · 600 (SemiBold) | rótulo de campo, faixa de dias, etiqueta |
| `legenda` | Overpass · 13/18 · 400 (Regular) | apoio, ajuda de campo |
| `aba` | Overpass · 12/16 · 600 (SemiBold) | rótulo da barra de abas no celular |
| `botao` | Overpass · 16/20 · 700 (Bold) | texto de botão |

## Estados de botão

Quatro tipos: **primária** (amarela, texto asfalto), **secundária** (branca, borda
de 2 px em `texto`), **perigo** (vermelha, texto branco) e **texto** (sublinhado,
sem fundo). Altura 48 px, `raio-md`, texto no token `botao`.

| Estado | Aparência |
| --- | --- |
| normal | cores do tipo, como acima |
| hover | primária vai para `primaria-hover`; secundária e texto ganham fundo `fundo`; perigo vai para `perigo-hover` |
| foco (teclado) | anel de 3 px na cor `foco`, afastado 2 px do botão; sobre superfície escura o anel é `primaria`. O contorno nunca é removido sem o anel no lugar |
| desabilitado | fundo `desabilitado`, texto `texto-desabilitado`, sem hover; o motivo aparece em texto perto do botão (ex.: "Liberar a vaga precisa de conexão.") |
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
| Cor de tema (`theme_color`) | `#1D2226` (`superficie-escura`, a cor da barra do app) |
| Cor de fundo (`background_color`) | `#EDEFEA` (`fundo`, a cor da tela de abertura) |
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
