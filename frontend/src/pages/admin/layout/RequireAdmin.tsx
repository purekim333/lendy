import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthed, role } = useAuth();
  const loc = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full" />
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  if (role !== "ADMIN") {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-4 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-lg border">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold mb-2">접근 권한 없음</h1>
          <p className="text-sm text-gray-500 mb-6">
            관리자 권한이 필요합니다.<br />
            관리자 권한이 필요하면 DB에서 역할을 변경해주세요.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
