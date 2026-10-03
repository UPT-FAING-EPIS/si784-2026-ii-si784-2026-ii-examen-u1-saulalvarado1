# CinePass — Sistema de Venta de Boletos para Cine

[![SonarCloud Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=saulalvarado1-lab_si784-2026-ii-examen-u1-saulalvarado1&metric=alert_status)](https://sonarcloud.io/project/overview?id=saulalvarado1-lab_si784-2026-ii-examen-u1-saulalvarado1)
[![Security Analysis](https://github.com/UPT-FAING-EPIS/si784-2026-ii-examen-u1-saulalvarado1/actions/workflows/snyk-semgrep.yml/badge.svg)](https://github.com/UPT-FAING-EPIS/si784-2026-ii-examen-u1-saulalvarado1/actions/workflows/snyk-semgrep.yml)
[![CI/CD Deploy](https://github.com/UPT-FAING-EPIS/si784-2026-ii-examen-u1-saulalvarado1/actions/workflows/deploy.yml/badge.svg)](https://github.com/UPT-FAING-EPIS/si784-2026-ii-examen-u1-saulalvarado1/actions/workflows/deploy.yml)

Plataforma web de última generación para la venta de boletos de cine que permite consultar la cartelera semanal por fecha, hora y tipo de sala, seleccionar asientos con mapa interactivo en tiempo real, reservar temporalmente entradas (bloqueo por 5 minutos) y comprar de forma segura con emisión de boletos digitales con código QR.

---

## 📌 Enlaces del Proyecto

| Recurso | URL |
|---|---|
| **🌐 Aplicación Publicada** | [https://cinepass-app.azurewebsites.net](https://cinepass-app.azurewebsites.net) |
| **🐙 Repositorio GitHub** | [https://github.com/UPT-FAING-EPIS/si784-2026-ii-examen-u1-saulalvarado1](https://github.com/UPT-FAING-EPIS/si784-2026-ii-examen-u1-saulalvarado1) |
| **📊 SonarCloud Dashboard** | [https://sonarcloud.io/project/overview?id=saulalvarado1-lab_si784-2026-ii-examen-u1-saulalvarado1](https://sonarcloud.io/project/overview?id=saulalvarado1-lab_si784-2026-ii-examen-u1-saulalvarado1) |

---

## 🚀 Arquitectura y Tecnologías

### Backend (.NET Core 9 RESTful API)
- **Arquitectura Limpia**: Capas desacopladas (Controllers → Services → DbContext/Repositories).
- **Persistencia**: Entity Framework Core 9 con soporte dual: **SQLite** (local portable) y **PostgreSQL Flexible Server** (producción en la nube).
- **Reglas de Negocio Clave**:
  - **Expiración temporal**: Las reservas de asientos expiran automáticamente en 5 minutos si la compra no se confirma.
  - **Restricción única de compra**: Índice único sobre `(showtime_id, seat_id)` y transacciones de base de datos para prevenir doble compra o condiciones de carrera.
- **Validación de Datos**: Validación rigurosa de DTOs y manejo global de excepciones mediante middleware RFC 7807 (`ProblemDetails`).
- **Pruebas Automatizadas**: Suite completa de tests unitarios y de integración con **xUnit** y cobertura de código.

### Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
- **Cartelera Semanal**: Selector de días de la semana (Lunes a Domingo), filtro dinámico por título, género y tipo de sala (2D, 3D, IMAX, VIP).
- **Selector Interactivo de Asientos**: Representación gráfica con curvatura de pantalla de cine, butacas estándar y VIP, asientos ocupados, reservados y seleccionados.
- **Temporizador de Reserva**: Reloj regresivo de 5 minutos visible con alerta de expiración en tiempo real.
- **Pasarela de Compra**: Formulario con validación completa en el cliente (DNI, Nombre, Email, Tarjeta, Yape o Plin).
- **Boleto Digital**: Entrada cinematográfica con código de barras, código QR para control en puerta y opción de impresión/descarga.
- **Historial de Usuario**: Consulta de compras anteriores y entradas emitidas por usuario.
- **Panel de Administración**: Registro de nuevas películas, configuración de salas y programación de funciones.

---

## 📡 Endpoints de la API RESTful

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/movies` | Listar películas en cartelera |
| `POST` | `/movies` | Registrar nueva película |
| `GET` | `/movies/{id}` | Obtener detalle de película |
| `GET` | `/showtimes?date={fecha}&time={hora}` | Consultar funciones filtradas por fecha y hora |
| `POST` | `/showtimes` | Programar función de película |
| `GET` | `/showtimes/{id}` | Detalle de función |
| `GET` | `/showtimes/{id}/seats` | Ver disponibilidad y mapa de asientos en tiempo real |
| `POST` | `/tickets/reservations` | Reservar asientos temporalmente (bloqueo por 5 min) |
| `POST` | `/tickets/purchase` | Confirmar compra de boletos y generar comprobante |
| `GET` | `/users/{id}/tickets` | Ver boletos comprados por un usuario |
| `GET` | `/rooms` | Listar salas de cine disponibles |
| `POST` | `/rooms` | Registrar nueva sala con generación automática de asientos |
| `GET` | `/health` | Chequeo de salud del servicio |

---

## 🛡️ Contenedor Docker Seguro

Se diseñó un `Dockerfile` multi-etapa optimizado en `backend/CinemaTickets.API/Dockerfile`:
- **Imagen Base de Runtime**: `mcr.microsoft.com/dotnet/aspnet:9.0-alpine` (mínima superficie de ataque).
- **Usuario No-Root**: La aplicación corre bajo el usuario sin privilegios `cinemaapp` (UID: 10001).
- **Cero Secretos**: Variables de entorno inyectadas en tiempo de ejecución.
- **Healthcheck Integrado**: Verificación periódica del estado del contenedor.

Para compilar y ejecutar localmente con Docker Compose:
```bash
docker compose up --build
```

---

## ⚙️ Automatizaciones de CI/CD (GitHub Actions)

Ubicadas en `.github/workflows/`:

1. **`infra.yml`** (Aprovisionamiento Cloud con Terraform):
   - Ejecuta `terraform fmt`, `init`, `validate`, `plan` y `apply` automático en la rama `main`.
   - Aprovisiona red virtual, PostgreSQL Flexible Server, App Service y Static Web App.

2. **`sonar.yml`** (Escaneo de Calidad y Seguridad de Código):
   - Escaneo estático para .NET 9 y Frontend con SonarCloud Scanner.
   - Ejecuta pruebas unitarias y exporta cobertura con formato OpenCover.
   - Quality Gate estricto: 0 bugs, 0 vulnerabilidades y 0 security hotspots.

3. **`snyk-semgrep.yml`** (Seguridad SAST y SCA):
   - Análisis SAST con **Semgrep** contra reglas OWASP Top 10 y CWE.
   - Escaneo de dependencias e imagen de contenedor con **Snyk** y **Trivy**.
   - Publicación de reportes SARIF y artefactos de evidencia.

4. **`deploy.yml`** (Despliegue Continuo):
   - Compila frontend y backend, ejecuta pruebas xUnit.
   - Construye la imagen de contenedor Docker y la publica en GitHub Packages (GHCR).
   - Despliega automáticamente a la nube.

5. **`generase-documentation.yml`** (Generación Automatizada de Documentación Mermaid):
   - Ejecuta el script `scripts/generate_docs.py`.
   - Genera el Diccionario de Datos (`docs/DATA_DICTIONARY.md`).
   - Genera Diagrama ER, Diagrama de Clases, Diagrama de Componentes y Diagrama de Despliegue en formato Mermaid (`docs/DIAGRAMS.md`).
   - Sube artefactos y hace commit automático de la documentación actualizada.

---

## 📖 Documentación Técnica

- 📋 [Diccionario de Datos de la Base de Datos](docs/DATA_DICTIONARY.md)
- 📊 [Diagramas de Arquitectura Mermaid (ER, Clases, Componentes, Despliegue)](docs/DIAGRAMS.md)

---

## 💻 Instrucciones para Ejecución Local

### Prerrequisitos
- .NET SDK 9.0 o superior
- Node.js 18+ y npm
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/UPT-FAING-EPIS/si784-2026-ii-examen-u1-saulalvarado1.git
cd si784-2026-ii-examen-u1-saulalvarado1
```

### 2. Iniciar el Backend (.NET Core 9)
```bash
cd backend/CinemaTickets.API
dotnet run
```
*La API iniciará en `http://localhost:5000` con Swagger UI en `http://localhost:5000/swagger`.*

### 3. Ejecutar Pruebas Unitarias
```bash
dotnet test backend/CinemaTickets.sln
```

### 4. Iniciar el Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Accede a la interfaz web en `http://localhost:5173`.*

---

## 👤 Estudiante
- **Nombre**: Saul Alvarado
- **Repositorio**: `si784-2026-ii-examen-u1-saulalvarado1`
- **Universidad**: Universidad Privada de Tacna (UPT)
- **Facultad**: Facultad de Ingeniería
- **Escuela**: Escuela Profesional de Ingeniería de Sistemas (EPIS)
- **Curso**: SI-784 Ingeniería de Software II