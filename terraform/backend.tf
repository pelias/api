
  # Describe where terraform will store the state of infrastructure
  terraform {
    backend "gcs" {
    bucket = "entur-system-tf-backend-ror"
    prefix = "gcp/ror/pelias"
    }
  }