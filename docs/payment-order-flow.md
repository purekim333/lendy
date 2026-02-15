# 결제/주문 플로우 문서

## 목차
1. [전체 아키텍처](#1-전체-아키텍처)
2. [주문 생성 (Checkout)](#2-주문-생성-checkout)
3. [PG 결제 (PortOne/아임포트)](#3-pg-결제-portone아임포트)
4. [결제 검증](#4-결제-검증)
5. [웹훅 처리](#5-웹훅-처리)
6. [비회원 주문 조회](#6-비회원-주문-조회)
7. [주문 취소](#7-주문-취소)
8. [관리자 주문 관리](#8-관리자-주문-관리)
9. [상태 머신](#9-상태-머신)
10. [API 명세](#10-api-명세)
11. [DB 테이블](#11-db-테이블)

---

## 1. 전체 아키텍처

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────>│   Backend    │────>│   PortOne    │────>│   PG사       │
│  (React)    │<────│ (Spring Boot)│<────│  (아임포트)   │<────│ (이니시스 등) │
│  :5173      │     │  :8080       │     │  API Server  │     │              │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                   │
       │   Vite Proxy      │
       │  /api -> :8080    │
       │                   │
       ▼                   ▼
  localStorage          MySQL 8.0
  (장바구니)          (주문/결제 데이터)
```

**핵심 관계:**
- **Frontend** <-> **Backend**: REST API (`/api/v1/...`)
- **Frontend** <-> **PortOne**: 클라이언트 SDK (`IMP.request_pay`)
- **Backend** <-> **PortOne**: 서버 API (`https://api.iamport.kr`)
- **PortOne** <-> **PG사**: PortOne이 내부적으로 처리

---

## 2. 주문 생성 (Checkout)

### 플로우

```
[프론트엔드]                         [백엔드]
    │                                   │
    │  POST /api/v1/orders/checkout     │
    │  ─────────────────────────────>   │
    │  {items, shipping, guest}         │
    │                                   │── ProductOption 조회 및 가격 계산
    │                                   │── Order 엔티티 생성 (PAYMENT_PENDING)
    │                                   │── orderCode 생성 (UUID 16자리)
    │                                   │── accessKey 생성 + SHA-256 해시 저장
    │                                   │── merchantUid 생성 (ORDER_yyyyMMddHHmmss_xxxxxxxx)
    │                                   │── PaymentAttempt 생성 (CREATED)
    │  <─────────────────────────────   │
    │  {orderCode, orderAccessKey,      │
    │   merchantUid, totalAmount, ...}  │
    │                                   │
```

### 요청 (CheckoutRequest)

```json
{
  "items": [
    { "productOptionId": 1, "qty": 2 }
  ],
  "shipping": {
    "receiverName": "홍길동",
    "phone": "01012345678",
    "address1": "서울시 강남구",
    "address2": "101호",
    "zip": "06000",
    "deliveryMessage": "문 앞에 놓아주세요"
  },
  "guest": {
    "name": "홍길동",
    "phone": "01012345678",
    "email": "hong@email.com"
  }
}
```

### 응답 (CheckoutResponse)

```json
{
  "orderCode": "A1B2C3D4E5F6G7H8",
  "orderAccessKey": "K9L0M1N2O3P4Q5R6",
  "merchantUid": "ORDER_20260214153000_abcd1234",
  "subtotalAmount": 45000,
  "shippingFee": 3000,
  "totalAmount": 48000,
  "status": "PAYMENT_PENDING"
}
```

### 가격 계산 로직
- **배송비**: 상품 합계 >= 50,000원이면 무료, 아니면 3,000원
- **총액**: 상품 합계 + 배송비
- 프론트엔드 기준은 40,000원이지만 **백엔드 기준(50,000원)이 최종 기준**

### 주요 코드 위치
- Controller: `orders/controller/OrderController.java` → `POST /checkout`
- Service: `orders/service/OrderService.java` → `checkout()`
- Entity: `orders/entity/Order.java`, `orders/entity/OrderItem.java`

---

## 3. PG 결제 (PortOne/아임포트)

### 플로우 (프론트엔드에서 처리)

```
[프론트엔드]                         [PortOne SDK]                    [PG사(이니시스)]
    │                                   │                                 │
    │  IMP.init("imp60840556")          │                                 │
    │  IMP.request_pay({                │                                 │
    │    pg: "html5_inicis",            │                                 │
    │    pay_method: "card",            │                                 │
    │    merchant_uid,                  │                                 │
    │    amount,                        │                                 │
    │    buyer_name, ...                │                                 │
    │  })                               │                                 │
    │  ─────────────────────────────>   │                                 │
    │                                   │  결제창 표시 ─────────────────>  │
    │                                   │                                 │
    │                                   │  <───────── 카드사 인증/결제     │
    │  <─────────────────────────────   │                                 │
    │  callback(rsp)                    │                                 │
    │  rsp.success = true               │                                 │
    │  rsp.imp_uid = "imp_xxxxx"        │                                 │
    │  rsp.merchant_uid = "ORDER_..."   │                                 │
```

### PortOne 설정
- **가맹점 코드**: `imp60840556`
- **PG사**: `html5_inicis` (KG이니시스)
- **결제 수단**: `card` (신용카드)

### 주요 코드 위치
- `frontend/src/services/PaymentService.ts` → `requestPayment()`

---

## 4. 결제 검증

PG 결제 성공 후 **반드시 서버 사이드 검증**을 거쳐야 함 (금액 위변조 방지).

### 플로우

```
[프론트엔드]                    [백엔드]                         [PortOne API]
    │                             │                                 │
    │  POST /api/v1/payments/     │                                 │
    │       verify                │                                 │
    │  {merchantUid, impUid}      │                                 │
    │  ────────────────────────>  │                                 │
    │                             │  POST /users/getToken            │
    │                             │  ──────────────────────────────> │
    │                             │  <── access_token ────────────── │
    │                             │                                 │
    │                             │  GET /payments/{impUid}          │
    │                             │  ──────────────────────────────> │
    │                             │  <── {amount, status, ...} ──── │
    │                             │                                 │
    │                             │── merchantUid 일치 검증           │
    │                             │── amount 일치 검증 (DB vs PortOne)│
    │                             │── status == "paid" 검증           │
    │                             │                                 │
    │                             │── PaymentAttempt → PAID          │
    │                             │── Order → PAID                   │
    │                             │                                 │
    │  <────────────────────────  │                                 │
    │  200 OK                     │                                 │
```

### 검증 항목 (PaymentService.finalizePayment)
1. **멱등성 체크**: 이미 터미널 상태(PAID/FAILED/CANCELLED/REFUNDED)면 스킵
2. **PortOne 조회**: `imp_uid`로 실제 결제 정보 조회
3. **merchantUid 일치**: 우리가 보낸 것과 PortOne이 응답한 것이 같은지
4. **금액 일치**: DB에 저장된 금액과 PortOne이 응답한 금액이 같은지
5. **결제 상태**: PortOne 응답의 status가 `"paid"`인지

### 검증 실패 시
- `MERCHANT_MISMATCH` → 예외 발생
- `AMOUNT_MISMATCH` → 예외 발생
- `NOT_PAID` → PaymentAttempt를 FAILED로 업데이트

### 주요 코드 위치
- Controller: `payments/controller/PaymentController.java` → `POST /verify`
- Service: `payments/service/PaymentService.java` → `verifyPayment()` → `finalizePayment()`
- Client: `payments/client/PortOneClient.java` → `getPaymentByImpUid()`

---

## 5. 웹훅 처리

PortOne은 결제 상태 변경 시 **서버로 직접 웹훅**을 보냄. 프론트엔드 검증과 **이중 안전장치** 역할.

### 플로우

```
[PortOne]                          [백엔드]
    │                                 │
    │  POST /api/v1/payments/         │
    │       webhook/portone           │
    │  {imp_uid, merchant_uid, ...}   │
    │  ─────────────────────────────> │
    │                                 │── PaymentEventLog 기록
    │                                 │── finalizePayment() 호출 (검증 API와 동일 로직)
    │  <───────────────────────────── │
    │  200 OK                         │
```

### 특징
- 프론트엔드 verify와 **동일한 `finalizePayment()` 로직** 사용
- **멱등성 보장**: 이미 PAID면 중복 처리 안 함
- `source` 파라미터로 `"WEBHOOK"` vs `"VERIFY_API"` 구분
- TODO: 웹훅 시그니처 검증 (`X-PortOne-Signature`) 미구현

### 주요 코드 위치
- Controller: `payments/controller/PaymentController.java` → `POST /webhook/portone`
- Service: `payments/service/PaymentService.java` → `handleWebhook()`

---

## 6. 비회원 주문 조회

### 플로우

```
[프론트엔드]                         [백엔드]
    │                                   │
    │  GET /api/v1/orders/guest/        │
    │      {orderCode}?accessKey=xxx    │
    │  ─────────────────────────────>   │
    │                                   │── orderCode로 주문 조회
    │                                   │── accessKey SHA-256 해시 → DB 해시와 비교
    │                                   │── 불일치 시 403 Forbidden
    │  <─────────────────────────────   │
    │  {orderCode, status, items, ...}  │
```

### 보안
- `orderAccessKey`는 checkout 시 **1회만** 평문 반환
- DB에는 **SHA-256 해시**만 저장
- 조회 시 입력한 키를 해싱해서 비교

---

## 7. 주문 취소

### 비회원 취소

```
[프론트엔드]                         [백엔드]                      [PortOne API]
    │                                   │                              │
    │  POST /api/v1/orders/guest/       │                              │
    │       {orderCode}/cancel          │                              │
    │       ?accessKey=xxx              │                              │
    │  ─────────────────────────────>   │                              │
    │                                   │── accessKey 검증              │
    │                                   │── 상태 확인 (PAYMENT_PENDING  │
    │                                   │   또는 PAID만 취소 가능)       │
    │                                   │                              │
    │                                   │── [PAID인 경우]               │
    │                                   │   POST /payments/cancel      │
    │                                   │   ──────────────────────────> │
    │                                   │   <── 환불 처리 결과 ──────── │
    │                                   │                              │
    │                                   │── Order → CANCELLED           │
    │  <─────────────────────────────   │                              │
    │  200 OK                           │                              │
```

### 취소 조건
- `PAYMENT_PENDING`: 바로 취소 (결제 전이므로 환불 불필요)
- `PAID`: PortOne API로 **환불 요청** 후 취소
- `SHIPPING`, `DELIVERED`: 취소 불가 (409 Conflict)
- `CANCELLED`: 이미 취소됨 → 멱등성 처리 (200 OK)

---

## 8. 관리자 주문 관리

### API 엔드포인트

| 메서드 | URL | 설명 | 상태 전이 |
|--------|-----|------|-----------|
| `GET` | `/api/v1/admin/orders` | 주문 목록 (페이징, status 필터) | - |
| `GET` | `/api/v1/admin/orders/{orderCode}` | 주문 상세 | - |
| `POST` | `/api/v1/admin/orders/{orderCode}/ready` | 배송 준비 | PAID → READY |
| `POST` | `/api/v1/admin/orders/{orderCode}/ship` | 배송 시작 | READY → SHIPPING |
| `POST` | `/api/v1/admin/orders/{orderCode}/deliver` | 배송 완료 | SHIPPING → DELIVERED |
| `POST` | `/api/v1/admin/orders/{orderCode}/cancel` | 관리자 취소 | PAID/READY → CANCELLED |

### 배송 시작 요청 (ShipRequest)

```json
{
  "carrier": "CJ대한통운",
  "invoiceNo": "1234567890"
}
```

### 주요 코드 위치
- Controller: `orders/controller/AdminOrderController.java`
- Service: `orders/service/AdminOrderService.java`
- DTO: `orders/dto/AdminOrderResponse.java`

---

## 9. 상태 머신

### Order 상태

```
                    ┌──────────────┐
                    │PAYMENT_PENDING│
                    └──────┬───────┘
                           │ 결제 검증 성공
                    ┌──────▼───────┐
              ┌─────│     PAID     │─────┐
              │     └──────┬───────┘     │
              │            │ 관리자:      │ 취소
              │            │ /ready      │
              │     ┌──────▼───────┐     │
              │  ┌──│    READY     │──┐  │
              │  │  └──────┬───────┘  │  │
              │  │         │ 관리자:   │  │
              │  │         │ /ship    │취소│
              │  │  ┌──────▼───────┐  │  │
              │  │  │   SHIPPING   │  │  │
              │  │  └──────┬───────┘  │  │
              │  │         │ 관리자:   │  │
              │  │         │ /deliver │  │
              │  │  ┌──────▼───────┐  │  │
              │  │  │  DELIVERED   │  │  │
              │  │  └──────────────┘  │  │
              │  │                    │  │
              │  │  ┌──────────────┐  │  │
              │  └─>│  CANCELLED   │<─┘  │
              └────>│              │<─────┘
                    └──────────────┘
```

### Payment 상태

```
CREATED → REQUESTED → PAID
                    → FAILED
         PAID → CANCELLED
              → REFUNDED
```

---

## 10. API 명세

### 공개 API (인증 불필요)

| 메서드 | URL | 설명 |
|--------|-----|------|
| `POST` | `/api/v1/orders/checkout` | 주문 생성 |
| `GET` | `/api/v1/orders/guest/{orderCode}?accessKey=` | 비회원 주문 조회 |
| `POST` | `/api/v1/orders/guest/{orderCode}/cancel?accessKey=` | 비회원 주문 취소 |
| `POST` | `/api/v1/payments/verify` | 결제 검증 (프론트엔드 → 백엔드) |
| `POST` | `/api/v1/payments/webhook/portone` | PortOne 웹훅 수신 |

### 관리자 API (ADMIN 권한 필요)

| 메서드 | URL | 설명 |
|--------|-----|------|
| `GET` | `/api/v1/admin/orders?status=&page=&size=` | 주문 목록 |
| `GET` | `/api/v1/admin/orders/{orderCode}` | 주문 상세 |
| `POST` | `/api/v1/admin/orders/{orderCode}/ready` | 배송 준비 |
| `POST` | `/api/v1/admin/orders/{orderCode}/ship` | 배송 시작 |
| `POST` | `/api/v1/admin/orders/{orderCode}/deliver` | 배송 완료 |
| `POST` | `/api/v1/admin/orders/{orderCode}/cancel` | 관리자 취소 |

---

## 11. DB 테이블

### ORDERS

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| order_code | VARCHAR(36) UNIQUE | 주문번호 (UUID 기반 16자리) |
| order_access_key_hash | VARCHAR(64) | 접근키 SHA-256 해시 |
| buyer_name | VARCHAR(100) | 주문자명 |
| buyer_phone | VARCHAR(20) | 주문자 연락처 |
| buyer_email | VARCHAR(255) | 주문자 이메일 |
| receiver_name | VARCHAR(100) | 수령인명 |
| receiver_phone | VARCHAR(20) | 수령인 연락처 |
| address1 | VARCHAR(255) | 주소 |
| address2 | VARCHAR(255) | 상세주소 |
| zip_code | VARCHAR(10) | 우편번호 |
| delivery_message | VARCHAR(500) | 배송 메시지 |
| subtotal_amount | INT | 상품 합계 |
| shipping_fee | INT | 배송비 |
| total_amount | INT | 총 결제금액 |
| status | VARCHAR(20) | 주문 상태 (OrderStatus enum) |
| merchant_uid | VARCHAR(50) UNIQUE | PG 결제 식별자 |
| carrier | VARCHAR(50) | 택배사 |
| invoice_no | VARCHAR(50) | 운송장번호 |
| created_at | DATETIME | 생성일시 |
| updated_at | DATETIME | 수정일시 |

### ORDER_ITEMS

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| order_id | BIGINT FK | 주문 ID |
| product_option_id | INT | 상품 옵션 ID |
| product_name | VARCHAR(255) | 상품명 (스냅샷) |
| option_description | VARCHAR(255) | 옵션 설명 (스냅샷) |
| quantity | INT | 수량 |
| unit_price | INT | 단가 (스냅샷) |
| total_price | INT | 소계 |
| image_url | VARCHAR(500) | 상품 이미지 URL |

### PAYMENT_ATTEMPT

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 자동 증가 |
| merchant_uid | VARCHAR(50) UNIQUE | PG 결제 식별자 |
| imp_uid | VARCHAR(50) UNIQUE | PortOne 결제 고유번호 |
| order_id | BIGINT | 주문 ID |
| amount | INT | 결제 금액 |
| status | VARCHAR(20) | 결제 상태 (PaymentStatus enum) |
| pay_method | VARCHAR(20) | 결제 수단 (card 등) |
| pg_provider | VARCHAR(30) | PG사 (html5_inicis 등) |
| receipt_url | VARCHAR(500) | 영수증 URL |
| error_code | VARCHAR(50) | 에러 코드 |
| error_msg | VARCHAR(500) | 에러 메시지 |
| version | BIGINT | 낙관적 락 버전 |
| created_at | DATETIME | 생성일시 |
| updated_at | DATETIME | 수정일시 |

### PAYMENT_EVENT_LOG

| 컬럼 | 타입 | 설명 |
|------|------|------|
| merchant_uid | VARCHAR(50) | PG 결제 식별자 |
| imp_uid | VARCHAR(50) | PortOne 결제 고유번호 |
| event_type | VARCHAR | FINALIZE / CANCEL |
| source | VARCHAR | VERIFY_API / WEBHOOK / ORDER_CANCEL |
| amount | INT | 금액 |
| processing_result | VARCHAR | SUCCESS / AMOUNT_MISMATCH / NOT_PAID 등 |
| error_message | VARCHAR | 에러 상세 |

---

## 전체 결제 시퀀스 (정상 플로우)

```
[사용자]     [프론트엔드]        [백엔드]           [PortOne]         [PG사]
  │              │                 │                  │                │
  │ 결제 클릭     │                 │                  │                │
  │─────────────>│                 │                  │                │
  │              │ POST /checkout  │                  │                │
  │              │────────────────>│                  │                │
  │              │                 │ Order 생성        │                │
  │              │                 │ PaymentAttempt    │                │
  │              │<────────────────│ 생성              │                │
  │              │ {merchantUid,   │                  │                │
  │              │  totalAmount}   │                  │                │
  │              │                 │                  │                │
  │              │ IMP.request_pay │                  │                │
  │              │────────────────────────────────────>│                │
  │              │                 │                  │ 결제 요청        │
  │              │                 │                  │───────────────>│
  │ [결제창]      │                 │                  │                │
  │ 카드 정보     │                 │                  │                │
  │ 입력         │                 │                  │<───────────────│
  │              │<────────────────────────────────────│ 결제 완료       │
  │              │ {imp_uid,       │                  │                │
  │              │  merchant_uid}  │                  │                │
  │              │                 │                  │                │
  │              │ POST /verify    │                  │                │
  │              │────────────────>│                  │                │
  │              │                 │ GET /payments/   │                │
  │              │                 │     {impUid}     │                │
  │              │                 │─────────────────>│                │
  │              │                 │<─────────────────│                │
  │              │                 │ 금액/상태 검증     │                │
  │              │                 │ Order → PAID      │                │
  │              │<────────────────│                  │                │
  │              │ 200 OK          │                  │                │
  │              │                 │                  │                │
  │ 결제 완료     │                 │                  │ Webhook 전송    │
  │ 화면 표시     │                 │                  │                │
  │<─────────────│                 │  POST /webhook   │                │
  │              │                 │<─────────────────│                │
  │              │                 │ (멱등성으로 스킵)  │                │
  │              │                 │─────────────────>│                │
  │              │                 │ 200 OK            │                │
```
