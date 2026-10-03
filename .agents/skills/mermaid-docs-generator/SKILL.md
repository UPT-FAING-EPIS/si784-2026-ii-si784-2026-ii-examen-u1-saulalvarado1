---
name: mermaid-docs-generator
description: >-
  Generación automática de documentación técnica de arquitectura y base de datos en formato Mermaid y Markdown,
  incluyendo Diccionario de Datos, Diagrama Entidad-Relación (erDiagram), Diagrama de Clases (classDiagram),
  Diagrama de Componentes (flowchart TD) y Diagrama de Despliegue (flowchart LR), orquestado por un script ejecutable
  y el workflow generase-documentation.yml con commit automático al repositorio.
---

# Skill: mermaid-docs-generator

Automatización de la documentación técnica y generación de diagramas Mermaid para CinePass.

## 1. Documentos Generados
1. **Diccionario de Datos (`docs/DATA_DICTIONARY.md`)**:
   - Tablas completas con nombres de columnas, tipos de datos, restricciones (PK, FK, Unique, Not Null), valores por defecto y descripciones de negocio.
2. **Diagrama Entidad-Relación (`docs/DIAGRAMS.md` -> `erDiagram`)**:
   - Entidades: Movies, Rooms, Seats, Showtimes, Reservations, Tickets, Users con sus claves foráneas y cardinalidades (`||--o{`, etc.).
3. **Diagrama de Clases (`docs/DIAGRAMS.md` -> `classDiagram`)**:
   - Estructura de dominio, atributos, métodos clave y relaciones de herencia y agregación.
4. **Diagrama de Componentes (`docs/DIAGRAMS.md` -> `flowchart TD`)**:
   - Capas de Frontend (Vite/React), API Gateway/Reverse Proxy, Controllers, Services, Repositories, DbContext y Base de Datos PostgreSQL/SQLite.
5. **Diagrama de Despliegue (`docs/DIAGRAMS.md` -> `flowchart LR`)**:
   - Nube, VPC/VNet, Contenedor Docker en App Service/Container Runner, Base de datos administrada y CI/CD pipelines.

## 2. Script de Generación y Workflow
- Un script (`scripts/generate_docs.py` o `scripts/generate_docs.js`) que analiza los modelos y esquemas para escribir los archivos `.md`.
- El workflow `generase-documentation.yml` ejecuta el script, valida la sintaxis Mermaid, sube el artefacto a GitHub Actions y realiza commit & push automático con `[skip ci]` si hay cambios en la documentación.
