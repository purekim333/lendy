import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import AsidePromotion from "./components/AsidePromotion";
import Login from "./pages/Login";
import CookiePage from "./pages/CookiePage"
import LoginRequiredPage from "./pages/LoginRequiredPage";
import Search from "./pages/Search";
import ProductsPage from "./pages/ProductsPage";
import PaymentPage from "./pages/PaymentPage";
import UserPage from "./pages/UserPage";


function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sky-bg">
      <AsidePromotion />

      {/* 오른쪽 컨텐츠 래퍼: 사이드바 폭만큼 여백 확보 */}
      <div className="mx-auto w-full px-4 xl:pl-[460px]">
        <main
          className="
            w-[420px]
            bg-white shadow-app xl:overflow-hidden
            min-h-screen
            flex flex-col
            mx-auto
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}





/** 헤더가 포함된 레이아웃 */
function LayoutWithHeader() {
  return (
    <Shell>
      <Header />
      <section className="flex-1 bg-[#f9fbff]">
        <Outlet />
      </section>
    </Shell>
  );
}

/** 헤더가 없는 레이아웃 */
function LayoutWithoutHeader() {
  return (
    <Shell>
      <section className="flex-1 bg-[#f9fbff]">
        <Outlet />
      </section>
    </Shell>
  );
}

export default function App() {
  return (
    <Routes>
      {/* 헤더가 있는 페이지들 */}
      <Route element={<LayoutWithHeader />}>
        <Route index element={<Main />} />
        <Route path="login-required" element={<LoginRequiredPage />} />
        <Route path="login" element={<Login />} />
        <Route path="search" element={<Search />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="/cookie" element={<CookiePage />} />
        <Route path="/user" element={<UserPage />}/>
      </Route>

      {/* 헤더가 없는 페이지들 */}
      <Route element={<LayoutWithoutHeader />}>

      </Route>

      {/* 얘는 어디 넣어야할지 몰라서 여기 넣어봤음 (결제관련)*/}
      <Route path="/payment" element={<PaymentPage></PaymentPage>}></Route>

      {/* 그 외 */}
      <Route element={<LayoutWithHeader />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
