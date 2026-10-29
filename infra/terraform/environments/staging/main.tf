module "agent" {
  source = "../../modules/agent-project"

  project_id       = "mai-agent-512512"
  artifact_repo_id = "mai-agent"

  # cloudresourcemanager/sts/iam were never explicitly toggled on via Service Usage on this
  # older project (the functionality they gate already works regardless) — excluded so the
  # import-only apply never tries to CREATE them. See modules/agent-project/variables.tf "apis".
  apis = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iamcredentials.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
  ]

  vercel_trusted_environments = ["development", "preview"]
  github_actions_branch_ref   = "refs/heads/develop"

  # Irrelevant post-import: Cloud Run's image attribute is in lifecycle.ignore_changes,
  # so this value is never applied against the live service.
  initial_image = "europe-west3-docker.pkg.dev/mai-agent-512512/mai-agent/agent:latest"
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
