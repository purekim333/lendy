# Gateway 라우팅 가이드

프론트엔드와 백엔드 사이의 통신 구조를 환경별로 정리한 문서입니다.

---

## 1. 전체 아키텍처

### Docker 배포 환경

```
브라우저 (:80)
    │
    ▼
┌──────────────────────────────────────┐
│         Gateway (Nginx :80)          │
│                                      │
│  /                → frontend:80      │
│  /api/            → backend:8080     │
│  /user            → backend:8080     │
│  /jwt/            → backend:8080     │
│  /oauth2/         → backend:8080     │
│  /login/oauth2/   → backend:8080     │
└──────┬───────────────────┬───────────┘
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│  Frontend   │    │  Backend    │
│  Nginx :80  │    │  Spring     │
│  (정적 SPA) │    │  Boot :8080 │
└─────────────┘    └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │  MySQL :3306│
                   └─────────────┘
```

### 로컬 개발 환경

```
브라우저 (:5173)
    │
    ▼
┌──────────────────────────────────────┐
│       Vite Dev Server (:5173)        │
│                                      │
│  /                → React HMR       │
│  /api/            → localhost:8080   │
│  /user            → localhost:8080   │
│  /jwt/            → localhost:8080   │
│  /oauth2/         → localhost:8080   │
│  /login/oauth2/   → localhost:8080   │
└──────────────────────────────────────┘
                   │
                   ▼
           ┌─────────────┐
           │  Backend    │
           │  Spring     │
           │  Boot :8080 │
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │  MySQL :3306│
           │  (localhost) │
           └─────────────┘
```

---

## 2. 라우팅 규칙 상세

### Gateway (Docker) — `deploy/gateway/default.conf`

| 경로 패턴 | 프록시 대상 | 용도 |
|-----------|------------|------|
| `/` | `frontend:80` | React SPA 정적 파일 (기본 fallback) |
| `/api/` | `backend:8080` | REST API (상품, 장바구니, 주문, 결제 등) |
| `/user` | `backend:8080` | 유저 CRUD 엔드포인트 |
| `/jwt/` | `backend:8080` | JWT 발급/갱신 (`/jwt/exchange`, `/jwt/refresh`) |
| `/oauth2/authorization/` | `backend:8080` | 소셜 로그인 시작 (Spring Security → OAuth 프로바이더 리다이렉트) |
| `/login/oauth2/code/` | `backend:8080` | OAuth2 콜백 (프로바이더 → Spring Security) |

### Vite Proxy (로컬) — `frontend/vite.config.ts`

| 경로 패턴 | 프록시 대상 | 비고 |
|-----------|------------|------|
| `/api` | `localhost:8080` | REST API |
| `/user` | `localhost:8080` | 유저 엔드포인트 |
| `/jwt` | `localhost:8080` | JWT 엔드포인트 |
| `/oauth2` | `localhost:8080` | 소셜 로그인 시작 |
| `/login/oauth2` | `localhost:8080` | OAuth2 콜백 |

---

## 3. 백엔드 엔드포인트 매핑

### `/api/*` 계열 (REST API)

| 엔드포인트 | 컨트롤러 | 인증 |
|-----------|---------|------|
| `GET /api/v1/products` | ProductController | 불필요 |
| `GET /api/v1/products/{id}` | ProductController | 불필요 |
| `GET /api/v1/cart/items` | CartController | 필요 (JWT) |
| `POST /api/v1/cart/items/{id}` | CartController | 필요 (JWT) |
| `DELETE /api/v1/cart/items/{id}` | CartController | 필요 (JWT) |
| `POST /api/v1/orders/checkout` | OrderController | 불필요 |
| `GET /api/v1/orders/guest/{code}` | OrderController | 불필요 |
| `POST /api/v1/payments/verify` | PaymentController | 불필요 |
| `POST /api/v1/payments/webhook/portone` | PaymentController | 불필요 |
| `GET /api/v1/health` | HealthController | 불필요 |

### `/api/*` 계열 (관리자)

| 엔드포인트 | 컨트롤러 | 인증 |
|-----------|---------|------|
| `GET /api/v1/admin/orders` | AdminOrderController | 필요 (ADMIN) |
| `GET /api/v1/admin/orders/{code}` | AdminOrderController | 필요 (ADMIN) |
| `POST /api/v1/admin/orders/{code}/ready` | AdminOrderController | 필요 (ADMIN) |
| `POST /api/v1/admin/orders/{code}/ship` | AdminOrderController | 필요 (ADMIN) |
| `POST /api/v1/admin/orders/{code}/deliver` | AdminOrderController | 필요 (ADMIN) |
| `POST /api/v1/admin/orders/{code}/cancel` | AdminOrderController | 필요 (ADMIN) |
| `POST /api/v1/admin/products/create` | ProductAdminController | 필요 (ADMIN) |

### 인증 관련 (비 `/api` 경로)

| 엔드포인트 | 컨트롤러 | 용도 |
|-----------|---------|------|
| `POST /jwt/exchange` | JwtController | 소셜 로그인 후 쿠키 → JWT 교환 |
| `POST /jwt/refresh` | JwtController | AccessToken 갱신 |
| `POST /user` | UserController | 회원가입 |
| `GET /user` | UserController | 내 정보 조회 |
| `PUT /user` | UserController | 내 정보 수정 |
| `DELETE /user` | UserController | 회원탈퇴 |
| `POST /user/exist` | UserController | 유저 존재 확인 |

---

## 4. OAuth2 소셜 로그인 흐름

```
1. 브라우저                          2. Gateway                     3. Backend (Spring Security)
   │                                   │                               │
   │  GET /oauth2/authorization/kakao  │                               │
   │ ─────────────────────────────────>│  proxy_pass backend:8080      │
   │                                   │ ─────────────────────────────>│
   │                                   │                               │
   │  302 → https://kauth.kakao.com   │                               │
   │ <─────────────────────────────────│<──────────────────────────────│
   │                                   │                               │
   │  (카카오 로그인 화면)              │                               │
   │  (유저가 로그인 완료)              │                               │
   │                                   │                               │
4. 카카오 서버                                                         │
   │  GET /login/oauth2/code/kakao?code=...                           │
   │ ─────────────────────────────────>│  proxy_pass backend:8080      │
   │                                   │ ─────────────────────────────>│
   │                                   │                               │
   │                                   │  SocialSuccessHandler 실행    │
   │                                   │  - JWT Refresh 발급            │
   │                                   │  - refreshToken 쿠키 설정      │
   │                                   │  - 302 → /cookie 리다이렉트    │
   │                                   │                               │
5. 브라우저 (/cookie 페이지)                                           │
   │  POST /jwt/exchange (쿠키 포함)   │                               │
   │ ─────────────────────────────────>│  proxy_pass backend:8080      │
   │                                   │ ─────────────────────────────>│
   │                                   │                               │
   │  { accessToken, refreshToken }    │                               │
   │ <─────────────────────────────────│<──────────────────────────────│
   │                                   │                               │
   │  localStorage에 토큰 저장         │                               │
   │  /products 페이지로 이동          │                               │
```

---

## 5. 환경변수

| 변수 | 로컬 개발 (`backend/.env`) | Docker 배포 (`deploy/.env`) | 용도 |
|------|---------------------------|----------------------------|------|
| `OAUTH_REDIRECT_BASE` | `http://localhost:8080` | `http://localhost` | OAuth2 redirect-uri 및 소셜 로그인 후 리다이렉트 베이스 |

- 로컬: 브라우저가 백엔드(`:8080`)에 직접 접근
- Docker: 브라우저가 Gateway(`:80`)를 통해 접근

---

## 6. 프론트엔드 API 호출 규칙

프론트엔드에서 백엔드를 호출할 때는 **항상 상대경로**를 사용합니다.

```typescript
// O 올바른 예시
fetch("/api/v1/products");
fetch("/jwt/exchange", { method: "POST", credentials: "include" });
fetch("/user", { headers: { Authorization: `Bearer ${token}` } });
window.location.href = "/oauth2/authorization/kakao";

// X 잘못된 예시 (환경별로 깨짐)
fetch("http://localhost:8080/api/v1/products");
fetch(`${BACKEND_URL}/jwt/exchange`);
```

상대경로를 사용하면 로컬에서는 Vite 프록시가, Docker에서는 Gateway가 자동으로 백엔드로 라우팅합니다.

---

## 7. 새 백엔드 경로 추가 시 체크리스트

백엔드에 `/api/` 프리픽스가 아닌 새 경로를 추가할 경우:

1. `deploy/gateway/default.conf`에 `location` 블록 추가
2. `frontend/vite.config.ts`의 `proxy`에 경로 추가
3. 프론트엔드에서 상대경로로 호출
4. 이 문서 업데이트
