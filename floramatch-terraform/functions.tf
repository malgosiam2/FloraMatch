resource "google_storage_bucket" "functions_bucket" {
  name     = "${var.project_id}-functions-source"
  location = var.region

  uniform_bucket_level_access = true 
  force_destroy = true 
}

resource "google_storage_bucket_object" "garden_zip" {
  name   = "garden-service-${filemd5("functions/garden-service.zip")}.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = "functions/garden-service.zip"
}

resource "google_storage_bucket_object" "recommendation_zip" {
  name   = "plant-recommendation-service-${filemd5("functions/plant-recommendation-service.zip")}.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = "functions/plant-recommendation-service.zip"
}

resource "google_cloudfunctions2_function" "garden_service" {
  name     = "garden-service"
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = "gardenService"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_bucket.name
        object = google_storage_bucket_object.garden_zip.name
      }
    }
  }

  service_config {
    service_account_email = google_service_account.functions_sa.email
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
  ]
}

resource "google_cloudfunctions2_function" "recommendation_service" {
  name     = "plant-recommendation-service"
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = "plantRecommendationService"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_bucket.name
        object = google_storage_bucket_object.recommendation_zip.name
      }
    }
  }

  service_config {
    service_account_email = google_service_account.functions_sa.email
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
  lifecycle {
    replace_triggered_by = [
      google_storage_bucket_object.recommendation_zip.md5hash
    ]
  }

  depends_on = [
    google_project_service.services,
  ]
}