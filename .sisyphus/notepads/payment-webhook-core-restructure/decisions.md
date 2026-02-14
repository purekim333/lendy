# Decisions


## 2026-02-14
- Set `location /api/` to `proxy_pass http://be;` (no trailing slash) so Nginx forwards the original URI (`/api/v1/...`) without stripping `/api`.
- Flyway is enabled in default profile with migrations under `classpath:db/migration`; default profile keeps `spring.jpa.hibernate.ddl-auto=update` for current developer workflow and adds `spring.flyway.baseline-on-migrate=true` to handle pre-existing local schemas.
- Production profile now uses `spring.jpa.hibernate.ddl-auto=validate` in `application-prod.properties` so Hibernate does not mutate schema in prod; schema changes are expected through Flyway migrations.

## 2026-02-14T01:15:09+09:00
- Migrated frontend from CRA to Vite for faster builds and modern tooling.
- Switched test runner from Jest to Vitest for Vite compatibility.
- Environment variable prefix changed from REACT_APP_ to VITE_.

## 2026-02-14T01:33:06+09:00
- Implemented Order domain with guest checkout support.
- Server computes all amounts; no frontend price trust.
- Guest access uses orderCode + orderAccessKey (hashed in DB).

## 2026-02-14T14:07:18+09:00
- Payments domain with idempotent finalize using @Version optimistic locking.
- Webhook endpoint is public but should verify signature (TODO).
- Both webhook and verify API converge to same finalizePayment() method.

## 2026-02-14T14:12:58+09:00
- Guest order lookup requires orderCode + accessKey (SHA-256 hashed).
- Invalid access key returns 401-equivalent error (IllegalArgumentException).

## 2026-02-14T14:16:51+09:00
- Admin endpoints require ADMIN role (no longer permitAll).
- Status transitions are validated (cannot skip steps).
- Cancel blocked after SHIPPING status.
