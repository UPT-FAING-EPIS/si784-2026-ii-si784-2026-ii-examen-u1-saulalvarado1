---
name: secure-container-docker
description: >-
  Construcción de imágenes de contenedor Docker multi-etapa seguras y optimizadas para .NET Core,
  utilizando imágenes base mínimas (alpine o chiseled), usuarios sin privilegios (non-root),
  ausencia de secretos en capas y endurecimiento de seguridad para pasar escaneos de Snyk y Trivy con 0 vulnerabilidades.
---

# Skill: secure-container-docker

Guía para la construcción de contenedores Docker seguros para el Backend .NET Core de CinePass.

## 1. Dockerfile Multi-Etapa
- **Etapa de Build**: Utiliza el SDK completo de .NET (`mcr.microsoft.com/dotnet/sdk:9.0-alpine` o similar) para restaurar dependencias con caché y compilar en modo Release.
- **Etapa de Runtime**: Utiliza una imagen base mínima y endurecida (`mcr.microsoft.com/dotnet/aspnet:9.0-alpine` o Chiseled Ubuntu) que reduce la superficie de ataque al no incluir utilidades innecesarias como shells, curl o gestores de paquetes en tiempo de ejecución.

## 2. Buenas Prácticas de Seguridad (0 Vulnerabilidades Snyk/Trivy)
1. **Usuario No-Root**:
   - Ejecutar la aplicación bajo un usuario sin privilegios (`USER app` o UID 10001).
   - Nunca correr el proceso principal como `root`.
2. **Sin Secretos en la Imagen**:
   - Variables de entorno sensibles (contraseñas de BD, tokens JWT, API keys) deben suministrarse en tiempo de ejecución vía GitHub Secrets, Azure Key Vault o AWS Secrets Manager.
   - Usar `.dockerignore` estricto para evitar copiar archivos `.env`, `.git`, certificados locales o binarios.
3. **Optimizaciones de Compilación**:
   - Publicar como binario optimizado con `-c Release -o /app/publish --no-restore`.
   - Considerar `PublishTrimmed=false` para compatibilidad completa con Reflection en EF Core, o habilitar AOT si aplica.
