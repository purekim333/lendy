import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWithAccess } from "../../../util/fetchUtil";

/** ----- 타입/라벨 (쇼핑몰용) ----- */
type OrderStatus = "PAYMENT_PENDING" | "PAID" | "READY" | "SHIPPING" | "DELIVERED" | "CANCELLED";
type Carrier = "우체국" | "CJ대한통운" | "로젠" | "롯데";

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

type OrderRow = {
  /** 주문 ID (공통) */
  orderId: string;
  /** 라인(접수건) ID — orderId-01, -02 처럼 유니크 */
  lineId: string;
  userName: string;
  productName: string;
  variant: string;  // 예: Light Blue / FREE
  qty: number;
  unitPrice: number;  // 단가
  amount: number;     // qty * unitPrice
  createdAt: string;
  status: OrderStatus;
  carrier?: Carrier;
  invoiceNo?: string;
};

/** Backend API response types */
type OrderItem = {
  productName: string;
  optionDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type BackendOrder = {
  id: number;
  orderCode: string;
  buyerName: string;
  buyerPhone: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  carrier: string | null;
  invoiceNo: string | null;
  items: OrderItem[];
};

type PageResponse = {
  content: BackendOrder[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

/** ----- 유틸 ----- */
type SortKey = keyof Pick<OrderRow, "orderId" | "lineId" | "userName" | "productName" | "createdAt" | "amount" | "status">;
const formatKRW = (n: number) => n.toLocaleString("ko-KR") + "원";
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0");
  const hh = String(d.getHours()).padStart(2,"0"); const mm = String(d.getMinutes()).padStart(2,"0");
  return `${y}.${m}.${day} ${hh}:${mm}`;
};

/** ===== 메인 컴포넌트 ===== */
export default function AdminOrders() {
  // 데이터는 편집 반영을 위해 state에 저장
  const [data, setData] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색/정렬/페이지
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [recentDays, setRecentDays] = useState<number>(30);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set()); // lineId 집합

  // 행별 송장 인라인 편집
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editCarrier, setEditCarrier] = useState<Carrier>("우체국");
  const [editInvoice, setEditInvoice] = useState("");

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = "";
      const url = `${baseUrl}/api/v1/admin/orders?page=0&size=1000&sort=createdAt,desc`;

      const response = await fetchWithAccess(url);
      const pageData: PageResponse = await response.json();

      // Map backend orders to OrderRow format
      const rows: OrderRow[] = [];
      pageData.content.forEach((order) => {
        order.items.forEach((item, index) => {
          rows.push({
            orderId: order.orderCode,
            lineId: `${order.orderCode}-${index + 1}`,
            userName: order.buyerName,
            productName: item.productName,
            variant: item.optionDescription,
            qty: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.totalPrice,
            createdAt: order.createdAt,
            status: order.status,
            carrier: order.carrier as Carrier | undefined,
            invoiceNo: order.invoiceNo ?? undefined,
          });
        });
      });

      setData(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, []);

  // 필터/정렬
  const filtered = useMemo(() => {
    const since = new Date(); since.setDate(since.getDate() - recentDays);
    return data
      .filter((r) => (status === "ALL" ? true : r.status === status))
      .filter((r) => new Date(r.createdAt) >= since)
      .filter((r) => {
        const q = query.trim().toLowerCase(); if (!q) return true;
        return (
          r.orderId.toLowerCase().includes(q) ||
          r.lineId.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const av = a[sortKey] as any; const bv = b[sortKey] as any;
        let cmp = 0;
        if (sortKey === "amount") cmp = Number(av) - Number(bv);
        else if (sortKey === "createdAt") cmp = new Date(String(av)).getTime() - new Date(String(bv)).getTime();
        else cmp = String(av).localeCompare(String(bv), "ko");
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [data, query, status, recentDays, sortKey, sortDir]);

  // 페이지
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // 선택/정렬
  const toggleAll = (checked: boolean) => checked ? setSelected(new Set(current.map(r => r.lineId))) : setSelected(new Set());
  const toggleOne = (lineId: string) => setSelected(prev => { const n = new Set(prev); n.has(lineId) ? n.delete(lineId) : n.add(lineId); return n; });
  const changeSort = (key: SortKey) => sortKey === key ? setSortDir(d => d === "asc" ? "desc" : "asc") : (setSortKey(key), setSortDir("asc"));

  // 일괄 처리(참고: 송장은 행별 입력이므로 bulk에 포함하지 않음)
  const bulk = async (action: "markPaid" | "markReady" | "markDelivered" | "cancel") => {
    if (!selected.size) return alert("선택된 접수건이 없습니다.");

    const baseUrl = "";
    const selectedRows = data.filter(r => selected.has(r.lineId));
    const orderCodes = new Set(selectedRows.map(r => r.orderId));

    try {
      setLoading(true);

      for (const orderCode of orderCodes) {
        let endpoint = "";
        if (action === "markReady") endpoint = `/api/v1/admin/orders/${orderCode}/ready`;
        else if (action === "markDelivered") endpoint = `/api/v1/admin/orders/${orderCode}/deliver`;
        else if (action === "cancel") endpoint = `/api/v1/admin/orders/${orderCode}/cancel`;
        else continue; // markPaid not implemented in backend yet

        if (endpoint) {
          await fetchWithAccess(`${baseUrl}${endpoint}`, { method: "POST" });
        }
      }

      setSelected(new Set());
      await fetchOrders(); // Refetch after bulk action
    } catch (err) {
      alert(`일괄 처리 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  // 송장 인라인 편집
  const openInvoiceEdit = (row: OrderRow) => {
    setEditingLineId(row.lineId);
    setEditCarrier(row.carrier ?? "우체국");
    setEditInvoice(row.invoiceNo ?? "");
  };
  const cancelInvoiceEdit = () => { setEditingLineId(null); setEditInvoice(""); };
  const saveInvoice = async () => {
    if (!editingLineId) return;
    if (!editInvoice.trim()) return alert("송장번호를 입력하세요.");

    const row = data.find(r => r.lineId === editingLineId);
    if (!row) return;

    const baseUrl = "";

    try {
      setLoading(true);

      await fetchWithAccess(`${baseUrl}/api/v1/admin/orders/${row.orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: editCarrier,
          invoiceNo: editInvoice,
        }),
      });

      setEditingLineId(null);
      setEditInvoice("");
      await fetchOrders(); // Refetch after invoice save
    } catch (err) {
      alert(`송장 등록 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  // 우측: 주문량 Top10 (최근 N일)
  const ranking = useMemo(() => {
    const m = new Map<string, number>();
    filtered.forEach(r => {
      const key = `${r.productName} | ${r.variant}`;
      m.set(key, (m.get(key) || 0) + r.qty);
    });
    return Array.from(m.entries()).sort((a,b)=>b[1]-a[1]).slice(0,10);
  }, [filtered]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">주문 관리</h2>
        <Link to="/admin" className="text-sm underline underline-offset-4 hover:opacity-80">대시보드</Link>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="border rounded-2xl bg-white p-6 text-center text-gray-500">
          주문 데이터를 불러오는 중...
        </div>
      )}
      {error && (
        <div className="border rounded-2xl bg-rose-50 border-rose-200 p-6 text-center text-rose-700">
          오류: {error}
        </div>
      )}

      {/* 상단 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3">
        <input
          className="border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
          placeholder="주문ID/접수건ID/이름/상품명 검색"
          value={query}
          onChange={(e)=>{ setQuery(e.target.value); setPage(1); }}
        />
        <select className="border rounded-xl px-3 py-2" value={status} onChange={(e)=>{ setStatus(e.target.value as any); setPage(1); }}>
          <option value="ALL">상태 전체</option>
          {Object.keys(STATUS_LABEL).map(k => <option key={k} value={k}>{STATUS_LABEL[k as OrderStatus]}</option>)}
        </select>
        <select className="border rounded-xl px-3 py-2" value={recentDays} onChange={(e)=>{ setRecentDays(Number(e.target.value)); setPage(1); }}>
          <option value={7}>최근 7일</option><option value={14}>최근 14일</option><option value={30}>최근 30일</option><option value={90}>최근 90일</option>
        </select>
        <select className="border rounded-xl px-3 py-2" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
          <option value={10}>10개씩</option><option value={20}>20개씩</option><option value={50}>50개씩</option>
        </select>
      </div>

      {/* 메인 2컬럼 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* 왼쪽: 테이블/액션 */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 rounded-xl border hover:bg-black/5" onClick={()=>bulk("markPaid")}>결제확인</button>
            <button className="px-3 py-2 rounded-xl border hover:bg-black/5" onClick={()=>bulk("markReady")}>출고대기</button>
            <button className="px-3 py-2 rounded-xl border hover:bg-black/5" onClick={()=>bulk("markDelivered")}>배송완료</button>
            <button className="px-3 py-2 rounded-xl border hover:bg-black/5" onClick={()=>bulk("cancel")}>취소</button>
            <span className="text-sm text-gray-500 ml-auto">{filtered.length}건</span>
          </div>

          <div className="border rounded-2xl bg-white overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 w-10">
                    <input type="checkbox"
                      checked={current.length>0 && current.every(r=>selected.has(r.lineId))}
                      onChange={(e)=>toggleAll(e.target.checked)} />
                  </th>
                  <Th label="주문ID" k="orderId" sortKey={sortKey} sortDir={sortDir} onSort={changeSort}/>
                  <Th label="접수건ID" k="lineId" sortKey={sortKey} sortDir={sortDir} onSort={changeSort}/>
                  <Th label="고객" k="userName" sortKey={sortKey} sortDir={sortDir} onSort={changeSort}/>
                  <Th label="상품" k="productName" sortKey={sortKey} sortDir={sortDir} onSort={changeSort}/>
                  <th className="p-3 text-left">옵션</th>
                  <th className="p-3 text-right">수량</th>
                  <Th label="금액" k="amount" align="right" sortKey={sortKey} sortDir={sortDir} onSort={changeSort}/>
                  <Th label="주문일" k="createdAt" sortKey={sortKey} sortDir={sortDir} onSort={changeSort}/>
                  <Th label="상태" k="status" sortKey={sortKey} sortDir={sortDir} onSort={changeSort}/>
                  <th className="p-3 text-right w-44">송장/액션</th>
                </tr>
              </thead>
              <tbody>
                {current.map((r)=>(
                  <React.Fragment key={r.lineId}>
                    <tr className="border-b last:border-0">
                      <td className="p-3"><input type="checkbox" checked={selected.has(r.lineId)} onChange={()=>toggleOne(r.lineId)} /></td>
                      <td className="p-3 font-medium">{r.orderId}</td>
                      <td className="p-3">{r.lineId}</td>
                      <td className="p-3">{r.userName}</td>
                      <td className="p-3">{r.productName}</td>
                      <td className="p-3 text-gray-500">{r.variant}</td>
                      <td className="p-3 text-right">{r.qty}</td>
                      <td className="p-3 text-right">{formatKRW(r.amount)}</td>
                      <td className="p-3">{formatDate(r.createdAt)}</td>
                      <td className="p-3">
                        <span className={`inline-block border text-xs px-2 py-1 rounded-lg ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.invoiceNo ? (
                            <span className="text-xs text-gray-600">{r.carrier} {r.invoiceNo}</span>
                          ) : (
                            <span className="text-xs text-gray-400">미등록</span>
                          )}
                          <button className="text-blue-600 hover:underline text-xs" onClick={() => openInvoiceEdit(r)}>송장</button>
                        </div>
                      </td>
                    </tr>

                    {/* 인라인 송장 편집영역 */}
                    {editingLineId === r.lineId && (
                      <tr className="bg-gray-50/70 border-b last:border-0">
                        <td className="p-3" />
                        <td className="p-3" colSpan={10}>
                          <div className="flex flex-wrap items-center gap-2">
                            <select className="border rounded-xl px-3 py-2" value={editCarrier} onChange={(e)=>setEditCarrier(e.target.value as Carrier)}>
                              <option>우체국</option><option>CJ대한통운</option><option>로젠</option><option>롯데</option>
                            </select>
                            <input className="border rounded-xl px-3 py-2 w-56" placeholder="송장번호 입력" value={editInvoice} onChange={(e)=>setEditInvoice(e.target.value)} />
                            <button className="px-3 py-2 rounded-xl border bg-white hover:bg-black/5" onClick={saveInvoice}>저장</button>
                            <button className="px-3 py-2 rounded-xl border bg-white hover:bg-black/5" onClick={cancelInvoiceEdit}>취소</button>
                            <span className="text-xs text-gray-500">이 편집은 이 접수건({r.lineId})에만 적용</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {current.length===0 && <tr><td className="p-6 text-center text-gray-500" colSpan={11}>조건에 맞는 주문이 없습니다.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">페이지 {page}/{pageCount}</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-xl border disabled:opacity-40" onClick={()=>setPage(1)} disabled={page===1}>« 처음</button>
              <button className="px-3 py-2 rounded-xl border disabled:opacity-40" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹ 이전</button>
              <button className="px-3 py-2 rounded-xl border disabled:opacity-40" onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page===pageCount}>다음 ›</button>
              <button className="px-3 py-2 rounded-xl border disabled:opacity-40" onClick={()=>setPage(pageCount)} disabled={page===pageCount}>마지막 »</button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 주문량 순위(옵션 기준) */}
        <aside className="space-y-4">
          <div className="border rounded-2xl bg-white p-4">
            <h3 className="font-semibold mb-3">주문량 순위 (최근 {recentDays}일)</h3>
            <ol className="space-y-2 text-sm">
              {ranking.map(([k,count], idx)=>(
                <li key={k} className="flex items-center gap-2">
                  <span className="w-6 text-right">{idx+1}.</span>
                  <span className="flex-1 truncate" title={k}>{k}</span>
                  <span className="text-gray-500">{count}개</span>
                </li>
              ))}
              {ranking.length===0 && <p className="text-gray-500">데이터 없음</p>}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** ----- 테이블 헤더(정렬) ----- */
function Th({ label, k, align="left", sortKey, sortDir, onSort }:{
  label:string; k:SortKey; align?:"left"|"right";
  sortKey:SortKey; sortDir:"asc"|"desc"; onSort:(k:SortKey)=>void;
}) {
  const active = sortKey === k;
  return (
    <th className={`p-3 text-${align} select-none`}>
      <button className="inline-flex items-center gap-1 hover:underline" onClick={()=>onSort(k)} title="정렬">
        {label} <span className={active ? "opacity-80" : "opacity-30"}>{active ? (sortDir==="asc"?"↑":"↓") : "↕"}</span>
      </button>
    </th>
  );
}
