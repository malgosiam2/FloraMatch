resource "google_project_service" "services" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "run.googleapis.com",
    "firestore.googleapis.com",
    "sqladmin.googleapis.com",
    "redis.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com",
    "aiplatform.googleapis.com"
  ])
  service            = each.key
  disable_dependent_services = true
  disable_on_destroy = false
}

resource "google_compute_network" "vpc_network" {
  name       = "flora-match-vpc"
  depends_on = [google_project_service.services]
}

resource "google_vpc_access_connector" "connector" {
  name          = "flora-connector"
  region        = "europe-central2"
  network       = "flora-match-vpc"
  ip_cidr_range = "10.8.0.0/28"

  min_instances = 2
  max_instances = 10
}