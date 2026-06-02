output "api_gateway_url" {

  value = google_api_gateway_gateway.floramatch_gateway.default_hostname

}

output "garden_service_url" {
  value = google_cloudfunctions2_function.garden_service.service_config[0].uri
}

output "recommendation_service_url" {
  value = google_cloudfunctions2_function.recommendation_service.service_config[0].uri
}