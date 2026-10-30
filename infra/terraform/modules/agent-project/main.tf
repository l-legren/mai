data "google_project" "this" {
  project_id = var.project_id
}

resource "google_project_service" "apis" {
  for_each = toset(var.apis)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_service_account" "web_invoker" {
  project      = var.project_id
  account_id   = "mai-web-invoker"
  display_name = "apps/web -> Cloud Run agent invoker"
}

resource "google_service_account" "agent_deployer" {
  project      = var.project_id
  account_id   = "agent-deployer"
  display_name = "agent-deployer"
  description  = "A deployer of agent from Github Actions"
}

resource "google_service_account_iam_member" "web_invoker_self_token_creator" {
  service_account_id = google_service_account.web_invoker.name
  role               = "roles/iam.serviceAccountOpenIdTokenCreator"
  member             = "serviceAccount:${google_service_account.web_invoker.email}"
}

resource "google_artifact_registry_repository" "agent" {
  project       = var.project_id
  location      = var.region
  repository_id = var.artifact_repo_id
  format        = "DOCKER"
  description   = "mai agent container image"

  depends_on = [google_project_service.apis]
}

resource "google_artifact_registry_repository_iam_member" "deployer_writer" {
  project    = var.project_id
  location   = var.region
  repository = google_artifact_registry_repository.agent.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.agent_deployer.email}"
}

resource "google_secret_manager_secret" "secrets" {
  for_each  = toset(var.secret_names)
  project   = var.project_id
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

# Additive only — never a google_project_iam_policy/binding, which would clobber roles/owner
# and GCP's auto-granted service-agent bindings on first apply.
resource "google_project_iam_member" "compute_sa_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${data.google_project.this.number}-compute@developer.gserviceaccount.com"
}
