variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "europe-west3"
}

variable "artifact_repo_id" {
  type        = string
  description = "Artifact Registry repo id for the agent Docker image. Distinct per environment, never shared."
}

variable "vercel_oidc_issuer" {
  type    = string
  default = "https://oidc.vercel.com/llegrens-projects"
}

variable "vercel_oidc_audience" {
  type    = string
  default = "https://vercel.com/llegrens-projects"
}

variable "vercel_owner_slug" {
  type    = string
  default = "llegrens-projects"
}

variable "vercel_project_name" {
  type    = string
  default = "mai-web"
}

variable "vercel_trusted_environments" {
  type        = list(string)
  description = "Vercel deployment environments allowed to impersonate mai-web-invoker, e.g. [\"development\",\"preview\"] or [\"production\"]."
}

variable "github_repo" {
  type    = string
  default = "l-legren/mai"
}

variable "github_actions_branch_ref" {
  type        = string
  description = "Branch ref the deploy-agent.yml workflow must run on for agent-deployer impersonation to be trusted, e.g. refs/heads/develop or refs/heads/main."
}

variable "secret_names" {
  type = list(string)
  default = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_WORKSPACE_ID",
    "LMNR_PROJECT_API_KEY",
    "MCP_READONLY_DATABASE_URL",
    "MCP_WRITE_DATABASE_URL",
    "LANGGRAPH_DATABASE_URL",
  ]
}

variable "apis" {
  type = list(string)
  default = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "sts.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
  ]
  description = "APIs to enable via Service Usage. Override per-environment: some older projects (e.g. mai-agent-512512) never had cloudresourcemanager/sts/iam explicitly toggled on even though the functionality they gate already works, so importing them fails with 'non-existent remote object' — exclude those for such environments rather than enabling (creating) them during an import-only apply."
}

variable "initial_image" {
  type        = string
  description = "Image the Cloud Run service starts with. CI owns image rollouts afterward (see lifecycle.ignore_changes on the container image)."
}
