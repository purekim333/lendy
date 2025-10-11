import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import productban1 from "../assets/banner/productban1.png"
<<<<<<< HEAD

// 샘플 데이터 타입
type Product = {
  id: string;
  name: string;
  price: number;       // 대여가
  salePrice?: number;  // 판매가 (옵션)
  img: string;
  category: "ALL" | "Tops" | "Bottoms" | "Outers";
  theme: "ALL" | "Daily" | "Work" | "Travel" | "Dating" | "Party";
  createdAt: string;   // 정렬용
};

// 샘플 데이터 - 추루 API로 대체
const SAMPLE: Product[] = [
  {
    id: "p1",
    name: "썬 레트로 그래픽 반팔 티셔츠 아트 블루",
    price: 18000,
    salePrice: 112000,
    img: "/assets/sample/p1.png", 
    category: "Tops",
    theme: "Daily",
    createdAt: "2025-08-01",
  },
  {
    id: "p2",
    name: "세터데이 레트로 무드 그래픽 반팔 터데이 레트로 무드 그래픽 반팔",
    price: 14000,
    salePrice: 105000,
    img: "/assets/sample/p2.png",
    category: "Tops",
    theme: "Travel",
    createdAt: "2025-08-12",
  },
  {
    id: "p3",
    name: "썬 레트로 그래픽 반팔 티셔츠 아트 블루",
    price: 18000,
    salePrice: 112000,
    img: "/assets/sample/p1.png", 
    category: "Tops",
    theme: "Daily",
    createdAt: "2025-08-01",
  },
  {
    id: "p4",
    name: "세터데이 레트로 무드 그래픽 반팔",
    price: 14000,
    salePrice: 105000,
    img: "/assets/sample/p2.png",
    category: "Tops",
    theme: "Travel",
    createdAt: "2025-08-12",
  },
];
=======
import { Product } from "../types/Product";
import { SAMPLE_PRODUCTS as SAMPLE } from "../data/Products";
>>>>>>> develop

const CATS = ["ALL", "Tops", "Bottoms", "Outers"] as const;
const THEMES = ["ALL", "Daily", "Work", "Travel", "Dating", "Party"] as const;
const SORTS = ["최신순", "낮은가격", "높은가격"] as const;

export default function ProductsPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("ALL");
  const [theme, setTheme] = useState<(typeof THEMES)[number]>("ALL");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("최신순");

  const filtered = useMemo(() => {
<<<<<<< HEAD
    let list = SAMPLE.filter((p) =>
=======
    let list = [...SAMPLE].filter((p) =>
>>>>>>> develop
      (cat === "ALL" || p.category === cat) && 
      (theme === "ALL" || p.theme === theme)
    );
    switch (sort) {
      case "최신순":
        list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "낮은가격":
        list = list.sort((a, b) => a.price - b.price);
        break;
      case "높은가격":
        list = list.sort((a, b) => b.price - a.price);
        break;
    }
    return list;
  }, [cat, theme, sort]);

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  return (
    <div className="bg-white min-h-screen">
      {/* 배너 */}
      <div className="w-full">
        <img
          src={productban1}  // 배너 이미지 경로
          alt=""
          className="w-full h-52 object-cover"
        />
      </div>

      {/* 1차 카테고리 탭 */}
      <div className="border-t">
        <div className="mx-auto w-full max-w-[480px] font-semibold">
          <ul className="flex items-center justify-between text-sm font-serif px-4">
            {CATS.map((c) => (
              <li key={c}>
                <button
                  onClick={() => setCat(c)}
                  className={`pb-1 ${
                    cat === c ? "text-[#B3E8CF] font-bold underline underline-offset-4" : "text-gray-800"
                  }`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>

          {/* 2차 테마 탭 */}
          <ul className="flex items-center justify-between text-sm font-serif border-t py-1 px-4">
            {THEMES.map((t) => (
              <li key={t}>
                <button
                  onClick={() => setTheme(t)}
                  className={`${
                    theme === t ? "text-[#B3E8CF]  font-bold underline underline-offset-4" : "text-gray-800"
                  }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 상단 정보 (총 N개 / 정렬) */}
      <div className="border-t">
        <div className="mx-auto w-full max-w-[480px] px-4 py-4 flex items-center justify-between">
        <p className="text-base">
            총 <span className="font-semibold">{filtered.length}</span>개의 상품
        </p>
          <div className="relative text-sm">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="appearance-none bg-transparent pr-6 text-gray-500"
              aria-label="정렬 선택"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
          </div>
        </div>
      </div>

            {/* 카드 그리드 */}
        <div className="mx-auto w-full max-w-[480px] px-4 pb-10">
        {filtered.length > 0 ? (
            <ul className="grid grid-cols-2 gap-4">
            {filtered.map((p) => (
                <li key={p.id}>
<<<<<<< HEAD
                <Link to={`/product/${p.id}`} className="group block">
=======
                <Link to={`/products/${p.id}`} className="group block">
>>>>>>> develop
                    <div className="relative">
                    <img
                        src={p.img}
                        alt={p.name}
                        className="aspect-[4/5] w-full object-cover rounded-2xl shadow-md group-hover:scale-105 transition"
                    />
                    {/* 찜 아이콘 */}
                    <button
                        aria-label="찜"
                        className="absolute right-2 top-2 h-9 w-9 rounded-full grid place-items-center bg-white/70 backdrop-blur-sm hover:bg-white transition"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 21s-7-4.438-9.5-7.5C.5 11 .5 7.5 3 6s4.5 0 6 2c1.5-2 4.5-3 6-2s2.5 5-.5 7.5S12 21 12 21Z" strokeWidth="1.7" />
                        </svg>
                    </button>
                    </div>

                    <div className="mt-2">
                    <p className="mt-2 text-[15px] font-semibold text-gray-900 line-clamp-2">
                        {p.name}
                    </p>
                    <p className="mt-2">
<<<<<<< HEAD
                        <span className="text-sm font-bold text-black">대여가 {fmt(p.price)}원</span>
                    </p>
                    {p.salePrice && (
                        <p className="text-sm font-semibold text-gray-600">
                        판매가 {fmt(p.salePrice)}원
=======
                        <span className="text-sm font-bold text-black">가격 {fmt(p.price)}원</span>
                    </p>
                    {p.salePrice && (
                        <p className="text-sm font-semibold text-gray-600">
                        정가 {fmt(p.salePrice)}원
>>>>>>> develop
                        </p>
                    )}
                    </div>
                </Link>
                </li>
            ))}
            </ul>
        ) : (
            <div className="py-32 text-center text-gray-500 text-sm">
            더 많은 상품을 준비중이에요
            </div>
        )}
        </div>
     
    </div>
  )};
