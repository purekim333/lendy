import React, { useEffect, useMemo, useState } from "react";
import { fetchWithAccess } from "../../util/fetchUtil";
import LoadingSpinner from "../../components/admin/LoadingSpinner";
import EmptyState from "../../components/admin/EmptyState";

type Metric = "qty" | "revenue";
type GroupBy = "product" | "variant";

type TopItem = {
  name: string;
  variant: string | null;
  qty: number;
  revenue: number;
  unitPrice: number;
};

type Summary = {
  totalQty: number;
  totalRevenue: number;
  from: string;
  to: string;
};

type ApiResp = {
  items: TopItem[];
  summary: Summary;
};

const presets = [
  { key: "7", label: "최근 7일", days: 7 },
  { key: "14", label: "최근 14일", days: 14 },
  { key: "30", label: "최근 30일", days: 30 },
  { key: "90", label: "최근 90일", days: 90 },
];

export default function AdminDashboard() {
  const [presetKey, setPresetKey] = useState("7");
  const [metric, setMetric] = useState<Metric>("qty");
  const [groupBy, setGroupBy] = useState<GroupBy>("product");
  const [topN, setTopN] = useState(10);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    const p = presets.find((p) => p.key === presetKey);
    if (!p) return;
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - p.days + 1);
    setFrom(toYmd(start));
    setTo(toYmd(end));
  }, [presetKey]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResp>({
    items: [],
    summary: { totalQty: 0, totalRevenue: 0, from: "", to: "" },
  });

  const fetchData = async () => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        from,
        to,
        metric,
        groupBy,
        limit: String(topN),
      }).toString();
      const res = await fetchWithAccess(`/api/v1/admin/dashboard/stats?${qs}`);
      if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
      const json: ApiResp = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, metric, groupBy, topN]);

  const maxVal = useMemo(() => {
    if (!data.items.length) return 0;
    return data.items.reduce(
      (m, v) => Math.max(m, metric === "qty" ? v.qty : v.revenue),
      0
    );
  }, [data.items, metric]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">대시보드</h2>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="총 판매수량" value={`${nf(data.summary.totalQty)} 개`} />
        <SummaryCard title="총 매출" value={krw(data.summary.totalRevenue)} />
        <SummaryCard title="기간 시작" value={from || "-"} />
        <SummaryCard title="기간 종료" value={to || "-"} />
      </div>

      {/* 필터 바 */}
      <div className="border rounded-2xl bg-white p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => setPresetKey(p.key)}
              className={`px-3 py-2 rounded-xl border text-sm ${
                presetKey === p.key ? "bg-black text-white" : "bg-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <select
            className="border rounded-xl px-3 py-2 text-sm"
            value={metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
          >
            <option value="qty">판매수량 기준</option>
            <option value="revenue">매출 기준</option>
          </select>
          <select
            className="border rounded-xl px-3 py-2 text-sm"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
          >
            <option value="product">상품 기준</option>
            <option value="variant">옵션(변형) 기준</option>
          </select>
          <select
            className="border rounded-xl px-3 py-2 text-sm"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 mt-2">
          <input
            type="date"
            className="border rounded-xl px-3 py-2 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            type="date"
            className="border rounded-xl px-3 py-2 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button
            className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50 transition-colors"
            onClick={fetchData}
            disabled={loading}
          >
            적용
          </button>
        </div>
      </div>

      {/* 랭킹 리스트 */}
      <section className="border rounded-2xl bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">기간별 판매 Rank</h3>
          <span className="text-sm text-gray-500">
            기준: <b>{metric === "qty" ? "수량" : "매출"}</b> · 그룹:{" "}
            <b>{groupBy === "product" ? "상품" : "옵션"}</b>
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="데이터를 불러오는 중..." />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
            <button
              onClick={fetchData}
              className="ml-3 underline hover:no-underline"
            >
              다시 시도
            </button>
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            title="데이터가 없습니다"
            description="해당 기간에 판매 내역이 없습니다."
          />
        ) : (
          <ol className="space-y-2">
            {data.items.map((it, i) => {
              const displayName = it.variant
                ? `${it.name} | ${it.variant}`
                : it.name;
              const value = metric === "qty" ? it.qty : it.revenue;
              const percent =
                maxVal > 0 ? Math.round((value / maxVal) * 100) : 0;
              return (
                <li
                  key={`${it.name}-${it.variant}-${i}`}
                  className="grid grid-cols-[28px_1fr_auto] items-center gap-3"
                >
                  <span className="text-right w-7 text-sm font-medium text-gray-500">
                    {i + 1}.
                  </span>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm" title={displayName}>
                        {displayName}
                      </span>
                      <span className="text-sm text-gray-700 tabular-nums whitespace-nowrap">
                        {metric === "qty" ? `${nf(it.qty)}개` : krw(it.revenue)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 flex items-center justify-between gap-2">
                      <span>단가 {krw(it.unitPrice)}</span>
                      <span>총매출 {krw(it.revenue)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 mt-1 overflow-hidden">
                      <div
                        className="h-full bg-black/80 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-14 text-right">
                    {percent}%
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

/* ---------- 보조 ---------- */
function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded-2xl bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const krw = (n: number) => n.toLocaleString("ko-KR") + "원";
const nf = (n: number) => n.toLocaleString("ko-KR");
