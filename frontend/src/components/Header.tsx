import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import logo from "../assets/logo.png";
import icHamburger from "../assets/header/hamburger.png";
import icSearch from "../assets/header/search.png";
import icUser from "../assets/header/mypage.png";
import icCart from "../assets/header/cart.png"


export default function Header() {
    const nav = useNavigate();
    const loc = useLocation();
  
    const handleHamburger = () => {
        if (loc.pathname === "/login-required") {
          // 이미 로그인 필요 페이지면 → 뒤로가기
          if (window.history.length > 1) nav(-1);
          else nav("/");
        } else {
          // 그 외 페이지면 → 로그인 필요 페이지로 이동
          nav("/login-required");
        }
      };

  return (
    <>
    <header className="h-14 bg-white border-b flex items-center justify-between px-3">
    <button
        aria-label="메뉴 열기"
        className="p-2 ml-1"
        onClick={handleHamburger} 
      >
          <img src={icHamburger} alt="" className="h-5 w-5 object-contain" />
        </button>

      <Link to="/" aria-label="홈으로">
        <img src={logo} alt="RENDY" className="ml-16 h-4 object-contain" />
      </Link>

      <div className="flex items-center gap-1.5">
        <button aria-label="검색" className="p-1">
          <img src={icSearch} alt="" className="h-5 w-5" />
        </button>
        <button aria-label="내 정보" className="p-1">
          <img src={icUser} alt="" className="h-5 w-5" />
        </button>
        <button aria-label="장바구니" className="relative p-1">
          <img src={icCart} alt="" className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 bg-blue-600 text-white text-[10px] leading-4 rounded-full w-4 h-4 text-center">
            0
          </span>
        </button>
      </div>
    </header>

</>
);
}
