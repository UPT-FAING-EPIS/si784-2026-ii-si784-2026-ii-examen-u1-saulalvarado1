#!/usr/bin/env python3
"""
Script generador automático de documentación técnica y diagramas Mermaid
para el Sistema de Venta de Boletos para Cine (CinePass).
"""

import os
import sys

DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
os.makedirs(DOCS_DIR, exist_ok=True)

DATA_DICTIONARY_MD = """# Diccionario de Datos: Base de Datos Relacional CinePass

Este documento describe la estructura detallada de las tablas, columnas, tipos de datos, restricciones y reglas de integridad para el sistema de venta de boletos de cine.

---

## 1. Tabla: `movies` (Películas)
Almacena el catálogo de películas exhibidas en el cine.

| Columna | Tipo de Dato | Nulo | Clave | Restricciones / Default | Descripción |
|---|---|---|---|---|---|
| `id` | INTEGER / SERIAL | NO | PK | Auto-incremental | Identificador único de la película |
| `title` | VARCHAR(200) | NO | | Longitud máx 200 | Título oficial de la película |
| `synopsis` | VARCHAR(1000) | SÍ | | Longitud máx 1000 | Sinopsis y argumento de la película |
| `genre` | VARCHAR(100) | NO | | Ej: Acción, Sci-Fi | Género cinematográfico |
| `duration_minutes` | INTEGER | NO | | CHECK (duration > 0) | Duración en minutos |
| `poster_url` | VARCHAR(500) | SÍ | | Formato URL | Enlace al póster oficial |
| `rating` | VARCHAR(10) | NO | | G, PG, PG-13, R, NC-17 | Clasificación por edades |
| `is_active` | BOOLEAN | NO | | DEFAULT true | Estado activo/inactivo (Soft delete) |
| `created_at` | TIMESTAMP | NO | | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |

---

## 2. Tabla: `rooms` (Salas)
Representa los auditorios o salas de proyección del cine.

| Columna | Tipo de Dato | Nulo | Clave | Restricciones / Default | Descripción |
|---|---|---|---|---|---|
| `id` | INTEGER / SERIAL | NO | PK | Auto-incremental | Identificador único de la sala |
| `name` | VARCHAR(100) | NO | | Único | Nombre (ej. 'Sala 1 - IMAX Laser') |
| `capacity` | INTEGER | NO | | CHECK (capacity > 0) | Capacidad total de butacas |
| `room_type` | VARCHAR(50) | NO | | 2D, 3D, IMAX, VIP | Formato de pantalla y sonido |
| `rows` | INTEGER | NO | | DEFAULT 6 | Cantidad de filas de asientos |
| `columns` | INTEGER | NO | | DEFAULT 8 | Cantidad de columnas de asientos |

---

## 3. Tabla: `seats` (Asientos)
Representa cada butaca física dentro de una sala específica.

| Columna | Tipo de Dato | Nulo | Clave | Restricciones / Default | Descripción |
|---|---|---|---|---|---|
| `id` | INTEGER / SERIAL | NO | PK | Auto-incremental | Identificador único del asiento |
| `room_id` | INTEGER | NO | FK | REFERENCES rooms(id) | Sala a la que pertenece la butaca |
| `row_code` | VARCHAR(10) | NO | | Ej. 'A', 'B', 'C' | Letra o código de fila |
| `seat_number` | INTEGER | NO | | Ej. 1, 2, 3 | Número de butaca dentro de la fila |
| `seat_code` | VARCHAR(20) | NO | | Ej. 'A-1', 'B-4' | Código visual del asiento |
| `seat_type` | VARCHAR(20) | NO | | Standard, VIP | Categoría y confort de la butaca |

> **Índice Único**: `UNIQUE(room_id, row_code, seat_number)` para evitar butacas duplicadas.

---

## 4. Tabla: `showtimes` (Funciones)
Programación de películas en una sala, fecha y hora específicas.

| Columna | Tipo de Dato | Nulo | Clave | Restricciones / Default | Descripción |
|---|---|---|---|---|---|
| `id` | INTEGER / SERIAL | NO | PK | Auto-incremental | Identificador único de la función |
| `movie_id` | INTEGER | NO | FK | REFERENCES movies(id) | Película proyectada |
| `room_id` | INTEGER | NO | FK | REFERENCES rooms(id) | Sala asignada |
| `start_time` | TIMESTAMP | NO | | | Fecha y hora de inicio |
| `end_time` | TIMESTAMP | NO | | | Fecha y hora de fin calculada (+buffer) |
| `price` | DECIMAL(10,2) | NO | | CHECK (price > 0) | Precio base de la entrada |
| `status` | VARCHAR(20) | NO | | Scheduled, Cancelled | Estado de la función |

> **Índice Compuesto**: `INDEX(start_time, movie_id, room_id)` para acelerar consultas por cartelera semanal.

---

## 5. Tabla: `reservations` (Reservas Temporales)
Bloquea temporalmente un asiento durante el proceso de compra (regla de 5 minutos).

| Columna | Tipo de Dato | Nulo | Clave | Restricciones / Default | Descripción |
|---|---|---|---|---|---|
| `id` | INTEGER / SERIAL | NO | PK | Auto-incremental | Identificador único de la reserva |
| `showtime_id` | INTEGER | NO | FK | REFERENCES showtimes(id) | Función asociada |
| `seat_id` | INTEGER | NO | FK | REFERENCES seats(id) | Asiento temporalmente bloqueado |
| `user_id` | INTEGER | SÍ | FK | REFERENCES users(id) | Usuario que realiza la reserva |
| `reservation_code`| VARCHAR(100) | NO | | Formato 'RES-XXXXXXXX' | Código de seguimiento de la reserva |
| `reserved_at` | TIMESTAMP | NO | | DEFAULT CURRENT_TIMESTAMP | Momento en que inició el bloqueo |
| `expires_at` | TIMESTAMP | NO | | reserved_at + 5 min | Límite para confirmar la compra |
| `status` | VARCHAR(20) | NO | | Active, Confirmed, Expired | Estado del bloqueo |

---

## 6. Tabla: `tickets` (Boletos Comprados)
Representa las entradas efectivamente pagadas y confirmadas.

| Columna | Tipo de Dato | Nulo | Clave | Restricciones / Default | Descripción |
|---|---|---|---|---|---|
| `id` | INTEGER / SERIAL | NO | PK | Auto-incremental | Identificador de entrada |
| `ticket_code` | VARCHAR(50) | NO | UNIQUE | Formato 'TKT-XXXXXXXX' | Código de boleto para el cliente |
| `showtime_id` | INTEGER | NO | FK | REFERENCES showtimes(id) | Función comprada |
| `seat_id` | INTEGER | NO | FK | REFERENCES seats(id) | Asiento asignado |
| `user_id` | INTEGER | NO | FK | REFERENCES users(id) | Cliente comprador |
| `price_paid` | DECIMAL(10,2) | NO | | | Precio cobrado |
| `payment_method`| VARCHAR(50) | NO | | CreditCard, Yape, Plin | Pasarela utilizada |
| `transaction_id`| VARCHAR(100) | NO | | Ej. 'TXN-20261002...' | Identificador de transacción de pago |
| `qr_payload` | VARCHAR(500) | NO | | String cifrado/firmado | Contenido para validación QR en puerta |
| `status` | VARCHAR(20) | NO | | Valid, Used, Cancelled | Estado del boleto |
| `purchased_at` | TIMESTAMP | NO | | DEFAULT CURRENT_TIMESTAMP | Fecha y hora de compra |

> **Restricción Única Crítica**: `UNIQUE(showtime_id, seat_id)` garantiza que nunca existan dos boletos para el mismo asiento en una función.

---

## 7. Tabla: `users` (Usuarios y Clientes)
Clientes registrados o compradores en línea.

| Columna | Tipo de Dato | Nulo | Clave | Restricciones / Default | Descripción |
|---|---|---|---|---|---|
| `id` | INTEGER / SERIAL | NO | PK | Auto-incremental | Identificador de usuario |
| `name` | VARCHAR(100) | NO | | | Nombre completo |
| `email` | VARCHAR(150) | NO | UNIQUE | Formato Email | Correo electrónico de contacto |
| `phone` | VARCHAR(20) | SÍ | | | Teléfono móvil |
| `document_id` | VARCHAR(20) | SÍ | | DNI / Pasaporte | Documento de identidad |
| `created_at` | TIMESTAMP | NO | | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |
"""

DIAGRAMS_MD = """# Diagramas Técnicos de Arquitectura CinePass (Formato Mermaid)

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
                PostgresDB[("PostgreSQL Flexible Server (v16)\nPuerto: 5432\nSSL Requerido")]
            end
        end

        DNS -->|HTTPS: 443| SWA
        DNS -->|API Reverse Proxy HTTPS: 443| AppService
        DockerContainer -->|Conexión Segura Interna| PostgresDB
    end

    UserClient -->|Acceso Web| DNS
```
"""

def generate():
    dict_path = os.path.join(DOCS_DIR, "DATA_DICTIONARY.md")
    with open(dict_path, "w", encoding="utf-8") as f:
        f.write(DATA_DICTIONARY_MD)
    print(f"[OK] Generado Diccionario de Datos: {dict_path}")

    diag_path = os.path.join(DOCS_DIR, "DIAGRAMS.md")
    with open(diag_path, "w", encoding="utf-8") as f:
        f.write(DIAGRAMS_MD)
    print(f"[OK] Generados Diagramas Mermaid: {diag_path}")

if __name__ == "__main__":
    generate()
