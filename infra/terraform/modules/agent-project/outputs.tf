output "web_invoker_email" {
  value = google_service_account.web_invoker.email
}

output "agent_deployer_email" {
  value = google_service_account.agent_deployer.email
}

output "github_wif_provider_name" {
  value = google_iam_workload_identity_pool_provider.github.name
}

output "vercel_wif_provider_name" {
  value = google_iam_workload_identity_pool_provider.vercel.name
}

output "artifact_registry_repo" {
  value = google_artifact_registry_repository.agent.name
}

output "cloud_run_url" {
  value = google_cloud_run_service.agent.status[0].url
}
