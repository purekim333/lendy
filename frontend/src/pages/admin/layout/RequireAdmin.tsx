import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// 프로젝트의 실제 인증 훅/컨텍스트로 교체
function useAuth() {
  // 예시: { isAuthed, role } 를 리턴하는 훅
  return { isAuthed: true, role: "ADMIN" as "ADMIN"|"USER"|"GUEST" };
}

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAuthed, role } = useAuth();
  const loc = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login-required" state={{ from: loc.pathname }} replace />;
  }
  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
