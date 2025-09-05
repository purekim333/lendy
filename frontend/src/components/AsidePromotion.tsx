// src/components/AsidePromotion.tsx
import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AsidePromotion() {
  return (
    // 화면 왼쪽에 "완전 고정"
    <aside className="hidden xl:flex fixed left-52 top-0 h-screen w-[440px] shrink-0">
      <div className="flex h-full flex-col justify-between px-8 py-10">

        {/* 타이포 & 카피 */}
        <div>
          <p className="text-xs tracking-[0.2em] text-gray-400">
            RENDY / RENT & BUY
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
            오늘의 무드를 <span className="font-serif italic">부드럽게</span>
            <br />
            입고, 가볍게 <span className="font-serif italic">빌리다</span>.
          </h2>
          <p className="mt-4 text-sm text-gray-600 leading-6">
            데이트, 인터뷰, 여행… 그날의 순간을 위한 한 벌.
            <br />
            소유보다 경험에 가까운 옷장, Rendy.
          </p>

          {/* CTA */}
          <div className="mt-6 flex gap-3">
            <Link
              to="/rent"
              className="rounded-full bg-black text-white px-5 py-2 text-sm"
            >
              옷 대여하기
            </Link>
            <Link
              to="/collection"
              className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm hover:border-gray-400"
            >
              컬렉션 보기
            </Link>
          </div>

          {/* 혜택 카드 (사진 없이 텍스트만) */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] tracking-[0.18em] text-gray-400">WHY RENDY</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li>∙ 사이즈&핏 무료 교환</li>
              <li>∙ 3/7/14일 대여 옵션</li>
              <li>∙ 세탁/케어 포함, 반납만 하면 끝</li>
            </ul>
          </div>
        </div>

        {/* 한 줄 리뷰 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p className="italic">
            “중요한 날, Rendy 덕분에 준비가 쉬워졌어요. 핏도 예쁘고 반납도 간단!”
          </p>
          <p className="mt-2 text-xs text-gray-400">— @min****, 2025.08</p>
        </div>
      </div>
    </aside>
  );
}
