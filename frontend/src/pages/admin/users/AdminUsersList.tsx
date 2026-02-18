import React, { useEffect, useState } from "react";
import { fetchWithAccess } from "../../../util/fetchUtil";
import Toast from "../../../components/admin/Toast";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import LoadingSpinner from "../../../components/admin/LoadingSpinner";
import EmptyState from "../../../components/admin/EmptyState";
import { Shield, Lock, Unlock, UserCog } from "lucide-react";

type AdminUser = {
  id: number;
  username: string;
  nickname: string;
  email: string;
  role: string;
  isLock: boolean;
  isSocial: boolean;
  socialProvider: string | null;
  createdDate: string;
};

type PageResponse = {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const formatDate = (iso: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

export default function AdminUsersList() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    variant?: "danger" | "default";
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      if (roleFilter) params.append("role", roleFilter);

      const response = await fetchWithAccess(`/api/v1/admin/users?${params}`);
      const pageData: PageResponse = await response.json();
      setData(pageData.content);
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "사용자 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleRole = async (id: number) => {
    try {
      await fetchWithAccess(`/api/v1/admin/users/${id}/role`, { method: "PUT" });
      setToast({ type: "success", message: "역할이 변경되었습니다." });
      await fetchUsers();
    } catch (err) {
      setToast({ type: "error", message: "역할 변경에 실패했습니다." });
    }
  };

  const toggleLock = async (id: number) => {
    try {
      await fetchWithAccess(`/api/v1/admin/users/${id}/lock`, { method: "PUT" });
      setToast({ type: "success", message: "계정 상태가 변경되었습니다." });
      await fetchUsers();
    } catch (err) {
      setToast({ type: "error", message: "계정 상태 변경에 실패했습니다." });
    }
  };

  return (
    <div className="space-y-4">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          open
          title={confirm.title}
          message={confirm.message}
          variant={confirm.variant}
          confirmText={confirm.confirmText}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">사용자 관리</h2>
        <span className="text-sm text-gray-500">총 {totalElements}명</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="사용자명 또는 이메일 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {[
            { value: "", label: "전체" },
            { value: "USER", label: "USER" },
            { value: "ADMIN", label: "ADMIN" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setRoleFilter(opt.value); setPage(0); }}
              className={`px-3 py-2 rounded-xl border text-sm transition-colors ${
                roleFilter === opt.value ? "bg-black text-white" : "bg-white hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border rounded-2xl bg-rose-50 border-rose-200 p-4 text-sm text-rose-700">
          {error}
          <button onClick={fetchUsers} className="ml-3 underline hover:no-underline">다시 시도</button>
        </div>
      )}

      {/* Table */}
      {loading && !data.length ? (
        <LoadingSpinner message="사용자 데이터를 불러오는 중..." />
      ) : (
        <div className="border rounded-2xl bg-white overflow-x-auto">
          <table className="min-w-full w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-3 text-left w-14">ID</th>
                <th className="p-3 text-left">사용자명</th>
                <th className="p-3 text-left">닉네임</th>
                <th className="p-3 text-left">이메일</th>
                <th className="p-3 text-center">역할</th>
                <th className="p-3 text-center">상태</th>
                <th className="p-3 text-center">가입유형</th>
                <th className="p-3 text-left">가입일</th>
                <th className="p-3 text-right w-36">액션</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 text-gray-500 tabular-nums">{user.id}</td>
                  <td className="p-3 font-medium">{user.username}</td>
                  <td className="p-3 text-gray-700">{user.nickname || "-"}</td>
                  <td className="p-3 text-gray-600">{user.email || "-"}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                      user.role === "ADMIN"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-sky-50 text-sky-700 border-sky-200"
                    }`}>
                      {user.role === "ADMIN" && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                      user.isLock
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {user.isLock ? <Lock size={12} /> : <Unlock size={12} />}
                      {user.isLock ? "잠김" : "활성"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {user.isSocial ? (
                      <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                        {user.socialProvider || "소셜"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">일반</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{formatDate(user.createdDate)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          setConfirm({
                            title: "역할 변경",
                            message: `"${user.username}" 사용자의 역할을 ${user.role === "USER" ? "ADMIN" : "USER"}으로 변경하시겠습니까?`,
                            confirmText: "변경",
                            onConfirm: () => toggleRole(user.id),
                          })
                        }
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                        title="역할 변경"
                      >
                        <UserCog size={15} />
                      </button>
                      <button
                        onClick={() =>
                          setConfirm({
                            title: user.isLock ? "계정 잠금 해제" : "계정 잠금",
                            message: `"${user.username}" 계정을 ${user.isLock ? "잠금 해제" : "잠금"}하시겠습니까?`,
                            variant: user.isLock ? "default" : "danger",
                            confirmText: user.isLock ? "해제" : "잠금",
                            onConfirm: () => toggleLock(user.id),
                          })
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.isLock
                            ? "hover:bg-emerald-50 text-emerald-600"
                            : "hover:bg-rose-50 text-rose-600"
                        }`}
                        title={user.isLock ? "잠금 해제" : "잠금"}
                      >
                        {user.isLock ? <Unlock size={15} /> : <Lock size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr>
                  <td className="p-6" colSpan={9}>
                    <EmptyState
                      title="사용자가 없습니다"
                      description={search ? "검색 조건에 맞는 사용자가 없습니다." : "등록된 사용자가 없습니다."}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">페이지 {page + 1}/{totalPages}</div>
          <div className="flex items-center gap-1">
            <PagBtn onClick={() => setPage(0)} disabled={page === 0}>« 처음</PagBtn>
            <PagBtn onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹ 이전</PagBtn>
            <PagBtn onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>다음 ›</PagBtn>
            <PagBtn onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>마지막 »</PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PagBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="px-3 py-1.5 rounded-xl border text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors" {...props}>
      {children}
    </button>
  );
}
