# Draft: Refactor Session

## User Request (raw)
- User invoked refactor command instructions but did not specify a target in `<user-request>`.
- User requested search/analyze mode: maximize search effort with parallel explore/librarian agents + direct Grep/AST-grep/LSP.
- User wants senior-developer advice on what they've implemented so far.

## Current Repo Context (known)
- Monorepo: Spring Boot backend (`backend/`), CRA React frontend (`frontend/`), deploy (`deploy/`).
- LSP servers (jdtls, typescript-language-server) are configured but not installed in this environment.
- Notable complexity hotspots previously observed:
  - `backend/src/main/java/com/lendy/backend/Jwt/service/JwtService.java`
  - `backend/src/main/java/com/lendy/backend/Cart/service/CartService.java`
  - `frontend/src/App.tsx` (routing/layout)

## Open Questions
- Refactor target: file path / symbol / pattern (required).
- Desired outcome: what improves (readability, architecture, bugs, performance, reuse).
- Scope: file | module | project.
- Strategy: safe | aggressive.
- Verification expectations: tests-first vs tests-after vs none (plus agent-executed QA).

## Senior Review Themes (candidate)
- API surface consistency: `/api/v1/*` vs unversioned `/user` endpoints; gateway `/api/` proxying.
- Security/auth: JWT refresh flow complexity; token storage and rotation; scheduled cleanup.
- Config/secrets hygiene: `.env` usage in backend resources; frontend `.env`; AWS/OAuth placeholders.
- Test safety net: backend has minimal tests; refactors in auth/cart are high-risk without coverage.
- Deployment assumptions: Nginx gateway strips `/api/` prefix; ensure frontend callers align.

## Scope Boundaries (not yet set)
- INCLUDE: TBD
- EXCLUDE: TBD
