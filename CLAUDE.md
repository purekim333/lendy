# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lendy is a mobile-first e-commerce platform (max-width 420px). Full-stack monorepo: Spring Boot backend + React SPA frontend, deployed via Docker Compose with Nginx gateway.

## Commands

### Frontend (`frontend/`)
```bash
npm run dev          # Dev server on :5173 (proxies /api to localhost:80)
npm run build        # tsc + vite build
npm test             # vitest run
npm run test:watch   # vitest watch mode
```

### Backend (`backend/`)
```bash
./gradlew test -x integrationTest   # Unit tests (H2 in-memory, Flyway disabled)
./gradlew bootJar                   # Build JAR
```

### Docker
```bash
docker compose -f deploy/docker-compose.yml up -d --force-recreate
```

## Architecture

### Backend (Java 21, Spring Boot 3.5.3, Gradle)
Domain-driven packages under `backend/src/main/java/com/lendy/backend/`:
- **Domains**: `Cart/`, `Product/`, `User/`, `Jwt/`, `Order/`, `Payment/`, `common/`
- Each domain follows: `controller/`, `service/`, `repository/`, `entity/`, `dto/`
- **Auth flow**: Stateless JWT (access + refresh tokens in localStorage). `JwtFilter` validates tokens on every request. `LoginFilter` handles username/password auth. OAuth2 (Naver, Kakao, Google) via `SocialSuccessHandler`.
- **Role hierarchy**: `ADMIN` implies `USER` (via `RoleHierarchy` bean)
- **Config via env vars**: DB credentials, OAuth secrets, AWS S3 keys loaded from `${...}` placeholders in `application.properties`. Uses `spring.config.import=optional:classpath:.env[.properties]` for local dev.
- **Tests**: Use H2 in-memory DB with MySQL mode. Flyway disabled in test profile. Stub OAuth2 client values.

### Frontend (React 19, TypeScript, Vite 5)
- **Routing** (`App.tsx`): React Router v7. Two layouts — `LayoutWithHeader` (main pages) and `LayoutWithoutHeader`. Admin routes wrapped in `RequireAdmin` guard with separate `AdminLayout`.
- **API calls**: `fetchWithAccess()` in `src/util/fetchUtil.ts` — auto-attaches JWT Bearer token, handles 401 with silent token refresh, redirects to `/login` on refresh failure.
- **Backend URL**: Uses `process.env.REACT_APP_BACKEND_API_BASE_URL` (note: CRA-style env var naming despite Vite — check if `VITE_` prefix is needed).
- **Path alias**: `@/` maps to `src/` (configured in `vite.config.ts`).
- **Vite proxy**: `/api` requests proxy to `http://localhost:80` in dev.

### Deployment
- Docker Compose: `gateway` (Nginx) -> `frontend` + `backend` -> `mysql:8.0`
- Backend exposes :8080 internally, frontend :80, gateway :80 externally
- MySQL uses utf8mb4 charset

## Key Conventions
- Backend uses Lombok (compileOnly + annotationProcessor)
- Flyway migrations in `backend/src/main/resources/db/migration/` (versioned: V1, V2, V4, V5 — note gap at V3)
- Tailwind CSS with custom theme: `max-w-app` (420px), `bg-sky-bg` (#ecf3ff), `shadow-app`, `rounded-app`
- Frontend uses `lucide-react` for icons
- Package-lock.json is tracked (use `npm install`, not `npm ci` for dev)
- Korean-language code comments throughout
