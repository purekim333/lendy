import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      {/* Mobile header */}
      <div className="lg:hidden h-14 border-b bg-white flex items-center px-4 justify-between sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <span className="font-bold text-sm">LENDY Admin</span>
        <div className="w-9" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[240px] bg-white border-r flex flex-col
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <span className="font-extrabold text-lg tracking-tight">LENDY Admin</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <AdminLink to="/admin" icon={<LayoutDashboard size={18} />} onClick={() => setSidebarOpen(false)}>
            대시보드
          </AdminLink>
          <AdminLink to="/admin/products" icon={<Package size={18} />} onClick={() => setSidebarOpen(false)}>
            상품 목록
          </AdminLink>
          <AdminLink to="/admin/products/new" icon={<PackagePlus size={18} />} onClick={() => setSidebarOpen(false)}>
            상품 등록
          </AdminLink>
          <AdminLink to="/admin/orders" icon={<ShoppingCart size={18} />} onClick={() => setSidebarOpen(false)}>
            주문/대여 관리
          </AdminLink>
          <AdminLink to="/admin/users" icon={<Users size={18} />} onClick={() => setSidebarOpen(false)}>
            사용자 관리
          </AdminLink>
        </nav>

        {/* User info + Logout */}
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
              {user?.nickname?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nickname || user?.username || "관리자"}</p>
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-emerald-600" />
                <span className="text-xs text-emerald-600 font-medium">ADMIN</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="bg-[#f7f9fc] min-h-screen flex flex-col">
        {/* Desktop header */}
        <header className="hidden lg:flex h-14 border-b bg-white items-center px-6 justify-between shrink-0">
          <h1 className="text-base font-semibold">관리자 패널</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.email || user?.username || ""}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </section>
    </div>
  );
}

function AdminLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-gray-900 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
      end
    >
      {icon}
      {children}
    </NavLink>
  );
}
