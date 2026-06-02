# redis
resource "google_redis_instance" "cache" {
  name           = "recommendation-cache"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region

  authorized_network = google_compute_network.main.id
}

# Firestore
resource "google_firestore_database" "default" {
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

resource "google_firestore_database" "plants123" {
  name        = "plants123"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

import {
  to = google_firestore_database.plants123
  id = "projects/floramatch-497314/databases/plants123"
}