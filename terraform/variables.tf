variable "environment" {
  type        = string
  description = "Entorno de despliegue (dev, staging, prod)"
  default     = "prod"
}

variable "location" {
  type        = string
  description = "Región de la nube para el aprovisionamiento de recursos"
  default     = "eastus2"
}

variable "project_name" {
  type        = string
  description = "Nombre del proyecto"
  default     = "cinepass"
}

variable "db_admin_user" {
  type        = string
  description = "Usuario administrador de la base de datos PostgreSQL"
  default     = "cinepassadmin"
}

variable "db_admin_password" {
  type        = string
  description = "Contraseña del administrador de base de datos"
  sensitive   = true
}

variable "container_image" {
  type        = string
  description = "Imagen de contenedor Docker para el backend"
  default     = "ghcr.io/upt-faing-epis/si784-2026-ii-si784-2026-ii-examen-u1-saulalvarado1:latest"
}
