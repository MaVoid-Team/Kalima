# Kalima CI/CD

Pushes to `staging` run validation and deploy the GitHub `staging` environment at `https://dev.kalima-edu.com`.
Pushes to `Rhiss` run validation and deploy the GitHub `production` environment.
The workflow also supports a manual recovery run when the selected ref is `staging` or `Rhiss`.
The deployment job starts only after frontend lint, translation audit, frontend build, backend build, and backend tests pass.
Production validation requires the pushed `Rhiss` tree to match the current `staging` tree and requires a successful staging workflow for that exact commit.

Create `staging` and `production` GitHub environments without approval protection rules.
Give each environment its own `COOLIFY_WEBHOOK` and `COOLIFY_TOKEN` secrets.
Give each environment `COOLIFY_API_BASE` and `HEALTHCHECK_URL` variables.
`COOLIFY_API_BASE` is the Coolify instance API root ending in `/api/v1`.
`HEALTHCHECK_URL` points to that environment's public health endpoint.
The Coolify token needs `read` and `deploy` permissions.
Disable Coolify GitHub App auto-deploy for these applications so Coolify does not race the validation job.
The workflow separately proves Coolify completion and commit identity before checking endpoint reachability.

The current production branch is `Rhiss`.
The staging Coolify application tracks `staging` and uses isolated environment variables, storage, and database resources.
