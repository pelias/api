#Enviroment variables
variable "gcp_project" {
    description = "The GCP project id"
}

variable "location" {
  description = "GCP bucket location"
}
variable "kube_namespace" {
  description = "The Kubernetes namespace"
}

variable "labels" {
  description = "Labels used in all resources"
  type        = map(string)
     default = {
       manager = "terraform"
       team    = "ror"
       slack   = "talk-ror"
       app     = "pelias"
     }
}

variable "load_config_file" {
  description = "Do not load kube config file"
  default     = false
}

variable "storage_bucket_name" {
  description = "GCP buket name"
}


