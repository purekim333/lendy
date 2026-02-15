import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWithAccess } from "../../../util/fetchUtil";

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
  const [data, setData] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = "";
      const url = `${baseUrl}/api/v1/admin/products?page=0&size=1000`;

      const response = await fetchWithAccess(url);
      const pageData: PageResponse = await response.json();

      setData(pageData.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      console.error("Failed to fetch products:", err);
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
      setLoading(true);
      const baseUrl = "";
      await fetchWithAccess(`${baseUrl}/api/v1/admin/products/${id}/publish`, {
        method: "PUT",
      });
      await fetchProducts();
    } catch (err) {
      alert(`게시 상태 변경 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number, name: string) => {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;

    try {
      setLoading(true);
      const baseUrl = "";
      await fetchWithAccess(`${baseUrl}/api/v1/admin/products/${id}`, {
        method: "DELETE",
      });
      await fetchProducts();
    } catch (err) {
      alert(`삭제 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">상품 목록</h2>
        <Link to="/admin/products/new" className="px-3 py-2 rounded-xl bg-black text-white">
          상품 등록
        </Link>
      </div>

      {loading && (
        <div className="border rounded-2xl bg-white p-6 text-center text-gray-500">
          상품 데이터를 불러오는 중...
        </div>
      )}
      {error && (
        <div className="border rounded-2xl bg-rose-50 border-rose-200 p-6 text-center text-rose-700">
          오류: {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
          placeholder="상품명 검색"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <span className="text-sm text-gray-500">{filtered.length}개</span>
      </div>

      <div className="border rounded-2xl bg-white overflow-x-auto">
        <table className="min-w-full w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left w-20">이미지</th>
              <th className="p-3 text-left">상품명</th>
              <th className="p-3 text-left">카테고리</th>
              <th className="p-3 text-right">구매가</th>
              <th className="p-3 text-right">대여가</th>
              <th className="p-3 text-center">옵션수</th>
              <th className="p-3 text-center">게시상태</th>
              <th className="p-3 text-left">등록일</th>
              <th className="p-3 text-right w-32">액션</th>
            </tr>
          </thead>
          <tbody>
            {current.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">
                  {p.mainImageUrl ? (
                    <img
                      src={p.mainImageUrl}
                      alt={p.productName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </td>
                <td className="p-3 font-medium">{p.productName}</td>
                <td className="p-3 text-gray-600">{p.type}</td>
                <td className="p-3 text-right">{formatKRW(p.buyPrice)}</td>
                <td className="p-3 text-right">{formatKRW(p.rentalPrice)}</td>
                <td className="p-3 text-center text-gray-500">{p.optionCount}</td>
                <td className="p-3 text-center">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-lg border ${
                      p.isPublished
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {p.isPublished ? "게시중" : "미게시"}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{formatDate(p.createdAt)}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() => togglePublish(p.id)}
                    >
                      {p.isPublished ? "미게시" : "게시"}
                    </button>
                    <button
                      className="text-rose-600 hover:underline text-xs"
                      onClick={() => deleteProduct(p.id, p.productName)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {current.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={9}>
                  조건에 맞는 상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          페이지 {page}/{pageCount}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl border disabled:opacity-40"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            « 처음
          </button>
          <button
            className="px-3 py-2 rounded-xl border disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹ 이전
          </button>
          <button
            className="px-3 py-2 rounded-xl border disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
          >
            다음 ›
          </button>
          <button
            className="px-3 py-2 rounded-xl border disabled:opacity-40"
            onClick={() => setPage(pageCount)}
            disabled={page === pageCount}
          >
            마지막 »
          </button>
        </div>
      </div>
    </div>
  );
}