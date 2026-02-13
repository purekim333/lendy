# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-13 14:48 KST
**Commit:** f924e970
**Branch:** develop

## OVERVIEW
Monorepo for an e-commerce stack: Spring Boot backend, React frontend, Docker gateway deployment.
Primary boundaries are `backend/`, `frontend/`, and `deploy/`.

## STRUCTURE
```text
.
├── backend/      # Spring Boot API, auth, domain logic
├── frontend/     # React SPA (storefront + admin routes)
├── deploy/       # Docker Compose + Nginx gateway
├── Jenkinsfile   # CI/CD pipeline source of truth
└── .sisyphus/    # local agent planning artifacts
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Backend entrypoint | `backend/src/main/java/com/lendy/backend/BackendApplication.java` | `@SpringBootApplication`, scheduling enabled |
| Frontend entrypoint | `frontend/src/index.tsx` | BrowserRouter bootstrap |
| Route map | `frontend/src/App.tsx` | Storefront + `/admin` route tree |
| Cart APIs | `backend/src/main/java/com/lendy/backend/Cart/controller/CartController.java` | `/api/v1/cart/*` |
| User APIs | `backend/src/main/java/com/lendy/backend/User/controller/UserController.java` | `/user` endpoints |
| JWT flow | `backend/src/main/java/com/lendy/backend/Jwt/` | filter/service/handler/repository split |
| CI pipeline | `Jenkinsfile` | test/build/docker/deploy stages |
| Runtime compose | `deploy/docker-compose.yml` | gateway + backend + frontend + mysql |

## CODE MAP
| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|
| `BackendApplication.main` | method | `backend/src/main/java/com/lendy/backend/BackendApplication.java` | N/A | boots backend |
| `App` | component | `frontend/src/App.tsx` | N/A | root route composition |
| `LayoutWithHeader` | component | `frontend/src/App.tsx` | N/A | storefront shell |
| `CartController` | class | `backend/src/main/java/com/lendy/backend/Cart/controller/CartController.java` | N/A | cart REST surface |
| `UserController` | class | `backend/src/main/java/com/lendy/backend/User/controller/UserController.java` | N/A | user REST surface |

## CONVENTIONS
- Backend uses package-level domain partitioning: `Cart`, `Product`, `User`, `Jwt`, `common`.
- Frontend keeps customer pages in `frontend/src/pages` and admin pages in `frontend/src/pages/admin`.
- Frontend TypeScript is strict (`frontend/tsconfig.json`: `strict: true`, `noEmit: true`).
- Styles flow through Tailwind + PostCSS (`frontend/tailwind.config.js`, `frontend/postcss.config.js`).

## ANTI-PATTERNS (THIS PROJECT)
- Do not assume tests are comprehensive; current backend test footprint is a single context-load test.
- Do not bypass gateway pathing assumptions; `/api/` is proxied to backend by Nginx.
- Do not treat `frontend/src/App.tsx` as a small component; it is a central routing shell.

## UNIQUE STYLES
- Gateway-first deployment model: external traffic lands on Nginx (`deploy/gateway/default.conf`).
- Admin UI is colocated with storefront in one SPA, separated by route guard/layout.
- Backend Docker build intentionally skips tests (`backend/Dockerfile`), relying on CI stage tests.

## COMMANDS
```bash
# frontend
cd frontend && npm ci && npm test -- --watchAll=false && npm run build

# backend
cd backend && ./gradlew test -x integrationTest && ./gradlew bootJar

# local compose stack
docker compose -f deploy/docker-compose.yml up -d --force-recreate
```

## NOTES
- `frontend/Dockerfile` is referenced in CI but not present in current tree.
- LSP servers for Java/TypeScript are configured but not installed in this environment.
