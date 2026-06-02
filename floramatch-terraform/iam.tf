data "google_project" "project" {}

resource "google_service_account" "functions_sa" {
  account_id   = "functions-service-account"
  display_name = "Cloud Functions Service Account"
}

resource "google_project_iam_member" "functions_roles" {
  for_each = toset([
    "roles/datastore.user",
    "roles/redis.editor",
    "roles/secretmanager.secretAccessor",
    "roles/logging.logWriter",
    "roles/aiplatform.user"
  ])
  project = var.project_id
  role = each.key
  member = "serviceAccount:${google_service_account.functions_sa.email}"
}

resource "google_service_account_iam_member" "cloud_build_identity" {
  service_account_id = google_service_account.functions_sa.name
  role = "roles/iam.serviceAccountUser"

  member = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com"

  depends_on = [
    google_service_account.functions_sa
  ]
}

resource "google_project_iam_member" "default_compute_build_roles" {
  for_each = toset([
    "roles/logging.logWriter",
    "roles/artifactregistry.writer",
    "roles/storage.objectViewer",
    "roles/iam.serviceAccountUser"
  ])
  project = var.project_id
  role = each.key

  member = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_project_iam_member" "cloud_run_vpc_access" {
  project = var.project_id
  role = "roles/vpcaccess.user"

  member = "serviceAccount:service-${data.google_project.project.number}@serverless-robot-prod.iam.gserviceaccount.com"
}

resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloudfunctions2_function.garden_service.location
  project = var.project_id
  service = google_cloudfunctions2_function.garden_service.name

  role = "roles/run.invoker"
#   member = "allUsers"
  member = "serviceAccount:${google_service_account.gateway_sa.email}"
}

resource "google_cloud_run_service_iam_member" "public_access_recommendations" {
  location = google_cloudfunctions2_function.recommendation_service.location
  project = var.project_id
  service = google_cloudfunctions2_function.recommendation_service.name

  role = "roles/run.invoker"
#   member = "allUsers"
  member = "serviceAccount:${google_service_account.gateway_sa.email}"
}

resource "google_service_account" "gateway_sa" {
  account_id = "gateway-service-account"
  display_name = "API Gateway Service Account"
}

resource "google_cloud_run_service_iam_member" "gateway_invoker_garden" {

  location = google_cloudfunctions2_function.garden_service.location

  project = var.project_id

  service = google_cloudfunctions2_function.garden_service.name

  role = "roles/run.invoker"

  member = "serviceAccount:${google_service_account.gateway_sa.email}"
}

resource "google_cloud_run_service_iam_member" "gateway_invoker_recommendations" {

  location = google_cloudfunctions2_function.recommendation_service.location

  project = var.project_id

  service = google_cloudfunctions2_function.recommendation_service.name

  role = "roles/run.invoker"

  member = "serviceAccount:${google_service_account.gateway_sa.email}"
}