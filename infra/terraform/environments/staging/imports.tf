# Staging codifies resources that already exist, created by hand via gcloud/console.
# Every resource in the module must be imported here — terraform apply must never CREATE
# anything in mai-agent-512512, only adopt it into state. After the first successful
# `terraform plan` shows an empty diff, these blocks can stay (Terraform treats an
# already-imported resource's import block as a no-op).

import {
  to = module.agent.google_project_service.apis["run.googleapis.com"]
  id = "mai-agent-512512/run.googleapis.com"
}
import {
  to = module.agent.google_project_service.apis["artifactregistry.googleapis.com"]
  id = "mai-agent-512512/artifactregistry.googleapis.com"
}
import {
  to = module.agent.google_project_service.apis["secretmanager.googleapis.com"]
  id = "mai-agent-512512/secretmanager.googleapis.com"
}
import {
  to = module.agent.google_project_service.apis["iamcredentials.googleapis.com"]
  id = "mai-agent-512512/iamcredentials.googleapis.com"
}
import {
  to = module.agent.google_project_service.apis["logging.googleapis.com"]
  id = "mai-agent-512512/logging.googleapis.com"
}
import {
  to = module.agent.google_project_service.apis["monitoring.googleapis.com"]
  id = "mai-agent-512512/monitoring.googleapis.com"
}

import {
  to = module.agent.google_service_account.web_invoker
  id = "projects/mai-agent-512512/serviceAccounts/mai-web-invoker@mai-agent-512512.iam.gserviceaccount.com"
}
import {
  to = module.agent.google_service_account.agent_deployer
  id = "projects/mai-agent-512512/serviceAccounts/agent-deployer@mai-agent-512512.iam.gserviceaccount.com"
}

import {
  to = module.agent.google_service_account_iam_member.web_invoker_self_token_creator
  id = "projects/mai-agent-512512/serviceAccounts/mai-web-invoker@mai-agent-512512.iam.gserviceaccount.com roles/iam.serviceAccountOpenIdTokenCreator serviceAccount:mai-web-invoker@mai-agent-512512.iam.gserviceaccount.com"
}
import {
  to = module.agent.google_service_account_iam_member.web_invoker_wif["development"]
  id = "projects/mai-agent-512512/serviceAccounts/mai-web-invoker@mai-agent-512512.iam.gserviceaccount.com roles/iam.workloadIdentityUser principal://iam.googleapis.com/projects/141195536670/locations/global/workloadIdentityPools/vercel/subject/owner:llegrens-projects:project:mai-web:environment:development"
}
import {
  to = module.agent.google_service_account_iam_member.web_invoker_wif["preview"]
  id = "projects/mai-agent-512512/serviceAccounts/mai-web-invoker@mai-agent-512512.iam.gserviceaccount.com roles/iam.workloadIdentityUser principal://iam.googleapis.com/projects/141195536670/locations/global/workloadIdentityPools/vercel/subject/owner:llegrens-projects:project:mai-web:environment:preview"
}
import {
  to = module.agent.google_service_account_iam_member.deployer_wif
  id = "projects/mai-agent-512512/serviceAccounts/agent-deployer@mai-agent-512512.iam.gserviceaccount.com roles/iam.workloadIdentityUser principalSet://iam.googleapis.com/projects/141195536670/locations/global/workloadIdentityPools/github-actions/attribute.repository/l-legren/mai"
}

import {
  to = module.agent.google_iam_workload_identity_pool.vercel
  id = "projects/mai-agent-512512/locations/global/workloadIdentityPools/vercel"
}
import {
  to = module.agent.google_iam_workload_identity_pool_provider.vercel
  id = "projects/mai-agent-512512/locations/global/workloadIdentityPools/vercel/providers/vercel"
}
import {
  to = module.agent.google_iam_workload_identity_pool.github_actions
  id = "projects/mai-agent-512512/locations/global/workloadIdentityPools/github-actions"
}
import {
  to = module.agent.google_iam_workload_identity_pool_provider.github
  id = "projects/mai-agent-512512/locations/global/workloadIdentityPools/github-actions/providers/github"
}

import {
  to = module.agent.google_artifact_registry_repository.agent
  id = "projects/mai-agent-512512/locations/europe-west3/repositories/mai-agent"
}
import {
  to = module.agent.google_artifact_registry_repository_iam_member.deployer_writer
  id = "projects/mai-agent-512512/locations/europe-west3/repositories/mai-agent roles/artifactregistry.writer serviceAccount:agent-deployer@mai-agent-512512.iam.gserviceaccount.com"
}

import {
  to = module.agent.google_secret_manager_secret.secrets["SUPABASE_URL"]
  id = "projects/mai-agent-512512/secrets/SUPABASE_URL"
}
import {
  to = module.agent.google_secret_manager_secret.secrets["SUPABASE_ANON_KEY"]
  id = "projects/mai-agent-512512/secrets/SUPABASE_ANON_KEY"
}
import {
  to = module.agent.google_secret_manager_secret.secrets["ANTHROPIC_API_KEY"]
  id = "projects/mai-agent-512512/secrets/ANTHROPIC_API_KEY"
}
import {
  to = module.agent.google_secret_manager_secret.secrets["ANTHROPIC_WORKSPACE_ID"]
  id = "projects/mai-agent-512512/secrets/ANTHROPIC_WORKSPACE_ID"
}
import {
  to = module.agent.google_secret_manager_secret.secrets["LMNR_PROJECT_API_KEY"]
  id = "projects/mai-agent-512512/secrets/LMNR_PROJECT_API_KEY"
}
import {
  to = module.agent.google_secret_manager_secret.secrets["MCP_READONLY_DATABASE_URL"]
  id = "projects/mai-agent-512512/secrets/MCP_READONLY_DATABASE_URL"
}
import {
  to = module.agent.google_secret_manager_secret.secrets["MCP_WRITE_DATABASE_URL"]
  id = "projects/mai-agent-512512/secrets/MCP_WRITE_DATABASE_URL"
}
import {
  to = module.agent.google_secret_manager_secret.secrets["LANGGRAPH_DATABASE_URL"]
  id = "projects/mai-agent-512512/secrets/LANGGRAPH_DATABASE_URL"
}

import {
  to = module.agent.google_project_iam_member.compute_sa_secret_accessor
  id = "mai-agent-512512 roles/secretmanager.secretAccessor serviceAccount:141195536670-compute@developer.gserviceaccount.com"
}

import {
  to = module.agent.google_cloud_run_service.agent
  id = "locations/europe-west3/namespaces/mai-agent-512512/services/mai-agent"
}
import {
  to = module.agent.google_cloud_run_service_iam_member.deployer_developer
  id = "v1/projects/mai-agent-512512/locations/europe-west3/services/mai-agent roles/run.developer serviceAccount:agent-deployer@mai-agent-512512.iam.gserviceaccount.com"
}
import {
  to = module.agent.google_cloud_run_service_iam_member.web_invoker_invoker
  id = "v1/projects/mai-agent-512512/locations/europe-west3/services/mai-agent roles/run.invoker serviceAccount:mai-web-invoker@mai-agent-512512.iam.gserviceaccount.com"
}
