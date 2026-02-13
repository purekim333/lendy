# DEPLOY KNOWLEDGE BASE

## OVERVIEW
Deployment surface for local/prod-like composition: Nginx gateway, backend API, frontend app, and MySQL.

## STRUCTURE
```text
deploy/
├── docker-compose.yml
└── gateway/
    ├── Dockerfile
    └── default.conf
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Service topology | `docker-compose.yml` | gateway/backend/frontend/mysql wiring |
| Gateway image | `gateway/Dockerfile` | nginx image wrapper |
| Reverse proxy rules | `gateway/default.conf` | `/` -> frontend, `/api/` -> backend |

## CONVENTIONS
- Compose service names (`gateway`, `backend`, `frontend`, `mysql`) are used as internal DNS targets.
- External ingress is only port `80` from gateway; backend/frontend are exposed internally.
- Backend boot depends on mysql healthcheck in compose.

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not route API traffic directly to backend from clients; gateway proxy is canonical path.
- Do not remove `/api/` prefix handling in `default.conf` without coordinating frontend API callers.
- Do not hardcode secrets in compose; use environment substitution.

## UNIQUE STYLES
- Gateway-first architecture with Nginx upstream blocks `fe` and `be`.
- Compose deploy stage is run from Jenkins using `docker/compose` container.

## COMMANDS
```bash
docker compose -f deploy/docker-compose.yml up -d --force-recreate
docker compose -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml logs gateway
```

## NOTES
- Gateway strips `/api/` prefix before forwarding to backend (`proxy_pass http://be/`).
