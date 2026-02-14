import { useState } from "react";

type OrderStatus = "PAYMENT_PENDING" | "PAID" | "READY" | "SHIPPING" | "DELIVERED" | "CANCELLED";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PAYMENT_PENDING: "결제대기",
  PAID: "결제완료",
  READY: "출고대기",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  PAYMENT_PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-sky-50 text-sky-700 border-sky-200",
  READY: "bg-gray-100 text-gray-700 border-gray-200",
  SHIPPING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

interface OrderItem {
  productName: string;
  optionDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface GuestOrderDetail {
  orderCode: string;
  status: OrderStatus;
  buyerName: string;
  buyerPhone: string;
  receiverName: string;
  receiverPhone: string;
  address1: string;
  address2: string;
  zipCode: string;
  subtotalAmount: number;
  shippingFee: number;
  totalAmount: number;
  carrier?: string;
  invoiceNo?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "/api/v1";

export default function OrderLookupPage() {
  const [step, setStep] = useState<"form" | "result">("form");
  const [orderCode, setOrderCode] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [order, setOrder] = useState<GuestOrderDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}.${m}.${day} ${hh}:${mm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !accessKey.trim()) {
      setError("주문번호와 조회키를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/orders/guest/${encodeURIComponent(orderCode.trim())}?accessKey=${encodeURIComponent(accessKey.trim())}`
      );

      if (response.status === 404) {
        setError("주문을 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      if (response.status === 403) {
        setError("조회키가 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError("주문 조회에 실패했습니다.");
        setLoading(false);
        return;
      }

      const data: GuestOrderDetail = await response.json();
      setOrder(data);
      setStep("result");
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("주문을 취소하시겠습니까?")) return;

    setCancelLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/orders/guest/${encodeURIComponent(order.orderCode)}/cancel?accessKey=${encodeURIComponent(accessKey.trim())}`,
        { method: "POST" }
      );

      if (response.status === 403) {
        setError("조회키가 올바르지 않습니다.");
        setCancelLoading(false);
        return;
      }

      if (!response.ok) {
        setError("주문 취소에 실패했습니다.");
        setCancelLoading(false);
        return;
      }

      // Refresh order data
      const refreshResponse = await fetch(
        `${API_BASE}/orders/guest/${encodeURIComponent(order.orderCode)}?accessKey=${encodeURIComponent(accessKey.trim())}`
      );

      if (refreshResponse.ok) {
        const data: GuestOrderDetail = await refreshResponse.json();
        setOrder(data);
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setOrderCode("");
    setAccessKey("");
    setOrder(null);
    setError("");
  };

  const canCancel = order && (order.status === "PAYMENT_PENDING" || order.status === "PAID");

  return (
    <main className="mx-auto w-full max-w-[480px] bg-white px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">주문 조회</h1>

      {step === "form" ? (
        <div className="rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="orderCode" className="block text-sm font-medium mb-2">
                주문번호
              </label>
              <input
                id="orderCode"
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="주문번호를 입력하세요"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div>
              <label htmlFor="accessKey" className="block text-sm font-medium mb-2">
                조회키
              </label>
              <input
                id="accessKey"
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="조회키를 입력하세요"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "조회 중..." : "주문 조회"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order Status */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">주문 정보</h2>
              <span
                className={`inline-block border text-sm px-3 py-1 rounded-lg ${
                  order ? STATUS_CLASS[order.status] : ""
                }`}
              >
                {order ? STATUS_LABEL[order.status] : ""}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호</span>
                <span className="font-medium">{order?.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주문일시</span>
                <span>{order ? formatDate(order.createdAt) : ""}</span>
              </div>
              {order?.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">상태 변경일시</span>
                  <span>{formatDate(order.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">주문 상품</h3>
            <div className="space-y-3">
              {order?.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.optionDescription} · {item.quantity}개
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{fmt(item.totalPrice)}원</div>
                    <div className="text-xs text-gray-500 mt-1">
                      단가 {fmt(item.unitPrice)}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">결제 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">상품 금액</span>
                <span>{order ? fmt(order.subtotalAmount) : "0"}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배송비</span>
                <span>{order ? fmt(order.shippingFee) : "0"}원</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold text-base">
                <span>총 결제금액</span>
                <span className="text-emerald-600">
                  {order ? fmt(order.totalAmount) : "0"}원
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">배송지 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">받는 분</span>
                <span>{order?.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연락처</span>
                <span>{order?.receiverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">우편번호</span>
                <span>{order?.zipCode}</span>
              </div>
              <div>
                <div className="text-gray-600 mb-1">주소</div>
                <div className="text-gray-900">
                  {order?.address1}
                  <br />
                  {order?.address2}
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order?.carrier && order?.invoiceNo && (
            <div className="rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">배송 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">택배사</span>
                  <span>{order.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">운송장번호</span>
                  <span className="font-mono">{order.invoiceNo}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl px-6 py-3"
            >
              다시 조회
            </button>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLoading ? "취소 중..." : "주문 취소"}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
