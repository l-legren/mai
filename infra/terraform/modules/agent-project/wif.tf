resource "google_iam_workload_identity_pool" "vercel" {
  project                   = var.project_id
  workload_identity_pool_id = "vercel"
  display_name              = "Vercel"
  description               = "Allows invoking Cloud Run from Vercel"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "vercel" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.vercel.workload_identity_pool_id
  workload_identity_pool_provider_id = "vercel"

  attribute_mapping = {
    "google.subject" = "assertion.sub"
  }

  oidc {
    issuer_uri        = var.vercel_oidc_issuer
    allowed_audiences = [var.vercel_oidc_audience]
  }
}

resource "google_service_account_iam_member" "web_invoker_wif" {
  for_each = toset(var.vercel_trusted_environments)

  service_account_id = google_service_account.web_invoker.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principal://iam.googleapis.com/projects/${data.google_project.this.number}/locations/global/workloadIdentityPools/vercel/subject/owner:${var.vercel_owner_slug}:project:${var.vercel_project_name}:environment:${each.value}"
}

resource "google_iam_workload_identity_pool" "github_actions" {
  project                   = var.project_id
  workload_identity_pool_id = "github-actions"
  display_name              = "github-actions"
  description               = "Pool for github actions"

  depends_on = [google_project_service.apis]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "github"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.repository"       = "assertion.repository"
    "attribute.job_workflow_ref" = "assertion.job_workflow_ref"
  }

  attribute_condition = "assertion.repository == '${var.github_repo}' && assertion.job_workflow_ref == '${var.github_repo}/.github/workflows/deploy-agent.yml@${var.github_actions_branch_ref}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "deployer_wif" {
  service_account_id = google_service_account.agent_deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.this.number}/locations/global/workloadIdentityPools/github-actions/attribute.repository/${var.github_repo}"
}
