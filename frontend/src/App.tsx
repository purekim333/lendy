import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
<<<<<<< HEAD
import AsidePromotion from "./components/AsidePromotion";
=======
// import AsidePromotion from "./components/AsidePromotion";
>>>>>>> develop
import Login from "./pages/Login";
import CookiePage from "./pages/CookiePage"
import LoginRequiredPage from "./pages/LoginRequiredPage";
import Search from "./pages/Search";
import ProductsPage from "./pages/ProductsPage";
import PaymentPage from "./pages/PaymentPage";
import UserPage from "./pages/UserPage";
<<<<<<< HEAD


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
=======
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";

// --- Admin 전용 페이지들 ---
import AdminLayout from "./pages/admin/layout/AdminLayout";
import RequireAdmin from "./pages/admin/layout/RequireAdmin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProductsList from "./pages/admin/products/AdminProductsList";
import AdminProductCreate from "./pages/admin/products/Create"; // (캔버스에 올려둔 컴포넌트)
import AdminOrders from "./pages/admin/orders/AdminOrders";



function Shell({
  children,
  showAside = false, // ← 기본은 숨김
}: {
  children: React.ReactNode;
  showAside?: boolean;
}) {
  return (
    <div className="min-h-screen bg-whit">
      {/* {showAside && <AsidePromotion />} */}

      <div className={`mx-auto w-full px-4 ${showAside ? "xl:pl-[460px]" : ""}`}>
        <main
          className={`
            ${showAside ? "w-[420px]" : "w-full max-w-[480px]"}
            bg-white shadow-app xl:overflow-hidden
            min-h-screen flex flex-col mx-auto
          `}
>>>>>>> develop
        >
          {children}
        </main>
      </div>
    </div>
  );
}

<<<<<<< HEAD




=======
>>>>>>> develop
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
<<<<<<< HEAD
=======
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
>>>>>>> develop
      </Route>

      {/* 헤더가 없는 페이지들 */}
      <Route element={<LayoutWithoutHeader />}>

      </Route>

      {/* 얘는 어디 넣어야할지 몰라서 여기 넣어봤음 (결제관련)*/}
      <Route path="/payment" element={<PaymentPage></PaymentPage>}></Route>

<<<<<<< HEAD
=======
      {/* 관리자 영역 */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsList />} />
        <Route path="products/new" element={<AdminProductCreate />} />
        <Route path="orders" element={<AdminOrders />} />
        {/* 필요 시 추가: users, coupons, banners ... */}
      </Route>

>>>>>>> develop
      {/* 그 외 */}
      <Route element={<LayoutWithHeader />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
