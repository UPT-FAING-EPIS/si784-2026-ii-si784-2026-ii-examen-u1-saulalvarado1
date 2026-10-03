---
name: github-actions-security-pipelines
description: >-
  Diseño e implementación de pipelines seguros en GitHub Actions (sonar.yml, snyk-semgrep.yml, deploy.yml)
  con uso estricto de GitHub Secrets, escaneos SAST/SCA con reportes SARIF y artefactos de evidencia,
  y reglas para garantizar 0 bugs, 0 vulnerabilidades y 0 security hotspots en SonarQube/SonarCloud.
---

# Skill: github-actions-security-pipelines

Directrices para la implementación de pipelines CI/CD seguros y análisis estático de código.

## 1. Pipelines Requeridos
1. **`sonar.yml`**:
   - Escaneo estático de código para .NET y Frontend (TypeScript/React).
   - Recolección de cobertura de pruebas unitarias.
   - Quality Gate estricto: falla si hay bugs, vulnerabilidades o hotspots sin resolver.
   - Reglas anti-hotspots:
     - No concatenar cadenas SQL (uso obligatorio de LINQ / parámetros parametrizados de EF Core).
     - CORS restringido a orígenes autorizados, evitando `AllowAnyOrigin()` con credenciales.
     - Forzar HTTPS y cabeceras de seguridad (HSTS, X-Content-Type-Options, etc.).
     - Cero credenciales o claves privadas hardcodeadas en código fuente.

2. **`snyk-semgrep.yml`**:
   - **Semgrep**: Análisis SAST rápido basado en reglas OWASP Top 10 y CWE.
   - **Snyk Container & Code**: Escaneo de dependencias (SCA) y de la imagen Docker generada.
   - Exportación de resultados a formato SARIF (`results.sarif`) y artefactos descargables como evidencia de conformidad.

3. **`deploy.yml`**:
   - Construcción de imagen de contenedor, etiquetado con SHA de Git y `latest`.
   - Push al registro de contenedores (Docker Hub o GitHub Packages / GHCR).
   - Despliegue automatizado hacia el entorno en la nube aprovisionado por Terraform.
