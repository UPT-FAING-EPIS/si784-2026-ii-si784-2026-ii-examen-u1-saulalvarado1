# Diccionario de Datos: Base de Datos Relacional CinePass

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
