// src/pages/LoginRequiredPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRequiredPage() {
  const nav = useNavigate();

  return (
    // 좌우/상하가 까만 여백으로 채워지고, 중앙에 패널만 보이도록
    <div className="min-h-screen bg-grey grid place-items-start">
      <div className="mx-auto h-full w-full max-w-[480px]">
        <div className="l">
          {/* 헤더 */}
          <div className="relative px-6 pt-7 pb-5">
            <h2 className="text-[20px] leading-tight font-semibold">
              <span className="font-extrabold underline underline-offset-4">로그인</span>
              이 필요합니다.
            </h2>

            {/* 닫기(X) → 이전 페이지로 */}
            <button
              aria-label="닫기"
              onClick={() => nav(-1)}
              className="absolute right-3 top-3 h-10 w-10 grid place-items-center rounded-full hover:bg-black/5 active:scale-95 transition"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* 굵은 구분선 */}
          <div className="px-6">
            <hr className="border-black" />
          </div>

          {/* 메뉴 목록 */}
          <nav className="px-6 py-8">
            <ul className="space-y-8 text-[20px] leading-none">
              <li><button className="w-full text-left hover:text-blue-700">상품조회</button></li>
              <li><button className="w-full text-left hover:text-blue-700">스타일 북</button></li>
              <li><button className="w-full text-left hover:text-blue-700">문의 채널</button></li>
              <li><button className="w-full text-left hover:text-blue-700">공지 사항</button></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
