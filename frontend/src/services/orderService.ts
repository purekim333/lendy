const API_BASE = "/api/v1";

export interface CheckoutItem {
  productOptionId: number;
  qty: number;
}

export interface ShippingInfo {
  receiverName: string;
  phone: string;
  address1: string;
  address2: string;
  zip: string;
  deliveryMessage?: string;
}

export interface GuestInfo {
  name: string;
  phone: string;
  email: string;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  shipping: ShippingInfo;
  guest: GuestInfo;
}

export interface CheckoutResponse {
  orderCode: string;
  orderAccessKey: string;
  merchantUid: string;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: string;
}

export interface VerifyPaymentRequest {
  merchantUid: string;
  impUid: string;
}

export interface GuestOrderResponse {
  orderCode: string;
  status: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    qty: number;
    price: number;
  }>;
}

import { fetchWithAccess } from "../util/fetchUtil";

// ... (interfaces remain the same)

export async function checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
  // fetchWithAccess handles token refresh and headers
  const response = await fetchWithAccess(`${API_BASE}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`주문 생성 실패: ${error}`);
  }

  return response.json();
}

export async function verifyPayment(request: VerifyPaymentRequest): Promise<void> {
  const response = await fetchWithAccess(`${API_BASE}/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`결제 검증 실패: ${error}`);
  }
}

export async function getGuestOrder(
  orderCode: string,
  accessKey: string
): Promise<GuestOrderResponse> {
  const response = await fetch(
    `${API_BASE}/orders/guest/${orderCode}?accessKey=${encodeURIComponent(accessKey)}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`주문 조회 실패: ${error}`);
  }

  return response.json();
}

export interface MyOrderSummary {
  orderCode: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  firstItemName: string;
  itemCount: number;
  firstItemImageUrl: string | null;
}

export interface OrderDetail {
  orderCode: string;
  status: string;
  buyerName: string;
  buyerPhone: string;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  receiverName: string;
  receiverPhone: string;
  address1: string;
  address2: string;
  zipCode: string;
  deliveryMessage: string;
  carrier: string | null;
  invoiceNo: string | null;
  items: Array<{
    productName: string;
    optionDescription: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl: string | null;
  }>;
}

export async function getMyOrders(): Promise<MyOrderSummary[]> {
  const response = await fetchWithAccess(`${API_BASE}/orders/my`);
  if (!response.ok) throw new Error("주문 내역 조회 실패");
  return response.json();
}

export async function getMyOrderDetail(orderCode: string): Promise<OrderDetail> {
  const response = await fetchWithAccess(`${API_BASE}/orders/my/${orderCode}`);
  if (!response.ok) throw new Error("주문 상세 조회 실패");
  return response.json();
}
