// src/pages/LoginRequiredPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginRequiredPage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="min-h-screen grid place-items-start">
      <div className="mx-auto h-full w-full max-w-[480px] px-6 pt-7 pb-5">
        <form onSubmit={onSubmit} className="flex items-center border-b border-gray-400">
          {/* 검색 인풋 */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type here to search"
            className="
              flex-1
              text-[24px]
              placeholder:text-gray-400
              outline-none
              border-none
              bg-transparent
              pb-2
              focus:border-black
            "
            aria-label="검색어 입력"
          />
          {/* 돋보기 버튼 */}
          <button
            type="submit"
            aria-label="검색"
            className="ml-2 h-10 w-10 grid place-items-center rounded-full hover:bg-black/5 active:scale-95 transition"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="M20 20l-3-3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
