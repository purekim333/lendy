import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../types/Cart";
import { getCart, setCart } from "../utils/cartStorage";

type Tab = "ALL" | "SELECTED";

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<Tab>("ALL");

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  const allCount = items.length;
  const selected = useMemo(() => items.filter((i) => i.checked), [items]);
  const selectedCount = selected.length;
  const selectedTotal = selected.reduce((s, i) => s + i.price * i.qty, 0);

  const FREE_SHIP_TH = 40000; // 4만원 이상 무료배송
  const freeShipProgress = Math.min(1, selectedTotal / FREE_SHIP_TH);

  const view = tab === "ALL" ? items : selected;

  useEffect(() => setItems(getCart()), []);
  // useEffect(() => setCart(items), [items]); // 변경 시 로컬스토리지 동기화

  useEffect(() => {
    const onFocus = () => setItems(getCart());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  function applyAndSave(updater: (prev: CartItem[]) => CartItem[]) {
    setItems(prev => {
      const next = updater(prev);
      setCart(next);
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setItems((prev) => prev.map((it) => ({ ...it, checked })));
  }
  function toggleOne(key: string) {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, checked: !it.checked } : it)),
    );
  }
  function incQty(key: string) {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, qty: it.qty + 1 } : it)),
    );
  }
  function decQty(key: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.key === key ? { ...it, qty: Math.max(1, it.qty - 1) } : it,
      ),
    );
  }
  function removeOne(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  const allChecked = allCount > 0 && items.every((i) => i.checked);

  return (
    <main className="relative mx-auto w-full max-w-[480px] bg-white px-4 pb-32 pt-4">
      {/* 상단 안내 */}
      <h1 className="text-lg font-semibold">
        <span className="text-emerald-500">다인</span>님, 결제 준비 아이템{" "}
        <strong>{allCount}</strong>건이 있어요
      </h1>

      {/* 탭 + 전체선택 */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => setTab("ALL")}
            className={tab === "ALL" ? "font-semibold" : "text-gray-500"}
          >
            전상품({allCount})
          </button>
          <button
            onClick={() => setTab("SELECTED")}
            className={tab === "SELECTED" ? "font-semibold" : "text-gray-500"}
          >
            선택상품({selectedCount})
          </button>
        </div>

        {/* 전체선택 토글 */}
        <button
          onClick={() => toggleAll(!allChecked)}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm"
        >
          <span
            className={`grid h-4 w-4 place-items-center rounded-full border ${
              allChecked ? "bg-emerald-400 border-emerald-400" : "border-gray-300"
            }`}
          >
            {allChecked ? "✓" : ""}
          </span>
          전체선택
        </button>
      </div>

      {/* 무료배송 프로그레스 (선택상품 기준) */}
      <div className="mt-3">
        <div className="mb-1 text-xs text-gray-500">4만원 이상 무료 배송 &gt;</div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-emerald-400 transition-[width]"
            style={{ width: `${freeShipProgress * 100}%` }}
          />
        </div>
      </div>

      {/* 리스트 */}
      <section className="mt-4">
        {view.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">
            {tab === "ALL" ? "장바구니가 비어 있어요." : "선택된 상품이 없어요."}
          </div>
        ) : (
          <ul className="space-y-3">
            {view.map((it) => (
              <li
                key={it.key}
                className="flex gap-3 rounded-2xl border border-gray-100 p-3"
              >
                {/* 체크 */}
                <button
                  onClick={() => toggleOne(it.key)}
                  className={`mt-2 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                    it.checked
                      ? "bg-emerald-400 border-emerald-400 text-white"
                      : "border-gray-300 text-transparent"
                  }`}
                  aria-label="선택"
                  title="선택"
                >
                  ✓
                </button>

                {/* 썸네일 */}
                <img
                  src={it.img}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />

                {/* 정보 */}
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-medium">
                    {it.name}
                  </div>
                  {/* 의류 대여 문구 제거 요청 반영 */}
                  <div className="mt-1 text-xs text-gray-500">
                    사이즈 {it.size}　·　색상 {it.color}
                  </div>

                  {/* 수량 조절 */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md border px-2 leading-none"
                        onClick={() => decQty(it.key)}
                        aria-label="수량 감소"
                      >
                        –
                      </button>
                      <span className="w-6 text-center text-sm">{it.qty}</span>
                      <button
                        className="rounded-md border px-2 leading-none"
                        onClick={() => incQty(it.key)}
                        aria-label="수량 증가"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-sm font-semibold">
                      {fmt(it.price * it.qty)}원
                    </div>
                  </div>
                </div>

                {/* 삭제 */}
                <button
                  onClick={() => removeOne(it.key)}
                  className="mt-1 grid h-8 w-8 place-items-center rounded-full border border-gray-200 text-gray-500"
                  aria-label="삭제"
                  title="삭제"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 하단 스티키 합계 영역 */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="mx-auto w-full max-w-[480px]">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-gray-500">총 구매금액</div>
              <div className="text-xl font-bold">
                {fmt(selectedTotal)}원
              </div>
              {/* 선택상품 리스트(요약) */}
              {selectedCount > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  {selected.slice(0, 2).map((s) => s.name).join(", ")}
                  {selectedCount > 2 ? ` 외 ${selectedCount - 2}건` : ""}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/payment")}
              disabled={selectedCount === 0}
              className={`min-w-[160px] rounded-2xl px-6 py-3 text-center text-gray-900 ${
                selectedCount === 0
                  ? "bg-emerald-200/60 opacity-60"
                  : "bg-emerald-300/90 hover:bg-emerald-300"
              }`}
            >
              구매 신청
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
