# Issues


## 2026-02-14
- `./gradlew test -x integrationTest` fails because task `integrationTest` does not exist in this project; fallback `./gradlew test` succeeded.
- `docker compose -f deploy/docker-compose.yml up -d --force-recreate` failed: Docker daemon unavailable (`//./pipe/dockerDesktopLinuxEngine` not found), so gateway-level curl verification could not run.
- `lsp_diagnostics` for Java could not execute because `jdtls` is configured but not installed in this environment.
- First Flyway enablement run failed with `Unsupported Database: MySQL 8.4`; resolved by adding `org.flywaydb:flyway-mysql` dependency.
- Next test run failed with `Found non-empty schema(s) but no schema history table`; resolved by setting `spring.flyway.baseline-on-migrate=true` for default profile.
- `lsp_diagnostics` is unavailable for edited file types here (`.gradle`, `.properties`, `.sql`) because no LSP server is configured for those extensions.
