resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
}

resource "google_firebase_web_app" "app" {
  provider     = google-beta
  project      = var.project_id
  display_name = "FloraMatch"
  depends_on   = [google_firebase_project.default]
}