---
name: terraform-cloud-infra
description: >-
  Estructuración de infraestructura como código (IaC) con Terraform para Azure o AWS,
  con soporte de backend de estado remoto, modularización limpia (red, base de datos relacional, contenedor backend, frontend estático)
  y aislamiento de variables sensibles para ejecución desatendida en infra.yml.
---

# Skill: terraform-cloud-infra

Estructura y directrices para el aprovisionamiento de infraestructura en la nube mediante Terraform y GitHub Actions.

## 1. Módulos y Arquitectura Nube
- **Networking**: VPC/VNet, subredes públicas y privadas, grupos de seguridad / NSG con puertos restringidos (80, 443, y 5432 solo accesible internamente).
- **Database**: Servicio administrado de base de datos relacional (ej. Azure Database for PostgreSQL Flexible Server o AWS RDS PostgreSQL).
- **Backend Container Host**: Servicio de contenedores en la nube (ej. Azure App Service / Container Apps o AWS App Runner / ECS Fargate) conectado a la base de datos de forma segura.
- **Frontend Hosting**: Almacenamiento estático con CDN (ej. Azure Static Web Apps / S3 + CloudFront).

## 2. Buenas Prácticas
1. **Backend Remoto**: Configurar bloque de backend remoto para almacenar el archivo `terraform.tfstate` en almacenamiento seguro con bloqueo de estado (State Locking).
2. **Variables Sensibles**:
   - `db_password`, `jwt_secret` marcados con `sensitive = true`.
   - Nunca incluir contraseñas en `terraform.tfvars` dentro del repositorio; inyectarlas mediante variables de entorno `TF_VAR_*` en GitHub Actions.
3. **Pipeline `infra.yml`**:
   - Pasos: `terraform fmt -check`, `terraform init`, `terraform validate`, `terraform plan`, y ejecución condicional de `terraform apply` en la rama principal.
