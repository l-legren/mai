terraform {
  backend "gcs" {
    bucket = "mai-agent-512512-tfstate"
    prefix = "agent/staging"
  }
}
