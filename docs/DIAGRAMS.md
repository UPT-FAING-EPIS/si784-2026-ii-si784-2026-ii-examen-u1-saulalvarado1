# Diagramas Técnicos de Arquitectura CinePass (Formato Mermaid)

Este documento contiene la especificación visual y técnica de CinePass mediante diagramas Mermaid estandarizados.

---

## 1. Diagrama Entidad-Relación (ER Diagram)

Visualiza las entidades de la base de datos relacional, sus claves primarias, claves foráneas y cardinalidades:

```mermaid
erDiagram
    MOVIES ||--o{ SHOWTIMES : "proyectada en"
    ROOMS ||--o{ SHOWTIMES : "alberga"
    ROOMS ||--|{ SEATS : "contiene"
    SHOWTIMES ||--o{ SEATS_STATUS : "evalua"
    SHOWTIMES ||--o{ RESERVATIONS : "bloquea"
    SEATS ||--o{ RESERVATIONS : "asignado en"
    USERS ||--o{ RESERVATIONS : "solicita"
    SHOWTIMES ||--o{ TICKETS : "emite"
    SEATS ||--o{ TICKETS : "ocupa"
    USERS ||--o{ TICKETS : "adquiere"

    MOVIES {
        int id PK
        string title
        string synopsis
        string genre
        int duration_minutes
        string poster_url
        string rating
        boolean is_active
        datetime created_at
    }

    ROOMS {
        int id PK
        string name
        int capacity
        string room_type
        int rows
        int columns
    }

    SEATS {
        int id PK
        int room_id FK
        string row_code
        int seat_number
        string seat_code
        string seat_type
    }

    SHOWTIMES {
        int id PK
        int movie_id FK
        int room_id FK
        datetime start_time
        datetime end_time
        decimal price
        string status
    }

    RESERVATIONS {
        int id PK
        int showtime_id FK
        int seat_id FK
        int user_id FK
        string reservation_code
        datetime reserved_at
        datetime expires_at
        string status
    }

    TICKETS {
        int id PK
        string ticket_code UK
        int showtime_id FK
        int seat_id FK
        int user_id FK
        decimal price_paid
        string payment_method
        string transaction_id
        string qr_payload
        string status
        datetime purchased_at
    }

    USERS {
        int id PK
        string name
        string email UK
        string phone
        string document_id
        datetime created_at
    }
```

---

## 2. Diagrama de Clases (Class Diagram)

Modela la jerarquía orientada a objetos de la solución .NET Core 9 y sus servicios:

```mermaid
classDiagram
    class Movie {
        +int Id
        +string Title
        +string Synopsis
        +string Genre
        +int DurationMinutes
        +string PosterUrl
        +string Rating
        +bool IsActive
        +DateTime CreatedAt
    }

    class Room {
        +int Id
        +string Name
        +int Capacity
        +string RoomType
        +int Rows
        +int Columns
    }

    class Seat {
        +int Id
        +int RoomId
        +string RowCode
        +int SeatNumber
        +string SeatCode
        +string SeatType
    }

    class Showtime {
        +int Id
        +int MovieId
        +int RoomId
        +DateTime StartTime
        +DateTime EndTime
        +decimal Price
        +string Status
    }

    class Reservation {
        +int Id
        +int ShowtimeId
        +int SeatId
        +int UserId
        +string ReservationCode
        +DateTime ReservedAt
        +DateTime ExpiresAt
        +string Status
        +bool IsExpired()
    }

    class Ticket {
        +int Id
        +string TicketCode
        +int ShowtimeId
        +int SeatId
        +int UserId
        +decimal PricePaid
        +string PaymentMethod
        +string TransactionId
        +string QrPayload
        +string Status
        +DateTime PurchasedAt
    }

    class User {
        +int Id
        +string Name
        +string Email
        +string Phone
        +string DocumentId
        +DateTime CreatedAt
    }

    class ShowtimeService {
        +GetShowtimesAsync(date, time, movieId, roomId)
        +GetShowtimeSeatsAsync(showtimeId)
        +CreateShowtimeAsync(dto)
    }

    class TicketService {
        +ReserveSeatsAsync(dto)
        +PurchaseTicketsAsync(dto)
        +GetUserTicketsAsync(userId)
    }

    Showtime "1" *-- "many" Seat : consulta
    ShowtimeService ..> Showtime : gestiona
    TicketService ..> Reservation : bloquea 5 min
    TicketService ..> Ticket : emite
    Movie "1" <-- "many" Showtime : asignada
    Room "1" <-- "many" Showtime : proyecta
    Room "1" *-- "many" Seat : contiene
    User "1" <-- "many" Ticket : compra
    User "1" <-- "many" Reservation : reserva
```

---

## 3. Diagrama de Componentes (Component Diagram)

Estructura de arquitectura limpia de capas lógicas y acoplamiento:

```mermaid
flowchart TD
    subgraph Frontend_SPA["Frontend (React 18 + TypeScript + Vite)"]
        UI_Billboard["MovieBillboard (Filtro Semanal)"]
        UI_Seats["SeatSelector (Mapa Interactivo & Concurrencia)"]
        UI_Checkout["CheckoutModal (Validación Formularios)"]
        UI_Ticket["DigitalTicket (Pase de Cine & QR)"]
        UI_Admin["AdminPanel (Gestión Cine)"]
        ApiClient["API Client (Fetch / Axios Service)"]
        
        UI_Billboard --> ApiClient
        UI_Seats --> ApiClient
        UI_Checkout --> ApiClient
        UI_Ticket --> ApiClient
        UI_Admin --> ApiClient
    end

    subgraph Backend_API["Backend .NET Core 9 (ASP.NET Web API)"]
        Controllers["Controllers RESTful (Movies, Showtimes, Tickets, Users, Rooms)"]
        Middleware["ExceptionHandlingMiddleware (RFC 7807) & Security Headers"]
        
        subgraph Business_Layer["Capa de Negocio (Services)"]
            MovieSvc["MovieService"]
            ShowtimeSvc["ShowtimeService (Filtros & Expiración)"]
            TicketSvc["TicketService (Transacciones Atómicas)"]
            RoomSvc["RoomService"]
        end

        subgraph Data_Layer["Capa de Acceso a Datos (EF Core 9)"]
            DbContext["CinemaDbContext (Fluent API & Índices Únicos)"]
            DbSeed["DbInitializer (Semilla de Cartelera)"]
        end

        Controllers --> Middleware
        Controllers --> Business_Layer
        Business_Layer --> Data_Layer
    end

    subgraph Database_Engine["Persistencia de Datos"]
        DB[(PostgreSQL Flexible Server / SQLite Local)]
    end

    ApiClient -->|HTTP REST JSON / CORS| Controllers
    Data_Layer -->|Npgsql / Microsoft.Data.Sqlite| DB
```

---

## 4. Diagrama de Despliegue (Deployment Diagram)

Arquitectura de infraestructura en la nube aprovisionada con Terraform:

```mermaid
flowchart LR
    UserClient(["Navegador del Usuario"])

    subgraph Cloud_Platform["Plataforma Nube (Azure / AWS)"]
        DNS["DNS / Azure Front Door / CDN"]
        
        subgraph Static_Hosting["Frontend Hosting"]
            SWA["Azure Static Web Apps (Dist React SPA)"]
        end

        subgraph VNet["Virtual Network (10.0.0.0/16)"]
            subgraph App_Subnet["Subred de Aplicación (10.0.2.0/24)"]
                AppService["Azure App Service (Linux Web App)"]
                DockerContainer["Contenedor Docker (aspnet:9.0-alpine Non-Root)"]
                AppService --- DockerContainer
            end

            subgraph DB_Subnet["Subred de Base de Datos Privada (10.0.1.0/24)"]
                PostgresDB[("PostgreSQL Flexible Server (v16)
Puerto: 5432
SSL Requerido")]
            end
        end

        DNS -->|HTTPS: 443| SWA
        DNS -->|API Reverse Proxy HTTPS: 443| AppService
        DockerContainer -->|Conexión Segura Interna| PostgresDB
    end

    UserClient -->|Acceso Web| DNS
```
