# One-time: the remote-state bucket for all infra/terraform environments.
# Starts on local state; after the first apply, add backend.tf and run `terraform init -migrate-state`.

resource "google_storage_bucket" "tfstate" {
  name                        = "mai-agent-512512-tfstate"
  project                     = "mai-agent-512512"
  location                    = "EU"
  uniform_bucket_level_access = true
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}
