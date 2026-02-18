import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import type { ProductSummary } from "../types/Product";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const [q, setQ] = useState(query);
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  useEffect(() => {
    setQ(query);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    fetch(`/api/v1/products/search?q=${encodeURIComponent(query.trim())}`)
      .then((res) => {
        if (!res.ok) throw new Error("검색 실패");
        return res.json();
      })
      .then((data) => {
        setResults(data);
        setSearched(true);
      })
      .catch(() => {
        setResults([]);
        setSearched(true);
      })
      .finally(() => setLoading(false));
  }, [query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pt-4 pb-8">
      {/* 검색 입력 */}
      <form onSubmit={onSubmit} className="flex items-center border-b border-gray-400 pb-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="상품명, 카테고리, 색상 검색"
          className="flex-1 text-lg placeholder:text-gray-400 outline-none border-none bg-transparent"
          aria-label="검색어 입력"
        />
        <button
          type="submit"
          aria-label="검색"
          className="ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-black/5 active:scale-95 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <path d="M20 20l-3-3" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      {/* 결과 */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">검색 중...</div>
      ) : searched && results.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <div className="text-sm text-gray-500">
            "<span className="font-semibold text-gray-700">{query}</span>"에 대한
            검색 결과가 없습니다.
          </div>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="mt-4 mb-3 text-sm text-gray-500">
            검색 결과 <span className="font-semibold text-gray-700">{results.length}</span>건
          </div>
          <div className="grid grid-cols-2 gap-3">
            {results.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                {p.imageURL ? (
                  <img
                    src={p.imageURL}
                    alt={p.name}
                    className="aspect-[4/5] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full bg-gray-100" />
                )}
                <div className="p-3">
                  <div className="flex gap-1 text-[11px] text-gray-500">
                    <span>#{p.type}</span>
                    <span>#{p.tag}</span>
                  </div>
                  <div className="mt-1 line-clamp-1 text-sm font-medium group-hover:underline">
                    {p.name}
                  </div>
                  <div className="mt-1 text-sm font-semibold">
                    {fmt(p.buyPrice)}원
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        /* 초기 상태: 검색어 없음 */
        <div className="py-16 text-center text-sm text-gray-400">
          검색어를 입력해주세요
        </div>
      )}
    </div>
  );
}
