variable "project_id" {
  type    = string
  default = "floramatch-495621"
}

variable "region" {
  type    = string
  default = "europe-central2"
}

variable "db_password" {
  type      = string
  sensitive = true
}