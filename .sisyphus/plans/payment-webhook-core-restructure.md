# Payment Webhook Finalization + Core Commerce (Full Restructure)

## TL;DR

> **Quick Summary**: Restructure the monorepo end-to-end (backend/frontend/deploy/docs) while completing a domestic (KR) physical-goods commerce core: guest checkout, shipping address capture, PortOne(Iamport)+KG Inicis payment initiation, and **webhook-as-source-of-truth** payment finalization with idempotency + event log.
>
> **Deliverables**:
> - Backend: `Order`/`Payment` domains + PortOne verification + webhook receiver + guest order lookup + admin fulfillment APIs
> - Frontend: CRA -> Vite migration + checkout/payment flow + guest order lookup UI + admin orders UI wired to backend
> - Deploy/CI: gateway routing normalized, frontend Dockerfile restored, Jenkins scripts updated, Flyway adopted
> - Docs: canonical `docs/` with payment/webhook flow, fee guidance, env vars, gateway routing, runbook
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Gateway/API normalization -> Vite migration -> Flyway baseline -> Order/Payment domains -> Webhook finalization -> Frontend checkout

---

## Context

### Original Request
- Keep the previous conclusion: webhook-based payment finalization + continue docs cleanup.
- Plan as a complete payment-capable shopping mall (not an MVP). Project may be incomplete.
- You allow full restructure (large-scale renames).

### Confirmed Decisions
- Market: Domestic-focused
- Provider layer: PortOne(Iamport)
- Downstream PG (current FE): KG Inicis (`pg: "html5_inicis"`)
- Goods: physical shipping
- Checkout: guest checkout required
- Frontend toolchain: migrate CRA -> Vite
- DB migrations: introduce Flyway (avoid relying on `ddl-auto=update` in production)
- Tests: YES (tests-after)

### Verified Repo Facts (references)
- FE PortOne initiation: `frontend/src/services/PaymentService.ts`
- FE verify stub call: `frontend/src/pages/PaymentPage.tsx`
- Admin order UI mock/status vocabulary: `frontend/src/pages/admin/orders/AdminOrders.tsx`
- Gateway routing: `deploy/gateway/default.conf`
- Compose topology: `deploy/docker-compose.yml`
- Backend security patterns: `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java`
- Backend error handling patterns: `backend/src/main/java/com/lendy/backend/common/config/CustomControllerAdvice.java`
- CI pipeline: `Jenkinsfile`

### Metis Review (gaps addressed)
- Lock down scope to a core launch set (no multi-PG abstraction beyond PortOne).
- Make finalization idempotent with DB uniqueness + event log + server-to-server payment query.
- Decide order creation moment: server creates `Order` + `PaymentAttempt` BEFORE `IMP.request_pay` (amount immutability).
- Define guest order access model (avoid order enumeration).
- Include baseline cancellation/refund policy (no partial refund for launch).

---

## Work Objectives

### Core Objective
Deliver a production-grade payment confirmation system (webhook as source of truth) and a core commerce workflow (guest checkout + shipping) while performing a full repo restructure (including CRA->Vite and Flyway adoption), with CI-verifiable outcomes.

### Concrete Deliverables
- Backend
  - New domains: `orders` + `payments` (entities, repositories, services, controllers)
  - PortOne REST verification integration (server-to-server query)
  - Payment finalization pipeline: webhook + verify -> event log -> idempotent finalize
  - Guest order lookup (orderCode + accessKey)
  - Admin order fulfillment APIs (status transitions, carrier/invoice)
  - Health endpoint for gateway verification
- Frontend
  - Vite migration
  - Checkout UI (cart snapshot -> shipping form -> backend checkout -> IMP.request_pay)
  - Payment processing UI (pending/confirmed)
  - Guest order lookup UI
  - Admin orders UI wired to backend
- Deploy/CI
  - Gateway `/api` routing normalized with backend pathing
  - `frontend/Dockerfile` restored and aligned with Vite build output
  - Jenkins pipeline updated to fail on tests (remove `|| true` once stabilized)
- Docs
  - `docs/` index, payment/webhook flow docs, fee guidance, env vars, gateway routing, local runbook

### Definition of Done
- `docker compose -f deploy/docker-compose.yml up -d --force-recreate` brings up gateway/backend/frontend/mysql
- `curl -s http://localhost/api/v1/health` returns `{"status":"ok"}` (or equivalent)
- Checkout + payment flow reaches PAID via webhook/finalize, confirmed by API
- `cd backend && ./gradlew test` passes
- `cd frontend && npm ci && npm test -- --watchAll=false && npm run build` passes (Vite-based)
- Jenkins stages run green with updated frontend build

### Must NOT Have (guardrails)
- No “paid” decisions in frontend; frontend callback is only a trigger
- No reliance on webhook payload alone; finalization must verify via PortOne server-to-server query
- No multi-PG / multi-provider abstraction for launch (PortOne only)
- No raw PII/secrets in logs or committed files (remove hard-coded buyer info)
- Dev-only helper endpoints (if any) must not be enabled in production profiles

---

## Verification Strategy (MANDATORY)

> UNIVERSAL RULE: zero human intervention.
> All verification is agent-executed (commands, curl, Playwright).

### Test Decision
- Infrastructure exists: YES
  - Backend: JUnit 5 (`backend/build.gradle`)
  - Frontend: Jest + Testing Library (`frontend/package.json`) -> migrate to Vite but keep Jest or move to Vitest (decide during Vite task)
- Automated tests: YES (tests-after)

### Agent-Executed QA Scenarios (mandatory for all tasks)
- Backend/API: Bash (`curl`) + DB inspection via API endpoints
- Frontend/UI: Playwright
- CI/build: Bash (npm/gradle/docker compose)

Evidence location (all tasks)
- `.sisyphus/evidence/task-<N>-<slug>.<ext>`

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (foundation / low coupling)
- Task 1: Documentation structure + runbook baseline
- Task 2: Gateway/API prefix normalization + health endpoint
- Task 2a: Backend API surface normalization + security guardrails (align /api/v1)
- Task 3: Frontend CRA -> Vite migration scaffold

Wave 2 (schema + core domains)
- Task 4: Flyway adoption + baseline migrations
- Task 4a: Product catalog API + seed data (unblock checkout)
- Task 4b: Frontend catalog/cart uses backend + stores productOptionId
- Task 5: Orders domain (guest checkout, shipping address, totals)
- Task 6: Payments domain (PaymentAttempt + EventLog + PortOne client)

Wave 3 (integration + UI wiring)
- Task 7: Webhook + verify endpoints + idempotent finalize + reconciliation
- Task 7a: Basic cancellation/refund policy (no partial refund)
- Task 8: Frontend checkout/payment flow (IMP + backend checkout/verify)
- Task 9: Guest order lookup UI + API
- Task 10: Admin orders API + UI wiring
- Task 11: CI/Docker fixes (frontend Dockerfile, Jenkins updates)

Critical Path: 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

---

### 2a) Normalize backend API surface + security policy (align with gateway)

**What to do**:
- Standardize all public API endpoints under `/api/v1/*`.
  - Migrate unversioned `/user` endpoints (see `backend/src/main/java/com/lendy/backend/User/controller/UserController.java`) to `/api/v1/users/*`.
  - Keep temporary compatibility only if explicitly needed; otherwise update FE to match new paths.
- Define public vs protected surfaces:
  - Public (no auth): health, guest checkout, PortOne webhook receiver, guest order lookup (but guarded by accessKey)
  - Protected (auth): user self endpoints, admin endpoints
- Tighten admin policy:
  - Do NOT keep `permitAll()` for `/api/v1/admin/**` for launch.
- Add a tiny admin-only probe endpoint `GET /api/v1/admin/health` to make security verifiable early.
- Add a dev-only admin token mint endpoint so agent QA can exercise admin endpoints without manual OAuth:
  - `POST /api/v1/dev/auth/admin-token` (ONLY active when `SPRING_PROFILES_ACTIVE=dev`)
  - Requires header `X-Dev-Admin-Secret` matching an env var (e.g., `DEV_ADMIN_SECRET`)
  - Returns a short-lived JWT (plain text body) containing `ROLE_ADMIN`
- Update CORS origins after Vite migration (5173 is already allowed in `SecurityConfig`).

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- Current user endpoints: `backend/src/main/java/com/lendy/backend/User/controller/UserController.java` (unversioned `/user`)
- Current security policy: `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java` (currently permits `/api/v1/admin/**`)
- Existing versioned controller example: `backend/src/main/java/com/lendy/backend/Cart/controller/CartController.java`
- Gateway: `deploy/gateway/default.conf`

**Acceptance Criteria**:
- `curl -s http://localhost/api/v1/health` succeeds without auth
- `curl -s -X POST http://localhost/api/v1/users/exist ...` succeeds (public)
- `curl -s http://localhost/api/v1/admin/health` is forbidden without admin auth (401/403)

**Agent-Executed QA Scenarios**:
Scenario: Admin endpoints are not public
  Tool: Bash (curl)
  Steps:
    1. `curl -s -o .sisyphus/evidence/task-2a-admin-guard.json -w "%{http_code}" http://localhost/api/v1/admin/health`
    2. Assert status is 401/403
  Expected Result: admin surface not publicly accessible
  Evidence: `.sisyphus/evidence/task-2a-admin-guard.json`

---

### 2b) Backend package + directory normalization (full restructure)

**What to do**:
- Normalize Java package naming to conventional lower-case domain packages.
  - Example target: `com.lendy.backend.cart`, `com.lendy.backend.user`, `com.lendy.backend.product`, `com.lendy.backend.jwt`, `com.lendy.backend.common`, `com.lendy.backend.orders`, `com.lendy.backend.payments`.
- Normalize directory casing to match new packages.
- Keep layering consistent inside each domain: `controller/`, `service/`, `repository/`, `entity/`, `dto/`.
- Ensure imports and component scanning still work (Spring Boot).

**Why this matters**:
- This repo is built into Linux containers (`backend/Dockerfile`), so inconsistent casing and scattered packages increase breakage risk during full restructure.

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- Current mixed-case domains: `backend/src/main/java/com/lendy/backend/Cart/`, `backend/src/main/java/com/lendy/backend/User/`, `backend/src/main/java/com/lendy/backend/Product/`, `backend/src/main/java/com/lendy/backend/Jwt/`
- Backend entrypoint: `backend/src/main/java/com/lendy/backend/BackendApplication.java`

**Acceptance Criteria**:
- `cd backend && ./gradlew test` passes after renames
- `docker build -t lendy-backend:latest -f backend/Dockerfile .` succeeds (Linux build validation)

**Agent-Executed QA Scenarios**:
Scenario: Backend still builds and tests after package normalization
  Tool: Bash
  Steps:
    1. Run `cd backend && ./gradlew test`
    2. Run `docker build -t lendy-backend:latest -f backend/Dockerfile .`
    3. Capture outputs to evidence files
  Expected Result: both commands exit 0
  Evidence: `.sisyphus/evidence/task-2b-backend-test.txt`, `.sisyphus/evidence/task-2b-backend-docker-build.txt`

---

## TODOs

### 1) Establish canonical docs layout (fees + runbook)

**What to do**:
- Create `docs/` as canonical documentation home
- Add docs index and link from root `README.md`
- Move/translate key knowledge from `backend/AGENTS.md`, `frontend/AGENTS.md`, `deploy/AGENTS.md` into structured docs pages (keep AGENTS as quick pointers)
- Add a payment section including fee guidance and operational notes

**Recommended Agent Profile**:
- Category: writing
- Skills: (none)

**References**:
- `README.md` - currently minimal; needs linking
- `backend/AGENTS.md` - backend structure + commands
- `frontend/AGENTS.md` - frontend structure + commands
- `deploy/AGENTS.md` - gateway + compose conventions

**Acceptance Criteria**:
- `docs/index.md` exists and links to payment + deploy pages
- Root `README.md` links to `docs/index.md`

**Agent-Executed QA Scenarios**:
Scenario: Docs navigation sanity
  Tool: Bash
  Steps:
    1. Verify `docs/index.md` exists
    2. Verify links point to existing files (path checks)
  Expected Result: No broken links in docs index
  Evidence: `.sisyphus/evidence/task-1-docs-index.txt`

---

### 2) Normalize gateway/API prefixing (stop stripping /api) + add backend health endpoint

**What to do**:
- Decide canonical API convention: client calls `/api/v1/...`, backend maps `/api/v1/...`.
- Update `deploy/gateway/default.conf` to forward `/api/` WITHOUT stripping the `/api` prefix.
- Add backend health endpoint at `/api/v1/health` (unauth) for gateway verification.
- Document gateway routing behavior in `docs/deploy/gateway.md`.

**Must NOT do**:
- Do not leave mixed behavior where some endpoints are `/user` and some `/api/v1/...` without a clear compatibility strategy.

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- `deploy/gateway/default.conf` - currently strips `/api/` via `proxy_pass http://be/`
- `deploy/docker-compose.yml` - service names `backend`, `frontend`, `gateway`
- `backend/src/main/java/com/lendy/backend/Cart/controller/CartController.java` - already uses `/api/v1/...`
- `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java` - uses `/api/v1/admin/**` matchers

**Acceptance Criteria**:
- `docker compose -f deploy/docker-compose.yml up -d --force-recreate`
- `curl -s http://localhost/api/v1/health` returns JSON with `status=ok`
- Evidence saved: `.sisyphus/evidence/task-2-health.json`

**Agent-Executed QA Scenarios**:
Scenario: Gateway routes /api to backend
  Tool: Bash (curl)
  Steps:
    1. Start stack via docker compose
    2. `curl -s http://localhost/api/v1/health > .sisyphus/evidence/task-2-health.json`
    3. Assert response contains `"status"`
  Expected Result: 200 OK with health JSON
  Evidence: `.sisyphus/evidence/task-2-health.json`

---

### 3) Frontend migration CRA -> Vite (preserve routing + Tailwind)

**What to do**:
- Migrate build toolchain from `react-scripts` to Vite
- Preserve routing topology in `frontend/src/App.tsx` (route map stays centralized)
- Update env var usage:
  - From `process.env.REACT_APP_*` (see `frontend/src/pages/Login.tsx`) to `import.meta.env.VITE_*`
- Keep Tailwind integration working
- Decide test runner post-migration:
  - Option A: keep Jest (more work)
  - Option B: move to Vitest + Testing Library (recommended for Vite)

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- `frontend/package.json` - current CRA scripts
- `frontend/src/App.tsx` - route map
- `frontend/src/pages/Login.tsx` - uses `process.env.REACT_APP_BACKEND_API_BASE_URL`
- `frontend/src/setupTests.ts` - current test setup
- `frontend/tailwind.config.js`, `frontend/postcss.config.js` - Tailwind pipeline

**Acceptance Criteria**:
- `cd frontend && npm ci && npm run build` succeeds (Vite build)
- `cd frontend && npm test -- --watchAll=false` succeeds (Jest or Vitest, but must be deterministic)

**Agent-Executed QA Scenarios**:
Scenario: Vite dev server boots and renders homepage
  Tool: Playwright
  Preconditions: `cd frontend && npm run dev` runs on localhost (default 5173)
  Steps:
    1. Navigate to `http://localhost:5173/`
    2. Wait for main page content (e.g., button text `Shop More`)
    3. Screenshot `.sisyphus/evidence/task-3-vite-home.png`
  Expected Result: App loads without blank screen
  Evidence: `.sisyphus/evidence/task-3-vite-home.png`

---

### 4) Introduce Flyway and baseline schema migrations (core + new domains)

**What to do**:
- Add Flyway dependency/config to backend
- Define profiles:
  - dev: allow iterative dev (optionally `ddl-auto=validate` once migrations cover schema)
  - prod: disable implicit DDL changes
- Create initial migrations for:
  - existing needed tables (User/Product/Cart/etc.) OR explicitly declare a fresh-db assumption
  - new Order/Payment tables with required constraints/indexes

**Defaults Applied**:
- Assume fresh DB for launch environment; existing data migration is out-of-scope unless user says otherwise.

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- `backend/src/main/resources/application.properties` - currently `ddl-auto=update`
- `backend/build.gradle` - dependency management
- Existing entities:
  - `backend/src/main/java/com/lendy/backend/User/entity/UserEntity.java`
  - `backend/src/main/java/com/lendy/backend/Product/entity/Product.java`
  - `backend/src/main/java/com/lendy/backend/Cart/Entity/Cart.java`

**Acceptance Criteria**:
- `cd backend && ./gradlew test` passes
- Backend boots with Flyway applied and no schema drift errors

**Agent-Executed QA Scenarios**:
Scenario: Backend boots with Flyway migrations
  Tool: Bash
  Steps:
    1. Start DB (compose or local)
    2. Run backend and capture startup logs
    3. Assert logs show Flyway migrations applied
  Expected Result: app starts without Hibernate auto-DDL in prod profile
  Evidence: `.sisyphus/evidence/task-4-flyway-startup.txt`

---

### 4a) Complete Product domain for launch (catalog API + dev seed)

**What to do**:
- Backend:
  - Implement customer-facing catalog endpoints:
    - `GET /api/v1/products` (list with pagination/sort)
    - `GET /api/v1/products/{productId}` (detail including options/images)
  - Implement minimal admin endpoints (or seed-only if explicitly chosen):
    - `POST /api/v1/admin/products` (matches AdminProductCreate intent)
  - Ensure `ProductOption` and `ProductImage` relationships are queryable.
- DB:
  - Add Flyway seed data migrations for dev/test (at least 1 product + 1 option) so checkout QA can run without manual DB edits.
  - Prefer deterministic seed IDs (explicit PK insert) for agent-executable QA (e.g., productId=1001, productOptionId=2001).

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- Current stub: `backend/src/main/java/com/lendy/backend/Product/controller/ProductController.java`
- Existing entities:
  - `backend/src/main/java/com/lendy/backend/Product/entity/Product.java`
  - `backend/src/main/java/com/lendy/backend/Product/entity/ProductOption.java`
  - `backend/src/main/java/com/lendy/backend/Product/entity/ProductImage.java`
- Repository pattern: `backend/src/main/java/com/lendy/backend/Product/repository/ProductRepository.java`

**Acceptance Criteria**:
- `curl -s http://localhost/api/v1/products` returns JSON list (non-empty with seed)
- `curl -s http://localhost/api/v1/products/1001` returns product with options (if using deterministic seed IDs)

**Agent-Executed QA Scenarios**:
Scenario: Catalog API returns seeded product
  Tool: Bash (curl)
  Steps:
    1. `curl -s http://localhost/api/v1/products > .sisyphus/evidence/task-4a-products.json`
    2. Assert response is JSON array/object and contains at least 1 product
  Expected Result: catalog API is usable by frontend
  Evidence: `.sisyphus/evidence/task-4a-products.json`

---

### 4b) Wire frontend catalog + cart to backend (store productOptionId)

**What to do**:
- Replace `SAMPLE_PRODUCTS` usage in:
  - `frontend/src/pages/ProductsPage.tsx`
  - `frontend/src/pages/ProductDetailPage.tsx`
  with backend API calls to `GET /api/v1/products` and `GET /api/v1/products/{id}`.
- Update cart storage model (`frontend/src/utils/cartStorage.ts`) to persist `productOptionId` (not just display fields), so backend checkout can compute totals.
- Ensure cart UI (`frontend/src/pages/CartPage.tsx`) still works with the updated cart item model.

**Recommended Agent Profile**:
- Category: visual-engineering
- Skills: playwright

**References**:
- Current sample-data catalog: `frontend/src/pages/ProductsPage.tsx` uses `frontend/src/data/Products`
- Current sample-data detail: `frontend/src/pages/ProductDetailPage.tsx`
- Current local cart: `frontend/src/pages/CartPage.tsx`, `frontend/src/utils/cartStorage.ts`
- Backend catalog endpoints to implement in Task 4a

**Acceptance Criteria**:
- `ProductsPage` loads products from backend (no SAMPLE_PRODUCTS dependency for runtime)
- Add-to-cart stores `productOptionId` and checkout can use it

**Agent-Executed QA Scenarios**:
Scenario: Add product option to cart and see it in cart
  Tool: Playwright
  Preconditions: backend+frontend running
  Steps:
    1. Navigate to `http://localhost:5173/products`
    2. Click first product card
    3. Select a size/color option (mapped to a backend option)
    4. Click `장바구니`
    5. Navigate to `http://localhost:5173/cart`
    6. Assert cart contains at least 1 item
    7. Screenshot `.sisyphus/evidence/task-4b-cart.png`
  Expected Result: cart is backed by backend product IDs/options
  Evidence: `.sisyphus/evidence/task-4b-cart.png`

---

### 5) Implement Orders domain (guest checkout + shipping address)

**What to do**:
- Create `Order` + `OrderItem` entities:
  - includes guest buyer fields and shipping address fields
  - stores immutable pricing snapshot (unit price, total amount, shipping fee)
- Define `OrderStatus` aligned to UI: `PAYMENT_PENDING`, `PAID`, `READY`, `SHIPPING`, `DELIVERED`, `CANCELLED`
- Implement checkout endpoint (unauth allowed for guests):
  - Accept cart items (productOptionId + qty)
  - Server computes totals from DB (no FE amount trust)
  - Creates `Order` + initial `PaymentAttempt` (merchant_uid) and returns checkout response
- Guest access model:
  - Return `orderCode` + `orderAccessKey` once
  - Store hash of accessKey; require both for guest lookup

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- Backend controller pattern: `backend/src/main/java/com/lendy/backend/Cart/controller/CartController.java`
- Backend service pattern: `backend/src/main/java/com/lendy/backend/Cart/service/CartService.java`
- Backend error handler: `backend/src/main/java/com/lendy/backend/common/config/CustomControllerAdvice.java`
- Frontend cart is local: `frontend/src/pages/CartPage.tsx` (selected items, free shipping threshold)

**Acceptance Criteria**:
- `POST /api/v1/orders/checkout` creates an order and returns `orderCode`, `orderAccessKey`, `merchantUid`, and computed totals
- Amount equals server-computed sum; mismatch attempts are rejected

**Agent-Executed QA Scenarios**:
Scenario: Guest checkout creates PAYMENT_PENDING order
  Tool: Bash (curl)
  Preconditions: backend running on localhost (through gateway or direct)
  Steps:
    1. `curl -s -X POST http://localhost/api/v1/orders/checkout -H "Content-Type: application/json" -d '{"items":[{"productOptionId":2001,"qty":1}],"shipping":{"receiverName":"Test","phone":"01012341234","address1":"Seoul","address2":"","zip":"00000"}}' > .sisyphus/evidence/task-5-checkout.json`
    2. Parse + assert required fields (python):
       `python -c "import json; d=json.load(open('.sisyphus/evidence/task-5-checkout.json','r',encoding='utf-8')); assert d.get('orderCode'); assert d.get('orderAccessKey'); assert d.get('merchantUid'); print(d['orderCode'], d['merchantUid'])" > .sisyphus/evidence/task-5-checkout-assert.txt`
  Expected Result: Order created in PAYMENT_PENDING
  Evidence: `.sisyphus/evidence/task-5-checkout.json`, `.sisyphus/evidence/task-5-checkout-assert.txt`

---

### 6) Implement Payments domain (PaymentAttempt + EventLog + PortOne client)

**What to do**:
- Create `PaymentAttempt` entity keyed by `merchantUid` (unique) and `impUid` (unique nullable)
- Create `PaymentEventLog` entity storing minimal (redacted) raw payload + processing result
- Create PortOne client:
  - token acquisition
  - payment lookup by `imp_uid`
  - strict verification: merchant_uid match + amount match + status must be PAID
- Define `PaymentStatus`: `CREATED`, `REQUESTED`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- FE payment result fields: `frontend/src/pages/PaymentPage.tsx` uses `imp_uid`, `merchant_uid`
- FE PortOne initiation: `frontend/src/services/PaymentService.ts`
- Backend security constraints: `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java`

**Acceptance Criteria**:
- Unit tests cover:
  - amount mismatch rejection
  - idempotent finalize behavior when already PAID
- Secrets are read from env/properties (no hard-coded keys)

**Agent-Executed QA Scenarios**:
Scenario: Payment lookup mismatch hard-fails
  Tool: Bash
  Steps:
    1. Call verify endpoint with bogus imp_uid
    2. Assert deterministic error response (4xx) and order not marked PAID
  Expected Result: no state change on invalid provider lookup
  Evidence: `.sisyphus/evidence/task-6-verify-invalid.json`

---

### 7) Webhook + verify endpoints + idempotent finalize + reconciliation

**What to do**:
- Implement endpoints:
  - `POST /api/v1/payments/verify` (trigger + event log)
  - `POST /api/v1/payments/webhook/portone` (public, secret-protected, event log)
- Both endpoints call a single `finalizePayment(merchantUid)` service
- Finalize is transactional and idempotent:
  - row lock or optimistic `@Version`
  - terminal-state no-op
  - DB uniqueness prevents double finalization
- Add a scheduled reconciliation job for stuck PAYMENT_PENDING orders (pull recent provider statuses)
- Security:
  - Permit webhook endpoint in `SecurityConfig` but require secret header
  - Redact logs; store minimal payload

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- Security config: `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java`
- Error advice: `backend/src/main/java/com/lendy/backend/common/config/CustomControllerAdvice.java`
- Jenkins test command: `Jenkinsfile`

**Acceptance Criteria**:
- Duplicate webhook calls do not change state after first finalize
- Webhook-before-verify and verify-before-webhook both converge to same PAID outcome

**Agent-Executed QA Scenarios**:
Scenario: Duplicate webhook is idempotent
  Tool: Bash (curl)
  Steps:
    1. POST recorded webhook payload twice (same merchantUid/impUid)
    2. Query order status via guest lookup endpoint
    3. Assert status is PAID and no duplicate attempts created
  Expected Result: idempotent finalize
  Evidence: `.sisyphus/evidence/task-7-webhook-dup.txt`

---

### 7a) Implement basic cancellation/refund (launch policy)

**Policy (default for launch)**:
- Guest/user-initiated cancellation allowed only before shipping (typically while `PAYMENT_PENDING` or `PAID` but not yet `SHIPPING`).
- No partial refunds for launch.
- Cancellation triggers provider cancel/refund when payment was already captured.

**What to do**:
- Add order cancel endpoint for guest lookup model:
  - `POST /api/v1/orders/guest/{orderCode}/cancel` (requires accessKey)
- Add admin refund/cancel endpoint:
  - `POST /api/v1/admin/orders/{orderCode}/cancel` (admin auth)
- Implement provider cancel via PortOne API (imp_uid-based) and record results in `PaymentEventLog`.
- Ensure idempotency: repeated cancel requests do not double-refund.

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- Order status vocabulary: `frontend/src/pages/admin/orders/AdminOrders.tsx`
- Security policy: `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java`

**Acceptance Criteria**:
- Cancel before shipping returns 200 and order becomes CANCELLED
- Cancel after SHIPPING returns 409 (or equivalent) and does not call provider cancel

**Agent-Executed QA Scenarios**:
Scenario: Guest cancel blocked after shipping
  Tool: Bash (curl)
  Steps:
    1. Create an order and move it to SHIPPING via admin endpoint
    2. Call guest cancel endpoint with correct accessKey
    3. Assert HTTP 409 and status remains SHIPPING
  Expected Result: policy enforced
  Evidence: `.sisyphus/evidence/task-7a-cancel-after-shipping.txt`

---

### 8) Frontend checkout/payment flow wired to backend (PortOne IMP)

**What to do**:
- Replace current “payment test” page with real flow:
  - From cart selection -> checkout API -> receive merchantUid/amount -> call `requestPayment(orderName, amount, merchantUid, buyer)`
  - On success: call `/api/v1/payments/verify`
  - Show pending state until backend confirms PAID (poll guest lookup or a payment status endpoint)
- Remove hard-coded buyer info from `frontend/src/services/PaymentService.ts`
- Ensure API calls use canonical `/api/v1/...` paths

**Recommended Agent Profile**:
- Category: visual-engineering
- Skills: playwright

**References**:
- Current payment initiation: `frontend/src/services/PaymentService.ts`
- Current payment page: `frontend/src/pages/PaymentPage.tsx`
- Cart selection: `frontend/src/pages/CartPage.tsx`
- Route map: `frontend/src/App.tsx`

**Acceptance Criteria**:
- UI can start checkout, invoke PortOne, and reach a confirmed PAID UI state (with mocked provider in dev if needed)

**Agent-Executed QA Scenarios**:
Scenario: Checkout -> payment trigger -> verify call
  Tool: Playwright
  Preconditions: frontend dev server + backend running; PortOne can be stubbed in dev
  Steps:
    1. Navigate to `http://localhost:5173/cart`
    2. Ensure at least one item selected; click button containing text `구매 신청`
    3. On payment page, click `결제하기`
    4. Assert frontend calls `/api/v1/orders/checkout` then `/api/v1/payments/verify` (network assertions)
    5. Screenshot `.sisyphus/evidence/task-8-payment-flow.png`
  Expected Result: Flow reaches “processing” state without crashes
  Evidence: `.sisyphus/evidence/task-8-payment-flow.png`

---

### 9) Guest order lookup API + UI

**What to do**:
- Backend:
  - `GET /api/v1/orders/guest/{orderCode}` requiring `orderAccessKey` (header or query) to return order summary + status + shipping tracking
- Frontend:
  - Add guest order lookup page (enter orderCode + accessKey)
  - Show status and tracking info

**Recommended Agent Profile**:
- Category: visual-engineering
- Skills: playwright

**References**:
- Order status vocabulary: `frontend/src/pages/admin/orders/AdminOrders.tsx`
- Route map: `frontend/src/App.tsx`

**Acceptance Criteria**:
- Guest lookup rejects missing/invalid access key
- Guest lookup returns status for valid pair

**Agent-Executed QA Scenarios**:
Scenario: Guest lookup rejects invalid key
  Tool: Bash (curl)
  Steps:
    1. Create order: `curl -s -X POST http://localhost/api/v1/orders/checkout -H "Content-Type: application/json" -d '{"items":[{"productOptionId":2001,"qty":1}],"shipping":{"receiverName":"Test","phone":"01012341234","address1":"Seoul","address2":"","zip":"00000"}}' > .sisyphus/evidence/task-9-checkout.json`
    2. Extract orderCode (python):
       `python -c "import json; d=json.load(open('.sisyphus/evidence/task-9-checkout.json','r',encoding='utf-8')); print(d['orderCode'])" > .sisyphus/evidence/task-9-orderCode.txt`
    3. Call guest lookup with wrong key:
       `ORDER_CODE=$(cat .sisyphus/evidence/task-9-orderCode.txt); curl -s -o .sisyphus/evidence/task-9-guest-lookup-invalid.json -w "%{http_code}" "http://localhost/api/v1/orders/guest/$ORDER_CODE?accessKey=wrong" > .sisyphus/evidence/task-9-guest-lookup-invalid.status`
    4. Assert status is 403/404
  Expected Result: cannot enumerate orders
  Evidence: `.sisyphus/evidence/task-9-guest-lookup-invalid.json`, `.sisyphus/evidence/task-9-guest-lookup-invalid.status`

---

### 10) Admin orders API + wire AdminOrders UI

**What to do**:
- Backend:
  - Admin list/search orders
  - Update status transitions: PAID->READY->SHIPPING->DELIVERED; CANCEL policy
  - Set shipping carrier + invoiceNo (tracking)
- Frontend:
  - Replace `MOCK` data in `frontend/src/pages/admin/orders/AdminOrders.tsx` with API data
  - Hook bulk actions to backend

**Recommended Agent Profile**:
- Category: visual-engineering
- Skills: playwright

**References**:
- Admin orders UI: `frontend/src/pages/admin/orders/AdminOrders.tsx`
- Admin guard/layout: `frontend/src/pages/admin/layout/RequireAdmin.tsx`, `frontend/src/pages/admin/layout/AdminLayout.tsx`
- Backend admin auth policy: `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java` (tighten in Task 2a)

**Acceptance Criteria**:
- Admin orders page loads from backend
- Bulk “결제확인/출고대기/배송완료/취소” triggers backend updates and UI refresh

**Agent-Executed QA Scenarios**:
Scenario: Admin API status transition (token-minted)
  Tool: Bash (curl)
  Preconditions: backend running in dev profile; `DEV_ADMIN_SECRET` set
  Steps:
    1. Mint token: `TOKEN=$(curl -s -X POST http://localhost/api/v1/dev/auth/admin-token -H "X-Dev-Admin-Secret: $DEV_ADMIN_SECRET")`
    2. Save token: `printf "%s" "$TOKEN" > .sisyphus/evidence/task-10-admin-token.txt`
    3. Call admin update endpoint (example): `curl -s -X POST http://localhost/api/v1/admin/orders/ORD-TEST/ready -H "Authorization: Bearer $TOKEN"`
    4. Assert order status changed via admin/guest lookup API
  Expected Result: admin endpoints are protected and usable for QA
  Evidence: `.sisyphus/evidence/task-10-admin-token.txt`

Scenario: Admin orders load + change status
  Tool: Playwright
  Preconditions: frontend running; admin UI is reachable (auth integration may be staged, but page must render)
  Steps:
    1. Navigate to `http://localhost:5173/admin/orders`
    2. Wait for heading `주문 관리`
    3. Screenshot `.sisyphus/evidence/task-10-admin-orders.png`
  Expected Result: Admin can transition order state
  Evidence: `.sisyphus/evidence/task-10-admin-orders.png`

---

### 11) CI/Docker alignment (frontend Dockerfile + Jenkins updates)

**What to do**:
- Restore/add `frontend/Dockerfile` (CI currently references it in `Jenkinsfile`)
- Update Jenkins frontend stage for Vite build/test
- Remove `|| true` from frontend tests once stabilized
- Ensure Docker images build: backend, frontend, gateway
- Update docs: `docs/deploy/ci.md`

**Recommended Agent Profile**:
- Category: unspecified-high
- Skills: (none)

**References**:
- CI: `Jenkinsfile` (frontend stage uses `npm test ... || true`, docker build references `frontend/Dockerfile`)
- Backend Docker: `backend/Dockerfile`
- Deploy: `deploy/docker-compose.yml`

**Acceptance Criteria**:
- `docker build -t lendy-frontend:latest -f frontend/Dockerfile .` succeeds
- Jenkinsfile frontend stage no longer ignores test failures

**Agent-Executed QA Scenarios**:
Scenario: Docker build frontend image
  Tool: Bash
  Steps:
    1. Run docker build for frontend
    2. Assert exit code 0
  Expected Result: image builds
  Evidence: `.sisyphus/evidence/task-11-docker-frontend-build.txt`

---

## Defaults Applied (override if needed)
- Fresh DB assumption for Flyway baseline (no production data migration)
- No partial refunds for launch; cancellation/refund policy is “basic”:
  - User can cancel before shipping; admin can cancel/refund; refund executes provider cancel API when needed
- Single provider surface: PortOne only; no multi-PG abstraction layer

---

## Success Criteria

### Verification Commands
```bash
docker compose -f deploy/docker-compose.yml up -d --force-recreate
curl -s http://localhost/api/v1/health

cd backend && ./gradlew test

cd frontend && npm ci
cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
```

### Final Checklist
- [x] Gateway `/api` routing matches backend controller mappings
- [x] Guest checkout creates Order + PaymentAttempt with server-owned amount and merchant_uid
- [x] Webhook + verify converge to PAID via idempotent finalize
- [x] Guest order lookup is not enumerable (requires access key)
- [x] Admin can progress fulfillment statuses and set invoice
- [x] Flyway migrations are the source of schema truth for production
- [x] CI (Jenkins) builds and tests succeed with Vite migration
