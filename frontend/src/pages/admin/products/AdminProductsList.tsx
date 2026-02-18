import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../../../util/fetchUtil";
import Toast from "../../../components/admin/Toast";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import LoadingSpinner from "../../../components/admin/LoadingSpinner";
import EmptyState from "../../../components/admin/EmptyState";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type AdminProduct = {
  id: number;
  productName: string;
  type: string;
  tag: string;
  color: string;
  buyPrice: number;
  rentalPrice: number;
  isPublished: boolean;
  mainImageUrl: string | null;
  optionCount: number;
  createdAt: string;
};

type PageResponse = {
  content: AdminProduct[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const formatKRW = (n: number) => n.toLocaleString("ko-KR") + "원";
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

export default function AdminProductsList() {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/v1/admin/products?page=0&size=1000`;
      const response = await fetchWithAccess(url);
      const pageData: PageResponse = await response.json();
      setData(pageData.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "상품 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((p) => p.productName.toLowerCase().includes(q));
  }, [data, query]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const togglePublish = async (id: number) => {
    try {
      await fetchWithAccess(`/api/v1/admin/products/${id}/publish`, { method: "PUT" });
      setToast({ type: "success", message: "게시 상태가 변경되었습니다." });
      await fetchProducts();
    } catch (err) {
      setToast({ type: "error", message: `게시 상태 변경 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}` });
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await fetchWithAccess(`/api/v1/admin/products/${id}`, { method: "DELETE" });
      setToast({ type: "success", message: "상품이 삭제되었습니다." });
      await fetchProducts();
    } catch (err) {
      setToast({ type: "error", message: `삭제 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}` });
    }
  };

  return (
    <div className="space-y-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          open
          title={confirm.title}
          message={confirm.message}
          variant="danger"
          confirmText="삭제"
          onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">상품 목록</h2>
        <Link to="/admin/products/new" className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 transition-opacity">
          + 상품 등록
        </Link>
      </div>

      {loading && !data.length && <LoadingSpinner message="상품 데이터를 불러오는 중..." />}
      {error && (
        <div className="border rounded-2xl bg-rose-50 border-rose-200 p-4 text-sm text-rose-700">
          {error}
          <button onClick={fetchProducts} className="ml-3 underline hover:no-underline">다시 시도</button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="상품명 검색"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <span className="text-sm text-gray-500">{filtered.length}개</span>
      </div>

      <div className="border rounded-2xl bg-white overflow-x-auto">
        <table className="min-w-full w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left w-16">이미지</th>
              <th className="p-3 text-left">상품명</th>
              <th className="p-3 text-left">카테고리</th>
              <th className="p-3 text-right">구매가</th>
              <th className="p-3 text-right">대여가</th>
              <th className="p-3 text-center">옵션수</th>
              <th className="p-3 text-center">게시상태</th>
              <th className="p-3 text-left">등록일</th>
              <th className="p-3 text-right w-40">액션</th>
            </tr>
          </thead>
          <tbody>
            {current.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="p-3">
                  {p.mainImageUrl ? (
                    <img src={p.mainImageUrl} alt={p.productName} className="w-12 h-12 object-cover rounded-lg" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{p.productName}</td>
                <td className="p-3 text-gray-600">{p.type}</td>
                <td className="p-3 text-right tabular-nums">{formatKRW(p.buyPrice)}</td>
                <td className="p-3 text-right tabular-nums">{formatKRW(p.rentalPrice)}</td>
                <td className="p-3 text-center text-gray-500">{p.optionCount}</td>
                <td className="p-3 text-center">
                  <span className={`inline-block text-xs px-2 py-1 rounded-lg border ${
                    p.isPublished
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {p.isPublished ? "게시중" : "미게시"}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{formatDate(p.createdAt)}</td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      title="수정"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => togglePublish(p.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                      title={p.isPublished ? "미게시로 변경" : "게시로 변경"}
                    >
                      {p.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() =>
                        setConfirm({
                          title: "상품 삭제",
                          message: `"${p.productName}" 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
                          onConfirm: () => deleteProduct(p.id),
                        })
                      }
                      className="p-1.5 rounded-lg hover:bg-red-50 text-rose-600 transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && current.length === 0 && (
              <tr>
                <td className="p-6" colSpan={9}>
                  <EmptyState
                    title="상품이 없습니다"
                    description={query ? "검색 조건에 맞는 상품이 없습니다." : "등록된 상품이 없습니다."}
                    actionLabel="상품 등록하기"
                    onAction={() => navigate("/admin/products/new")}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">페이지 {page}/{pageCount}</div>
          <div className="flex items-center gap-1">
            <PagBtn onClick={() => setPage(1)} disabled={page === 1}>« 처음</PagBtn>
            <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ 이전</PagBtn>
            <PagBtn onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>다음 ›</PagBtn>
            <PagBtn onClick={() => setPage(pageCount)} disabled={page === pageCount}>마지막 »</PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PagBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="px-3 py-1.5 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors" {...props}>
      {children}
    </button>
  );
}
