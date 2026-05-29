resource "google_api_gateway_api" "floramatch_api" {

  provider = google-beta

  api_id = "floramatch-api"

  depends_on = [
    google_project_service.services
  ]
}


resource "google_api_gateway_api_config" "floramatch_api_config" {

  provider = google-beta

  api = google_api_gateway_api.floramatch_api.api_id

  api_config_id = "v1"

  openapi_documents {

    document {

      path = "openapi.yaml"

      contents = base64encode(
        file("${path.module}/openapi.yaml")
      )

    }
  }

  depends_on = [
    google_project_service.services
  ]
}

resource "google_api_gateway_gateway" "floramatch_gateway" {

  provider = google-beta

  gateway_id = "floramatch-gateway"

  api_config = google_api_gateway_api_config.floramatch_api_config.id

  region = "europe-west1"
}