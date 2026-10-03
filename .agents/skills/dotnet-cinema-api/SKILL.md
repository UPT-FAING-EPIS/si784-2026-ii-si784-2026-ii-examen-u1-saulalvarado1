---
name: dotnet-cinema-api
description: >-
  Directrices de arquitectura limpia para el Backend .NET Core 9 de CinePass (Controllers -> Services -> Repositories)
  con Entity Framework Core, PostgreSQL, validación con FluentValidation, manejo global de excepciones,
  reglas de concurrencia y expiración de reservas (5 min), y pruebas unitarias con xUnit para SonarQube/SonarCloud.
---

# Skill: dotnet-cinema-api

Instrucciones y estándares de arquitectura para el desarrollo del backend de venta de boletos de cine con .NET Core 9.

## 1. Arquitectura Limpia en Capas
- **Controllers**: Exponen endpoints RESTful limpios, delegan la lógica a Services y retornan `ActionResult<T>` con códigos HTTP apropiados (200, 201, 400, 404, 409).
- **Services / Business Logic**: Contienen la lógica de negocio, validaciones complejas, cálculo de importes, control de expiración de reservas temporales (5 minutos) y orquestación.
- **Repositories & Data Access**: Abstracción de acceso a datos con `CinemaDbContext` (EF Core), consultas asíncronas (`async/await`, `AsNoTracking()`), migraciones y soporte para PostgreSQL y SQLite.
- **DTOs / Contracts**: Objetos de transferencia de datos con validadores FluentValidation o DataAnnotations para desacoplar el modelo de dominio de la API pública.

## 2. Reglas de Negocio Clave
1. **Expiración Temporal de Reservas**:
   - Una reserva de asiento tiene una duración de 5 minutos (`ExpiresAt = DateTime.UtcNow.AddMinutes(5)`).
   - Pasados los 5 minutos, el asiento se libera automáticamente si no se confirma la compra.
2. **Restricción Única contra Doble Compra**:
   - Restricción única a nivel de base de datos e índice sobre `(ShowtimeId, SeatId)`.
   - Control de transacciones atómicas con nivel de aislamiento serializable o control de concurrencia optimista/pesimista para garantizar que dos usuarios no puedan reservar ni comprar el mismo asiento al mismo tiempo.
3. **Manejo Global de Excepciones**:
   - Middleware global de excepciones (`ExceptionHandlingMiddleware`) que transforma errores en respuestas estándar RFC 7807 (`ProblemDetails`), evitando fuga de información o stack traces en producción.

## 3. Pruebas y Cobertura
- Pruebas unitarias con xUnit y FluentAssertions para servicios, validadores y controladores.
- Configuración para reporte de cobertura de código (Coverlet / OpenCover) exportable a SonarCloud (`sonar.cs.opencover.reportsPaths`).
