import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      {/* Sidebar */}
      <aside className="border-r bg-white">
        <div className="p-4 font-extrabold text-lg">LENDY Admin</div>
        <nav className="px-3 space-y-1">
          <AdminLink to="/admin">대시보드</AdminLink>
          <AdminLink to="/admin/products">상품 목록</AdminLink>
          <AdminLink to="/admin/products/new">상품 등록</AdminLink>
          <AdminLink to="/admin/orders">주문/대여 관리</AdminLink>
        </nav>
      </aside>

      {/* Main */}
      <section className="bg-[#f7f9fc]">
        <header className="h-14 border-b bg-white flex items-center px-5 justify-between">
          <h1 className="text-base font-semibold">관리자</h1>
          {/* 우측 유틸: 알림, 프로필 등 */}
          <div className="text-sm text-gray-500">admin@lendy</div>
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

function AdminLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm ${
          isActive ? "bg-black text-white" : "hover:bg-black/5"
        }`
      }
      end
    >
      {children}
    </NavLink>
  );
}
