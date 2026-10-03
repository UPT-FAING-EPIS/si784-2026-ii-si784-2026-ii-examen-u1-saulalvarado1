terraform {
  required_version = ">= 1.5.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5.0"
    }
  }

  # Configuración para Backend Remoto (Blob Storage para tfstate)
  # backend "azurerm" {
  #   resource_group_name  = "rg-terraform-state"
  #   storage_account_name = "stcinepassterraform"
  #   container_name       = "tfstate"
  #   key                  = "cinepass.prod.tfstate"
  # }
}

provider "azurerm" {
  features {}
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# 1. Grupo de Recursos (Módulo de Recursos)
resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Course      = "SI-784"
  }
}

# 2. Red y Seguridad (Módulo de Red)
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]

  tags = azurerm_resource_group.rg.tags
}

resource "azurerm_subnet" "db_subnet" {
  name                 = "snet-database"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
  delegation {
    name = "fs-delegation"
    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

resource "azurerm_subnet" "app_subnet" {
  name                 = "snet-backend-app"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]
  delegation {
    name = "app-service-delegation"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

# 3. Base de Datos Relacional PostgreSQL Flexible (Módulo Database)
resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = "psql-${var.project_name}-${random_string.suffix.result}"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "16"
  administrator_login    = var.db_admin_user
  administrator_password = var.db_admin_password

  storage_mb = 32768
  sku_name   = "B_Standard_B1ms"

  backup_retention_days = 7
  zone                  = "1"

  tags = azurerm_resource_group.rg.tags
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "cinepass_db"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# 4. Servidor de Contenedores para el Backend .NET Core (Módulo App)
resource "azurerm_service_plan" "asp" {
  name                = "asp-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"

  tags = azurerm_resource_group.rg.tags
}

resource "azurerm_linux_web_app" "backend_app" {
  name                = "app-${var.project_name}-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id

  https_only = true

  site_config {
    always_on = true
    application_stack {
      docker_image_name   = var.container_image
      docker_registry_url = "https://ghcr.io"
    }
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT" = "Production"
    "WEBSITES_PORT"          = "8080"
    "DATABASE_URL"           = "Host=${azurerm_postgresql_flexible_server.postgres.fqdn};Database=${azurerm_postgresql_flexible_server_database.db.name};Username=${var.db_admin_user};Password=${var.db_admin_password};SSL Mode=Require;Trust Server Certificate=true"
  }

  tags = azurerm_resource_group.rg.tags
}

# 5. Frontend Estático CDN (Módulo Frontend)
resource "azurerm_static_web_app" "frontend" {
  name                = "stapp-${var.project_name}-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = azurerm_resource_group.rg.tags
}
