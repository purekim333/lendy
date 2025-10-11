// src/pages/ProductDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SAMPLE_PRODUCTS } from "../data/Products";     
import type { Product } from "../types/Product";       
import { addToCart } from "../utils/cartStorage";
import CartToast from "../components/CartToast";

// 더미 리뷰 데이터
type Review = {
  id: string;
  user: string;
  rating: number;
  date: string;
  size: string;
  color: string;
  tags: string[];
  text: string;
  image?: string;
};

const MOCK_REVIEWS: Review[] = [
  { id: "r1", user: "정다인", rating: 4, date: "2024.06.19 ~ 2024.06.22 (3일)", size: "M", color: "Black", tags: ["Top"], text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque malesuada eget vitae amet...", image: "/assets/sample/rev1.png" },
  { id: "r2", user: "정다인", rating: 4, date: "2024.06.19 ~ 2024.06.22 (3일)", size: "M", color: "White", tags: ["Top"], text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque malesuada eget vitae amet..." },
  { id: "r3", user: "정다인", rating: 4, date: "2024.06.19 ~ 2024.06.22 (3일)", size: "M", color: "Black", tags: ["Top"], text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque malesuada eget vitae amet..." },
];

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);

  function handleAddToCart() {                          
      if (!product) return;
      addToCart({
        productId: product.id,
        name: product.name,
        img: images[0] ?? product.img,
        price: product.price,
        size,
        color,
        qty,
      });
      setToastOpen(true);
    }

  const product = useMemo<Product | undefined>(
    () => SAMPLE_PRODUCTS.find(p => p.id === productId),
    [productId]
  );

  const [mainIdx, setMainIdx] = useState(0);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("White");
  const [qty, setQty] = useState(1);
  const PAGE = 3;
  const [reviewPage, setReviewPage] = useState(1);

  // 이미지 배열(상품 없을 땐 빈 배열)
  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [product.img];
  }, [product]);

  // 이미지 배열이 바뀌면 인덱스 범위 보정
  useEffect(() => {
    if (images.length && mainIdx >= images.length) setMainIdx(0);
  }, [images.length, mainIdx]);

  const visibleReviews = useMemo(
    () => MOCK_REVIEWS.slice(0, PAGE * reviewPage),
    [reviewPage]
  );
  const hasMoreReviews = visibleReviews.length < MOCK_REVIEWS.length;
  const fmt = (n: number) => n.toLocaleString("ko-KR");

  return (
    <main className="relative mx-auto max-w-[480px] px-4 pb-28 pt-4 md:max-w-screen-md md:pb-12">
      <button
        type="button"
        aria-label="뒤로가기"
        onClick={() => navigate(-1)}
        className="
          absolute left-2
          top-[calc(env(safe-area-inset-top,0px)+8px)]
          z-20 grid h-9 w-9 place-items-center
          rounded-full bg-white/80 backdrop-blur shadow
          hover:bg-white active:scale-95 transition
        "
      >
        <span className="text-lg leading-none">{'<'}</span>
      </button>
     
      {/* 한 곳에서 조건부 렌더링 */}
      {!product ? (
        <div className="py-24 text-center text-gray-600">상품을 찾을 수 없습니다.</div>
      ) : (
        <>
          {/* 메인이미지 & 썸네일 & 상품요약/옵션/구매 */}
          <section>
            {/* 메인 이미지 */}
            <div className="overflow-hidden rounded-[24px] bg-gray-100">
              <img
                src={images[mainIdx]}
                alt={`${product.name} 이미지 ${mainIdx + 1}`}
                className="w-full object-cover"
                style={{ aspectRatio: "4 / 5" }}
              />
            </div>

            {/* 작은 이미지 */}
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    onClick={() => setMainIdx(i)}
                    aria-label={`썸네일 ${i + 1}`}
                    className={`overflow-hidden rounded-xl border ${
                      i === mainIdx ? "border-emerald-400" : "border-transparent"
                    } bg-gray-100`}
                  >
                    <img src={src} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* 태그, 타이틀, 가격 */}
            <div className="mt-4">
              <div className="flex gap-2 text-sm text-gray-500">
                {product.theme !== "ALL" && <span className="rounded-full bg-gray-100 px-2 py-1">#{product.theme}</span>}
                {product.category !== "ALL" && <span className="rounded-full bg-gray-100 px-2 py-1">#{product.category}</span>}
              </div>
              <h1 className="mt-2 text-xl font-semibold">{product.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <strong className="text-lg">₩{fmt(product.price)}</strong>
                {product.salePrice && (
                  <span className="text-sm text-gray-500">(판매가 {fmt(product.salePrice)})</span>
                )}
              </div>
            </div>

            {/* 옵션/수량 */}
            <div className="mt-4 space-y-3">
              {/* 사이즈 */}
              <div className="flex items-center gap-3">
                <label className="w-16 text-sm text-gray-500">사이즈</label>
                <div className="flex flex-1 items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                  <select
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="bg-transparent outline-none"
                  >
                    {["S", "M", "L"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* 수량 선택 */}
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1"
                      aria-label="감소"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                    >
                      ×
                    </button>
                    <span className="w-6 text-center">{qty}</span>
                    <button
                      className="px-2 py-1"
                      aria-label="증가"
                      onClick={() => setQty(q => q + 1)}
                    >
                      ▲
                    </button>
                  </div>
                </div>
              </div>

              {/* 색상 + 장바구니 버튼 */}
              <div className="flex items-center gap-3">
                <label className="w-16 text-sm text-gray-500">색상</label>
                <div className="flex flex-1 items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                  <select
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="bg-transparent outline-none"
                  >
                    {["White", "Black"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label="장바구니"
                    className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700"
                    title="장바구니"
                  >
                    {/* 장바구니 아이콘 */}
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M3 3h2l.4 2M7 13h9l3-7H6.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="9" cy="19" r="1.6" fill="currentColor" />
                      <circle cx="17" cy="19" r="1.6" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 장바구니 & 구매 버튼 */}
              <div className="flex gap-3">
                <button type="button"
                  onClick={handleAddToCart}                               
                  className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 text-white">장바구니</button>
                <button className="flex-1 rounded-2xl bg-emerald-300/90 px-4 py-3 text-gray-900">구매 신청</button>
              </div>
            </div>
          </section>

          {/* 장바구니 & 구매 버튼(하단 스티키 용도) */}
          <div
            onClick={handleAddToCart}  
            className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white p-3 md:hidden">
            <div className="mx-auto flex max-w-[480px] gap-2">
              <button className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 text-white">장바구니</button>
              <button className="flex-1 rounded-2xl bg-emerald-300/90 px-4 py-3 text-gray-900">구매 신청</button>
            </div>
          </div>

          {/* 제품 소개 & 제품 상세 정보 */}
          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">제품소개</h2>
              <p className="mt-2 leading-relaxed text-gray-700">
                세터(SATUR)는 ‘토요일을 선물하세요’의 슬로건을 바탕으로 2020년에 론칭한 컨템포러리 브랜드입니다. 브랜드 명인 ‘SATUR’는 토요일을 뜻하는 ‘SATURDAY’에서 탄생하였으며,
                <button className="ml-1 text-sm text-gray-500 underline">Read More..</button>
              </p>
            </div>

{/* 상세 이미지 */}
  <div className="space-y-3">
    {(images.length ? images : [product.img]).map((src, i) => (
      <div key={`${src}-${i}`} className="overflow-hidden rounded-[24px] bg-gray-100">
        <img
          src={src}
          alt={`${product.name} 이미지 ${i + 1}`}
          className="w-full object-cover"
          style={{ aspectRatio: "4 / 5" }}   
          loading="lazy"
        />
      </div>
    ))}
  </div>

            <div>
              <h3 className="text-base font-semibold">제품상세정보</h3>
              <div className="mt-4 space-y-5">
                <Gauge label="두께감" />
                <Gauge label="신축성" />
                <Gauge label="안감" />
                <Gauge label="촉감" />
                <Gauge label="비침" />
              </div>
            </div>
          </section>
          

          {/* 사용 후기(리뷰) */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold">사용 후기</h2>
            <div className="mt-1 text-sm text-gray-500">
              {product.reviewCount ?? MOCK_REVIEWS.length} Reviews · {product.rating ?? 4.8} ★★★★☆
            </div>

            <ul className="mt-6 space-y-8">
              {visibleReviews.map(r => (
                <li key={r.id} className="rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
                      <div>
                        <div className="font-medium">{r.user}</div>
                        <div className="text-xs text-gray-500">{r.date}</div>
                        <div className="text-xs text-gray-500">
                          사이즈 {r.size} · 색상 {r.color} · {r.tags.map(t => `#${t}`).join(" ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-amber-400" aria-label={`별점 ${r.rating}`}>
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </div>
                  </div>

                  {r.image && (
                    <img src={r.image} alt="" className="mt-3 w-full rounded-2xl object-cover" />
                  )}
                  <p className="mt-3 text-sm text-gray-700">{r.text}</p>
                </li>
              ))}
            </ul>

            {hasMoreReviews && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setReviewPage(p => p + 1)}
                  className="rounded-xl border border-gray-200 px-5 py-2 text-sm"
                >
                  더보기
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {/* 장바구니 토스트 */}
        <CartToast
          open={toastOpen}
          message="상품을 장바구니에 담았습니다."
          onAction={() => navigate("/cart")}
          onClose={() => setToastOpen(false)}
        />
    </main>
  );
}

// 게이지 컴포넌트
function Gauge({ label }: { label: string }) {
  const value = 1; // 0~3 사이 값
  return (
    <div>
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      <div className="relative h-8">
        <div className="absolute inset-0 grid grid-cols-4 text-[11px] text-gray-400">
          <span className="text-left">매우 두꺼움</span>
          <span className="text-center">두꺼움</span>
          <span className="text-center">적당</span>
          <span className="text-right">얇음</span>
        </div>
        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gray-300" />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-gray-900"
          style={{ left: `calc(${(value / 3) * 100}% - 6px)` }}
        />
      </div>
    </div>
  );
}
