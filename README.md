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
- **Protótipo (Figma):** [arquivo com design system, protótipo e mapa de componentes](https://www.figma.com/design/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR) · navegar no [celular](https://www.figma.com/proto/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR?page-id=2%3A71&node-id=2-376&starting-point-node-id=2%3A376&scaling=scale-down) ou no [desktop](https://www.figma.com/proto/7LUuKjXUh2FhHPhXC0XAvY/Rota-Fixa-UTFPR?page-id=2%3A71&node-id=2-1555&starting-point-node-id=2%3A1555&scaling=scale-down)

## Modelagem de Dados (Diagrama ER)

```mermaid
erDiagram
    USERS ||--o| VEHICLES : "dirige"
    USERS ||--o{ FIXED_ROUTES : "publica"
    CAMPUSES ||--o{ FIXED_ROUTES : "é ponta de"
    FIXED_ROUTES ||--o{ TRIPS : "gera"
    FIXED_ROUTES ||--o{ SUBSCRIPTIONS : "recebe"
    USERS ||--o{ SUBSCRIPTIONS : "assina"
    SUBSCRIPTIONS ||--o{ SEAT_RELEASES : "libera"
    TRIPS ||--o{ SEAT_RELEASES : "devolve vaga em"
    TRIPS ||--o{ BOOKINGS : "recebe"
    USERS ||--o{ BOOKINGS : "reserva"
    TRIPS ||--o{ ABSENCES : "registra"
    USERS ||--o{ ABSENCES : "acumula"
    TRIPS ||--o{ RATINGS : "permite"
    USERS ||--o{ RATINGS : "avalia"
    TRIPS ||--o{ REPORTS : "origina"
    USERS ||--o{ REPORTS : "denuncia"
    USERS ||--o{ SUSPENSIONS : "cumpre"
    USERS ||--o{ NOTIFICATIONS : "recebe"
    TRIPS ||--o{ NOTIFICATIONS : "motiva"

    USERS {
        uuid id PK
        string email
        string full_name
        string phone
        string role
        timestamptz created_at
    }
    VEHICLES {
        uuid id PK
        uuid owner_id FK
        string model
        string color
        string plate
    }
    CAMPUSES {
        uuid id PK
        string name
        string city
    }
    FIXED_ROUTES {
        uuid id PK
        uuid driver_id FK
        uuid campus_id FK
        string direction
        string neighborhood
        string meeting_point
        array weekdays
        time departure_time
        int seats
        int suggested_fare_cents
        string status
        timestamptz closed_at
        timestamptz created_at
    }
    TRIPS {
        uuid id PK
        uuid route_id FK
        timestamptz departs_at
        string status
        string cancel_reason
        timestamptz cancelled_at
        boolean cancelled_late
    }
    SUBSCRIPTIONS {
        uuid id PK
        uuid route_id FK
        uuid passenger_id FK
        string status
        timestamptz created_at
        timestamptz ended_at
    }
    SEAT_RELEASES {
        uuid id PK
        uuid trip_id FK
        uuid subscription_id FK
        boolean late
        timestamptz created_at
    }
    BOOKINGS {
        uuid id PK
        uuid trip_id FK
        uuid passenger_id FK
        timestamptz created_at
    }
    ABSENCES {
        uuid id PK
        uuid user_id FK
        uuid trip_id FK
        string kind
        timestamptz created_at
    }
    RATINGS {
        uuid id PK
        uuid trip_id FK
        uuid rater_id FK
        uuid ratee_id FK
        int score
        string comment
        timestamptz created_at
    }
    REPORTS {
        uuid id PK
        uuid trip_id FK
        uuid reporter_id FK
        uuid reported_id FK
        string reason
        string status
        timestamptz created_at
    }
    SUSPENSIONS {
        uuid id PK
        uuid user_id FK
        string cause
        string justification
        timestamptz starts_at
        timestamptz ends_at
        uuid created_by FK
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        uuid trip_id FK
        string kind
        string message
        timestamptz read_at
        timestamptz created_at
    }
```

Glossário técnico, atributos e restrições na seção 5 do [docs/architecture.md](docs/architecture.md).

## Stack

- **Frontend:** Angular 20+ (standalone e Signals, fixado pela disciplina)
- **Framework CSS:** Tailwind CSS 4 + DaisyUI 5, com tema próprio a partir do [docs/design-tokens.md](docs/design-tokens.md)
- **Fontes e ícones:** Overpass e Material Symbols Rounded (Google Fonts)
- **Dados:** json-server no MVP (Entrega 2) e Supabase na Entrega 3 (Postgres, Auth e Row Level Security)
- **Testes e qualidade:** Vitest, angular-eslint e Prettier

## Em produção

_A definir._

## Instruções de Execução

_A definir._

## Telas da Aplicação

_A definir._
