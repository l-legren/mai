resource "google_cloud_run_service" "agent" {
  name     = "mai-agent"
  project  = var.project_id
  location = var.region

  template {
    metadata {
      annotations = {
        "run.googleapis.com/startup-cpu-boost" = "true"
      }
    }

    spec {
      container_concurrency = 80
      timeout_seconds       = 300

      containers {
        image = var.initial_image

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        dynamic "env" {
          for_each = toset(var.secret_names)
          content {
            name = env.value
            value_from {
              secret_key_ref {
                name = google_secret_manager_secret.secrets[env.value].secret_id
                key  = "latest"
              }
            }
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image,
      template[0].metadata[0].name,
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
      template[0].metadata[0].annotations["run.googleapis.com/operation-id"],
      metadata[0].annotations["serving.knative.dev/creator"],
      metadata[0].annotations["serving.knative.dev/lastModifier"],
      # maxScale (--max-instances) is a gcloud/CI-owned operational knob, not a plain
      # user annotation in this provider's schema — GCP reports it only via
      # effective_annotations, so Terraform can't author it cleanly. Never fight it.
      metadata[0].annotations["run.googleapis.com/maxScale"],
    ]
  }

  depends_on = [google_project_service.apis]
}

resource "google_cloud_run_service_iam_member" "deployer_developer" {
  project  = var.project_id
  location = var.region
  service  = google_cloud_run_service.agent.name
  role     = "roles/run.developer"
  member   = "serviceAccount:${google_service_account.agent_deployer.email}"
}

resource "google_cloud_run_service_iam_member" "web_invoker_invoker" {
  project  = var.project_id
  location = var.region
  service  = google_cloud_run_service.agent.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.web_invoker.email}"
}
