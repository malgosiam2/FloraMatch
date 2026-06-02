resource "google_compute_network" "main" {
  name                    = "floramatch-network"
  auto_create_subnetworks = true
}

resource "google_vpc_access_connector" "connector" {
  name          = "floramatch-connector"
  region        = var.region
  network       = google_compute_network.main.name
  ip_cidr_range = "10.8.0.0/28"

  min_instances = 2
  max_instances = 3
}