resource "google_storage_bucket" "functions_bucket" {
  name     = "${var.project_id}-functions-source"
  location = var.region

  uniform_bucket_level_access = true 
  force_destroy = true 
}

resource "google_storage_bucket_object" "garden_zip" {
  name   = "garden-service.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = "functions/garden-service.zip"
}

resource "google_storage_bucket_object" "recommendation_zip" {
  name   = "plant-recommendation-service.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = "functions/plant-recommendation-service.zip"
}

# Garden Service
resource "google_cloudfunctions2_function" "garden_service" {
  name     = "garden-service"
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = "gardenService"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_bucket.name
        object = "garden-service.zip"
      }
    }
  }

  service_config {
    service_account_email = google_service_account.functions_sa.email
    vpc_connector         = google_vpc_access_connector.connector.id
    available_memory      = "256M"

    secret_environment_variables {
      key        = "DB_PASSWORD"
      project_id = var.project_id
      secret     = google_secret_manager_secret.db_password.secret_id
      version    = "latest"
    }
  }

  depends_on = [
    google_project_service.services,
    google_vpc_access_connector.connector
  ]
}


# Recommendation Service
resource "google_cloudfunctions2_function" "recommendation_service" {
  name     = "plant-recommendation-service"
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = "recommendationService"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_bucket.name
        object = "plant-recommendation-service.zip"
      }
    }
  }

  service_config {
    service_account_email = google_service_account.functions_sa.email
    vpc_connector         = google_vpc_access_connector.connector.id
    available_memory      = "256M"

    environment_variables = {
      REDIS_HOST = google_redis_instance.cache.host
      DB_CONNECTION_NAME = google_sql_database_instance.plants_db.connection_name
    }


    secret_environment_variables {
      key        = "DB_PASSWORD"
      project_id = var.project_id
      secret     = google_secret_manager_secret.db_password.secret_id
      version    = "latest"
    }
  }
  depends_on = [
    google_project_service.services,
    google_vpc_access_connector.connector
  ]

}

