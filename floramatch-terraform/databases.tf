# Cloud SQL
resource "google_sql_database_instance" "plants_db" {
  name                = "plants-db"
  database_version    = "POSTGRES_15"
  region              = var.region

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
    }
  }
}

resource "google_sql_database" "plants" {
  name     = "plants"
  instance = google_sql_database_instance.plants_db.name
}

# redis
resource "google_redis_instance" "cache" {
  name           = "recommendation-cache"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region
  authorized_network = google_compute_network.vpc_network.id
}

# Firestore
resource "google_firestore_database" "default" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}