import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders, MyOrderSummary } from "../services/orderService";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PAYMENT_PENDING: { label: "결제대기", color: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "결제완료", color: "bg-blue-100 text-blue-700" },
  READY: { label: "배송준비", color: "bg-purple-100 text-purple-700" },
  SHIPPING: { label: "배송중", color: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "배송완료", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "취소", color: "bg-red-100 text-red-700" },
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<MyOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "주문 내역을 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-8">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">주문 내역 조회 중...</div>
          <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-8">
        <div className="text-center">
          <div className="mb-6 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold">오류</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-2xl bg-gray-200 px-6 py-3 font-semibold hover:bg-gray-300"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mb-4 text-5xl">📦</div>
          <p className="mb-2 text-lg font-semibold">주문 내역이 없습니다</p>
          <p className="mb-6 text-sm text-gray-500">
            첫 주문을 시작해보세요!
          </p>
          <button
            onClick={() => navigate("/products")}
            className="rounded-2xl bg-emerald-300 px-6 py-3 font-semibold hover:bg-emerald-400"
          >
            상품 둘러보기
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || {
              label: order.status,
              color: "bg-gray-100 text-gray-700",
            };

            return (
              <li
                key={order.orderCode}
                onClick={() => navigate(`/my-orders/${order.orderCode}`)}
                className="cursor-pointer rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-1 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="text-sm font-semibold">
                      {order.firstItemName}
                      {order.itemCount > 1 && ` 외 ${order.itemCount - 1}건`}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {order.firstItemImageUrl && (
                    <img
                      src={order.firstItemImageUrl}
                      alt=""
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="ml-auto text-right">
                    <div className="text-sm font-bold">
                      {fmt(order.totalAmount)}원
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {order.orderCode}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
