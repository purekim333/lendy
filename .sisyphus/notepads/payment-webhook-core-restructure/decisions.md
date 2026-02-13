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
