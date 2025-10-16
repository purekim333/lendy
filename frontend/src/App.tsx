import React from "react";
import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Login from "./pages/Login";
import CookiePage from "./pages/CookiePage";
import LoginRequiredPage from "./pages/LoginRequiredPage";
import Search from "./pages/Search";
import ProductsPage from "./pages/ProductsPage";
import PaymentPage from "./pages/PaymentPage";
import UserPage from "./pages/UserPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";

import ProfilePage from "./pages/ProfilePage";          // 회원정보 수정 (페이지)
import AddressListPage from "./pages/AddressListPage";  // 배송지 목록 (페이지)
import AddressAddModal from "./modals/AddressAddModal"; // 배송지 추가 (모달)

// --- Admin ---
import AdminLayout from "./pages/admin/layout/AdminLayout";
import RequireAdmin from "./pages/admin/layout/RequireAdmin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProductsList from "./pages/admin/products/AdminProductsList";
import AdminProductCreate from "./pages/admin/products/Create";
import AdminOrders from "./pages/admin/orders/AdminOrders";

function Shell({
  children,
  showAside = false,
}: {
  children: React.ReactNode;
  showAside?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className={`mx-auto w-full px-4 ${showAside ? "xl:pl-[460px]" : ""}`}>
        <main
          className={`
            ${showAside ? "w-[420px]" : "w-full max-w-[480px]"}
            bg-white shadow-app xl:overflow-hidden
            min-h-screen flex flex-col mx-auto
          `}
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
  // --- 모달 라우트용: 배경 위치 패턴 ---
  const location = useLocation();
  const state = location.state as { background?: Location } | undefined;
  const backgroundLocation = state?.background;

  return (
    <>
      {/* 1) 메인 라우트: 모달이 열릴 때는 '배경' 위치로 렌더 */}
      <Routes location={backgroundLocation || location}>
        {/* 헤더가 있는 페이지들 */}
        <Route element={<LayoutWithHeader />}>
          <Route index element={<Main />} />
          <Route path="login-required" element={<LoginRequiredPage />} />
          <Route path="login" element={<Login />} />
          <Route path="search" element={<Search />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="/cookie" element={<CookiePage />} />

          {/* 마이페이지 & 하위 페이지들 */}
          <Route path="/user" element={<UserPage />} />
          <Route path="/user/profile" element={<ProfilePage />} />
          <Route path="/user/addresses" element={<AddressListPage />} />

          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* 헤더 없는 페이지들 (필요 시) */}
        <Route element={<LayoutWithoutHeader />}>{/* 빈 */}</Route>

        {/* 결제 */}
        <Route path="/payment" element={<PaymentPage />} />

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
        </Route>

        {/* 그 외 */}
        <Route element={<LayoutWithHeader />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* 2) 모달 라우트: 배경이 있을 때만 오버레이로 추가 렌더 */}
      {backgroundLocation && (
        <Routes>
          <Route
            path="/user/addresses/new"
            element={<AddressAddModal />}
          />
        </Routes>
      )}
    </>
  );
}
