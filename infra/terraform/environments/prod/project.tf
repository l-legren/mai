resource "google_project" "prod" {
  name            = "mai-agent-prod"
  project_id      = "mai-agent-prod"
  org_id          = "409882711248"
  billing_account = "0129FA-DF3BBA-D41854"

  lifecycle {
    prevent_destroy = true
  }
}
