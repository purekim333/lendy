// src/pages/UserPage.tsx
import { useEffect, useMemo, useState } from "react";
import { fetchWithAccess } from "../util/fetchUtil";
import main1 from "../assets/main1.png"; // 배너 톤 맞추기 위해 재사용
// 필요 시 위 이미지를 다른 것으로 교체 가능

const BACKEND_API_BASE_URL = process.env.REACT_APP_BACKEND_API_BASE_URL ?? "";

type UserInfo = {
  username: string;
  nickname: string;
  email: string;
};
export default function UserPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const res = await fetchWithAccess(`${BACKEND_API_BASE_URL}/user`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("유저 정보 불러오기 실패");
        const data: UserInfo = await res.json();
        setUserInfo(data);
      } catch {
        setError("유저 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    loadUserInfo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* --- Hero (Main.tsx 톤) --- */}
      <section className="relative">
        <img
          src={main1}
          alt="Profile cover"
          className="w-full h-[360px] object-cover"
        />
        {/* 살짝 어둡게 깔아 텍스트 대비 확보 */}
        <div className="absolute inset-0 bg-black/20" />
        <h1 className="absolute left-1/2 -translate-x-1/2 bottom-6 text-white font-serif tracking-tight text-2xl">
          My Page
        </h1>
      </section>

      {/* --- Floating Card (Main 온보딩 카드 느낌) --- */}
      <section className="relative z-10 -mt-14 px-4">
        <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
          {/* 상단 프로필 영역 */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500">어서오세요,</p>
              <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                {userInfo?.nickname || userInfo?.username || "Guest"}
              </h2>
              <p className="text-xs text-gray-500">{userInfo?.email || "-"}</p>
            </div>

            {/* 액션 버튼 예시 */}
            <div className="flex gap-2">
              <button
                type="button"
                className="h-9 rounded-full border px-4 text-sm hover:bg-gray-50"
                onClick={() => (window.location.href = "/products")}
              >
                Shop More
              </button>
              <button
                type="button"
                className="h-9 rounded-full bg-gray-900 px-4 text-sm text-white hover:opacity-90"
                onClick={() => (window.location.href = "/settings")}
              >
                설정
              </button>
            </div>
          </div>

          {/* 구분선 */}
          <div className="my-6 h-px w-full bg-gray-100" />

          {/* 정보 그리드 (카드형) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <p className="text-xs font-medium text-gray-500">닉네임</p>
              <p className="mt-1 text-sm font-semibold">
                {userInfo?.nickname ?? "-"}
              </p>
            </div>
            <div className="rounded-2xl border p-4">
              <p className="text-xs font-medium text-gray-500">이메일</p>
              <p className="mt-1 text-sm font-semibold">
                {userInfo?.email ?? "-"}
              </p>
            </div>
          </div>

          {/* 안내 블럭 (Main 텍스트 섹션 톤) */}
          <div className="mt-6 rounded-2xl bg-[#FFFDFA] p-5 border">
            <h3 className="font-bold text-gray-900 text-base">
              지금 가장 트렌디한 순간을, 가볍게
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Lendy는 ‘옷을 경험한다’는 생각에서 시작됐습니다. 필요한 순간,
              필요한 스타일만 골라 입고 반납하면 끝. 더 가벼운 옷장과 더 넓어진
              선택지를 경험해보세요.
            </p>
          </div>
        </div>
      </section>

      {/* --- 추가 정보 섹션 (옵션) --- */}
      <section className="px-5 py-10">
        <h4 className="font-bold text-lg mb-2">계정 관리</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            className="rounded-2xl border p-4 text-left hover:bg-gray-50"
            onClick={() => (window.location.href = "/orders")}
          >
            <span className="block text-sm font-semibold">주문/대여 내역</span>
            <span className="mt-1 block text-xs text-gray-500">
              주문 현황과 반납 일정을 확인하세요
            </span>
          </button>
          <button
            className="rounded-2xl border p-4 text-left hover:bg-gray-50"
            onClick={() => (window.location.href = "/profile")}
          >
            <span className="block text-sm font-semibold">프로필/주소 관리</span>
            <span className="mt-1 block text-xs text-gray-500">
              배송지, 연락처, 기본 정보를 수정해요
            </span>
          </button>
        </div>
      </section>

      {/* --- Footer (Main과 톤 통일) --- */}
      <footer className="mt-auto border-t text-sm">
        <p className="mt-8 text-gray-400 text-xs text-center">
          ©Copyright Lendy ALL Rights reserved
        </p>
      </footer>

      {/* --- 상태 UI --- */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="animate-pulse rounded-3xl border bg-white p-6 shadow-lg">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-64 rounded bg-gray-200" />
          </div>
        </div>
      )}
      {error && !loading && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
        >
          {error}
        </div>
      )}
    </div>
  );
}
