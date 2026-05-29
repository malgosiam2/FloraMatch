output "api_gateway_url" {

  value = google_api_gateway_gateway.floramatch_gateway.default_hostname

}