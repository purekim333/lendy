import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyOrderDetail, cancelMyOrder, OrderDetail } from "../services/orderService";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PAYMENT_PENDING: { label: "결제대기", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "결제완료", color: "bg-blue-100 text-blue-700" },
  READY: { label: "배송준비", color: "bg-purple-100 text-purple-700" },
  SHIPPING: { label: "배송중", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "배송완료", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "취소", color: "bg-red-100 text-red-700" },
};

export default function MyOrderDetailPage() {
  const navigate = useNavigate();
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  useEffect(() => {
    if (!orderCode) {
      navigate("/my-orders");
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const data = await getMyOrderDetail(orderCode);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "주문 상세 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderCode, navigate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canCancel = order?.status === "PAYMENT_PENDING" || order?.status === "PAID";
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!order || !orderCode) return;
    if (!confirm("정말 주문을 취소하시겠습니까?")) return;

    setCancelling(true);
    try {
      await cancelMyOrder(orderCode);
      alert("주문이 취소되었습니다.");
      // 상태 새로고침
      const updated = await getMyOrderDetail(orderCode);
      setOrder(updated);
    } catch (err: any) {
      alert(err.message || "주문 취소에 실패했습니다.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-8">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">주문 상세 조회 중...</div>
          <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-8">
        <div className="text-center">
          <div className="mb-6 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold">오류</h1>
          <p className="mb-6 text-gray-600">{error || "주문 정보를 찾을 수 없습니다."}</p>
          <button
            onClick={() => navigate("/my-orders")}
            className="rounded-2xl bg-gray-200 px-6 py-3 font-semibold hover:bg-gray-300"
          >
            주문 목록으로
          </button>
        </div>
      </main>
    );
  }

  const status = STATUS_MAP[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/my-orders")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <span>←</span>
          <span>주문 목록</span>
        </button>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      <h1 className="mb-6 text-xl font-bold">주문 상세</h1>

      {/* Order Info */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">주문 정보</h2>
        <div className="space-y-2 rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">주문번호</span>
            <span className="font-mono font-semibold">{order.orderCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">주문일시</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">최종 수정일</span>
            <span>{formatDate(order.updatedAt)}</span>
          </div>
        </div>
      </section>

      {/* Order Items */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">주문 상품</h2>
        <ul className="space-y-2">
          {order.items.map((item, idx) => (
            <li
              key={idx}
              className="flex gap-3 rounded-2xl border border-gray-100 p-3"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{item.productName}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {item.optionDescription} · 수량 {item.quantity}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {fmt(item.unitPrice)}원 × {item.quantity}
                  </span>
                  <span className="text-sm font-semibold">
                    {fmt(item.totalPrice)}원
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Payment Summary */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">결제 금액</h2>
        <div className="space-y-2 rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">상품 금액</span>
            <span>{fmt(order.subtotalAmount)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">배송비</span>
            <span>{fmt(order.shippingFee)}원</span>
          </div>
          <div className="border-t border-gray-200 pt-2" />
          <div className="flex justify-between text-base font-bold">
            <span>총 결제 금액</span>
            <span className="text-emerald-600">{fmt(order.totalAmount)}원</span>
          </div>
        </div>
      </section>

      {/* Buyer Info */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">주문자 정보</h2>
        <div className="space-y-2 rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">이름</span>
            <span>{order.buyerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">연락처</span>
            <span>{order.buyerPhone}</span>
          </div>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">배송 정보</h2>
        <div className="space-y-2 rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">받는 분</span>
            <span>{order.receiverName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">연락처</span>
            <span>{order.receiverPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">우편번호</span>
            <span>{order.zipCode}</span>
          </div>
          <div>
            <div className="mb-1 text-gray-500">주소</div>
            <div className="text-right">
              {order.address1}
              {order.address2 && (
                <>
                  <br />
                  {order.address2}
                </>
              )}
            </div>
          </div>
          {order.deliveryMessage && (
            <div className="flex justify-between">
              <span className="text-gray-500">배송 메시지</span>
              <span>{order.deliveryMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* Tracking Info */}
      {(order.carrier || order.invoiceNo) && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">배송 추적</h2>
          <div className="space-y-2 rounded-2xl border border-gray-100 p-4 text-sm">
            {order.carrier && (
              <div className="flex justify-between">
                <span className="text-gray-500">택배사</span>
                <span>{order.carrier}</span>
              </div>
            )}
            {order.invoiceNo && (
              <div className="flex justify-between">
                <span className="text-gray-500">운송장번호</span>
                <span className="font-mono font-semibold">{order.invoiceNo}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Action Buttons */}
      {canCancel && (
        <section className="mb-6">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full rounded-2xl border border-red-300 bg-red-50 py-3 font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            {cancelling ? "취소 처리 중..." : "주문 취소"}
          </button>
        </section>
      )}
    </main>
  );
}
