# Rota Fixa UTFPR

Plataforma de caronas para a comunidade da UTFPR que trata o trajeto casa ↔
campus como um **compromisso recorrente**, e não como um pedido avulso. O
motorista publica uma vez a rota que faz toda semana — origem, destino, dias e
horário — e o passageiro assina essa rota, garantindo a vaga em todas as viagens
dela. Quem não vai em um dia específico libera a vaga, que fica disponível para
outra pessoa naquela viagem apenas.

Recorte da equipe sobre o tema do semestre (gestão de caronas na UTFPR):
**recorrência, reaproveitamento de vaga e consequência para o combinado furado**.

## Autores

- Matheus Bren — [@matheusbren](https://github.com/matheusbren)
- Guilherme Bondezan — [@guibndz](https://github.com/guibndz)
- Vinicius Liepienski de França — [@Vinicius-L-Franca](https://github.com/Vinicius-L-Franca)

## Documentação Técnica

- [PRD](docs/prd.md) · [Architecture/SSD](docs/architecture.md) · [Checklist](docs/checklist.md)
- **Modelo de dados:** o diagrama ER mora só no [docs/architecture.md, seção 5.2](docs/architecture.md#-52-diagrama-er-mermaid)
- **Quadro Kanban:** [GitHub Projects](https://github.com/users/matheusbren/projects/1)
- **Protótipo (Figma):** [arquivo com design system, protótipo e mapa de componentes](https://www.figma.com/design/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR) · navegar no [celular](https://www.figma.com/proto/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR?page-id=2%3A71&node-id=2-376&starting-point-node-id=2%3A376&scaling=scale-down) ou no [desktop](https://www.figma.com/proto/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR?page-id=2%3A71&node-id=2-1555&starting-point-node-id=2%3A1555&scaling=scale-down)

## Stack

- **Frontend:** Angular (standalone e Signals)
- **Framework CSS:** Tailwind CSS + DaisyUI, com tema próprio a partir do [docs/design-tokens.md](docs/design-tokens.md)
- **Fontes e ícones:** Overpass e Material Symbols Rounded (Google Fonts)
- **Dados:** json-server no MVP e Supabase como BaaS planejado (Postgres, Auth e Row Level Security)
- **Testes e qualidade:** Vitest, angular-eslint e Prettier

As linhas de versão que a equipe segue estão no [docs/architecture.md](docs/architecture.md); a versão exata instalada fica no `package.json`, que nasce na Atividade 07.

## Em produção

_A partir da Entrega 3._

## Instruções de Execução

Precisa do [Git](https://git-scm.com) e do [Node.js](https://nodejs.org) 22.22.3 ou mais
novo na linha 22, ou 24.15 ou mais novo na linha 24 (o npm vem junto). Com uma versão mais
velha, o Angular se recusa a rodar.

```bash
git clone https://github.com/matheusbren/rota-fixa-utfpr.git
cd rota-fixa-utfpr
git switch develop
npm install
```

O `npm install` roda uma vez, na raiz, e instala também o app em `apps/web`: o repositório
é um workspace do npm.

Depois, abra dois terminais na raiz do repositório:

| Terminal | Comando       | O que faz                                                                        |
| -------- | ------------- | -------------------------------------------------------------------------------- |
| 1        | `npm run api` | Sobe o json-server em `http://localhost:3000`, com os dados do `db.json`         |
| 2        | `npm start`   | Compila o app e serve em `http://localhost:4200`; recompila a cada arquivo salvo |

Abra `http://localhost:4200` no navegador. O app abre em "Criar conta", e o menu leva a
"Minhas rotas" e a "Publicar uma rota fixa". Até o login chegar (Entrega 3), quem publica é
uma pessoa de exemplo do `db.json`.

Para conferir o código, num terceiro terminal, também na raiz:

| Comando         | O que faz                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| `npm test`      | Roda os testes de unidade (Vitest) e fica observando os arquivos; `q` sai |
| `npm run lint`  | Confere o código com as regras do angular-eslint                          |
| `npm run build` | Gera a versão de produção do app (a publicação é da Entrega 3)            |

O json-server grava no `db.json` o que se cria pelo app (contas e rotas). Para voltar aos
dados originais: `git restore db.json`.

## Telas da Aplicação

_A partir da Entrega 2._
