output "backend_app_url" {
  description = "URL pública del backend API desplegado"
  value       = "https://${azurerm_linux_web_app.backend_app.default_hostname}"
}

output "frontend_url" {
  description = "URL pública del frontend de CinePass"
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "postgres_fqdn" {
  description = "FQDN de la base de datos PostgreSQL Flexible Server"
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
}
