# Draft: HaveAMood (Rental Commerce) + Learning Docs/Comments

## Vision (confirmed)
- Project: HaveAMood clothing shopping mall.
- Differentiator: user can rent clothes in desired quantities ("대여").
- Feature scope will be finalized via interview (you + me).

## MVP Scope Pivot (confirmed)
- MVP 1: "대여"는 제외하고, 먼저 "구매 가능한" 쇼핑몰을 완성 (상품 등록 + 결제 + 주문까지).
- MVP 2+: 이후 옵션으로 "구매하기 / 대여하기"를 분기해 확장.

## Checkout Auth Decision (confirmed)
- MVP1 목표는 "로그인 없이 바로 구매"(guest checkout 허용).
- Implication: 주문 조회/환불/배송지 변경 등을 위해 guest 주문 식별/조회 방식을 설계해야 함.

## Guest Order Lookup (confirmed)
- MVP1 주문 조회 키: "주문번호 + 휴대폰번호".

## Payment Architecture Decision (confirmed)
- MVP1 결제 확정은 webhook 기반으로 설계(신뢰 원천 = 서버 수신 이벤트 + 서버측 결제 검증).
- PortOne(아임포트) API 활용을 전제로 학습자료/문서를 정리.

## Docs Request (confirmed)
- User wants payment system learning materials summarized under a new `docs/` folder (to be created by execution agent).

## Rental Period Decision (confirmed)
- User can choose rental dates.
- Admin can adjust rental dates/allocations.
- Availability should consider real-world turnaround time (shipping + cleaning/processing) between rentals.

## Delivery/Return Confirmation (new, confirmed)
- User selects: "수령일 / 반납일" (logistics-based dates).
- Physical items will have barcodes.
- Receipt confirmation idea: user takes a photo (scan barcode via camera) and system treats it as "수령" (proof-of-receipt workflow).
- User prefers B: receipt confirmation requires photo upload.

## QR -> Receipt Confirmation Flow (new, described)
- Attach QR code to garment/unit.
- User scans QR with phone camera -> opens frontend receipt page.
- Receipt page offers "사진찍기" -> user captures photo immediately.
- Upload photo -> system auto-confirms receipt.

## QR Token Choice (confirmed)
- Use shipping-instance one-time QR (URL + one-time token) for receipt confirmation.

## Frontend Route Anchor (evidence)
- Frontend routes are centralized in `frontend/src/App.tsx`.
- `LayoutWithoutHeader` route group exists and is currently empty; good fit for a QR-opened receipt page.

## Backend Route Anchor (evidence)
- Gateway proxies `/api/` to backend and strips the prefix: `deploy/gateway/default.conf`.
- Backend Security policy is in `backend/src/main/java/com/lendy/backend/User/config/SecurityConfig.java` and can permit a public receipt endpoint.

## Recommended Security/Operations Defaults (Oracle)
- Use opaque random single-use token in URL; store hashed token in DB; enforce TTL + one-time consumption.
- Gate confirmation: token usable only after shipment marked DELIVERED (carrier event or admin mark).
- Use an auditable state machine + append-only transition log; admin overrides require reason.
- Store photo in object storage (S3/MinIO); DB stores metadata only (object key, hashes, timestamps, token/shipment binding).
- Strip EXIF and validate MIME/size; rate-limit token attempts.

## Implications (needs design)
- Inventory likely needs per-physical-item tracking (ProductUnit) to attach barcode IDs.
- Fraud/abuse risk if user-side photo is authoritative; may need admin review or secondary verification.
- Turnaround buffer (배송/세탁) affects how availability is computed between rentals.
- Barcode capture method still needs decision: decode barcode from photo vs separate scan/input + photo as evidence.

## Delivery vs Receipt Semantics (proposed)
- Separate timestamps/states:
  - "배송완료" = carrier-delivered event (`deliveredAt`) from courier integration.
  - "수령확정" = customer-confirmed receipt (`receivedAt`) via QR open + photo upload.
- Gate: allow receipt-confirm only after deliveredAt (or within a configured window) to reduce abuse.

## Open Policy Question
- If actual delivery is later than user-selected scheduled receive date, should the system automatically shift the return date to preserve the rental duration?

## Delay Policy (confirmed)
- If deliveredAt is later than scheduled receive date, automatically extend return date by the delay (preserve rental duration).
- Admin/user can override when needed.

## Learning Goal (confirmed)
- As you implement methods, add explanatory comments.
- Create architecture decision documentation (user asked for a `docs/` folder).

## Early MVP Option (suggested, not confirmed)
- Keep rentals "immediate" first (no future reservation calendar): availability derives from `ProductOption.count`.
- Fix rental duration initially (e.g., 7 days) to avoid date-range availability complexity; evolve to start/end date booking later.

## Current Codebase Signals (evidence-backed)
- Backend product option already has rental pricing + count:
  - `backend/src/main/java/com/lendy/backend/Product/entity/ProductOption.java` includes `count` and `rentalPrice`.
- Backend already includes AWS starter dependency (suggests future S3 uploads are intended):
  - `backend/build.gradle` includes `org.springframework.cloud:spring-cloud-starter-aws:2.2.6.RELEASE`.
- Product images are modeled as URL strings (storage mechanism not implemented here yet):
  - `backend/src/main/java/com/lendy/backend/Product/entity/ProductImage.java` uses `imageURL`.
- Cart currently models quantity per user + product option:
  - `backend/src/main/java/com/lendy/backend/Cart/entity/Cart.java` has `quantity` and links to `ProductOption`.
  - `backend/src/main/java/com/lendy/backend/Cart/repository/CartRepository.java` query uses `buyPrice` and contains TODO note to switch to rental price.
- Auth refresh endpoint exists and is used by frontend fetch helper:
  - `backend/src/main/java/com/lendy/backend/Jwt/controller/JwtController.java` exposes `POST /jwt/refresh`.
  - `frontend/src/util/fetchUtil.ts` calls `${REACT_APP_BACKEND_API_BASE_URL}/jwt/refresh`.
- Gateway proxy behavior:
  - `deploy/gateway/default.conf`: `/api/` -> backend and strips `/api/` prefix.

## Current Commerce Flow (observed)
- Frontend cart is currently local-first (localStorage):
  - `frontend/src/utils/cartStorage.ts` stores cart under key `cart:v1`.
  - `frontend/src/pages/ProductDetailPage.tsx` uses `addToCart()`.
  - `frontend/src/pages/CartPage.tsx` reads via `getCart()` and navigates to `/payment`.
- Frontend payment is a test scaffold and expects a backend verify endpoint:
  - `frontend/src/pages/PaymentPage.tsx` calls `POST /api/payments/verify` and alerts "주문 확정" on success.
- Backend has Cart APIs (`/api/v1/cart/*`) but frontend is not wired to them yet.
- Backend has no Order/Checkout domain surfaced in current tree (needs confirmation), so cart -> payment -> order completion is incomplete.

## MVP 1 Gap List (purchase-first)
- Backend: Order/Checkout 도메인 부재(또는 미구현)로 "결제 검증 -> 주문 확정"이 완결되지 않음.
- Frontend: 장바구니는 localStorage 기반이고, 결제 페이지는 테스트 스캐폴딩(`POST /api/payments/verify` 기대) 수준.
- Admin: 주문 페이지는 mock 데이터 기반.

## MVP 1 UI/Code Anchors (evidence)
- Backend product controller is currently empty:
  - `backend/src/main/java/com/lendy/backend/Product/controller/ProductController.java`
- Admin product create page already assumes a backend endpoint + multipart upload:
  - `frontend/src/pages/admin/products/Create.tsx` submits `POST /api/admin/products` with `FormData(meta JSON + images[])`.
- Payment is wired to PortOne(Iamport) client SDK with hardcoded test values:
  - `frontend/src/services/PaymentService.ts` calls `IMP.init("imp60840556")` and `request_pay`.
  - `frontend/src/pages/PaymentPage.tsx` expects `POST /api/payments/verify`.
- Admin orders UI exists but is mock-only:
  - `frontend/src/pages/admin/orders/AdminOrders.tsx` defines `OrderStatus` and uses `MOCK` data.

## MVP1 Notes (purchase-first)
- Product/Order/Payment은 현재 프론트 스캐폴딩이 앞서 있고 백엔드 API가 따라오지 못한 상태로 보임.
- Admin 상품등록 UI가 기대하는 API 계약(멀티파트 + meta JSON + images[])을 백엔드에서 맞춰 주는 것이 최단 경로.
- Guest checkout 허용 시 최소 주문 식별/조회 UX가 필요(예: 주문번호 + 휴대폰/이메일 + 간단한 확인수단).

## MVP2+ Reserved (rental)
- Rental은 MVP1 이후 "구매/대여" 분기 옵션으로 확장.
- Delivery/receipt QR + photo auto-confirm 설계는 MVP2 영역으로 보관.

## Immediate Gaps for Rentals
- No concept of rental period (start/end dates) in backend entities.
- Product availability is only `count` (static stock), no date-based availability to prevent overbooking.
- No order/reservation lifecycle discovered yet (needs confirmation).

## Immediate Gaps for End-to-End Purchase/Rental
- Missing backend endpoint for `POST /api/payments/verify` expected by frontend.
- Missing backend order creation flow (cart -> order) and admin orders backed by real data.

## Documentation Approach (proposal)
- Use ADRs (Architecture Decision Records) for "why": each decision has context, options, decision, consequences.
- Keep docs in Korean (matches existing inline comments).

## Constraints
- Prometheus (planner) cannot create/modify `docs/` directly; execution agent will implement from the plan.

## Open Questions
- Rental model: fixed duration vs user-chosen start/end dates?
- Availability: simple stock decrement on checkout vs reservation calendar (prevent overlap)?
- Pricing: per-day vs per-period vs membership/credits?
- Returns/extension: needed for MVP?
- Deposit/damage fee policy?
