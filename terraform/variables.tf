#Enviroment variables
variable "gcp_project" {
    description = "The GCP project id"
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

variable "service_account_bucket_role" {
  description = "Role of the Service Account - more about roles https://cloud.google.com/storage/docs/access-control/iam-roles"
  default     = "roles/storage.objectViewer"
}


