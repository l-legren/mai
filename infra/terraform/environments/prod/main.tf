module "agent" {
  source = "../../modules/agent-project"

  project_id       = google_project.prod.project_id
  artifact_repo_id = "mai-agent-prod"

  vercel_trusted_environments = ["production"]
  github_actions_branch_ref   = "refs/heads/main"

  # Google's public sample image — breaks the chicken-and-egg of a Cloud Run service needing a
  # pullable image before this project's own Artifact Registry repo has anything pushed to it.
  # CI's first `gcloud run deploy` on a push to main takes over (image is in lifecycle.ignore_changes).
  initial_image = "us-docker.pkg.dev/cloudrun/container/hello"
}

output "web_invoker_email" {
  value = module.agent.web_invoker_email
}

output "agent_deployer_email" {
  value = module.agent.agent_deployer_email
}

output "github_wif_provider_name" {
  value = module.agent.github_wif_provider_name
}

output "cloud_run_url" {
  value = module.agent.cloud_run_url
}
