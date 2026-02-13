# Gateway API Routing

The gateway preserves canonical backend API paths under `/api/v1/...`.

## Nginx rule

- `location /api/` with `proxy_pass http://be;` forwards the full request URI to backend.
- This keeps `/api/v1/...` unchanged instead of stripping the `/api/` prefix.

## Health endpoint

- Backend exposes `GET /api/v1/health`.
- Expected response body:

```json
{"status":"ok"}
```

- Endpoint is explicitly public in Spring Security for health checks.
