// src/pages/ProfilePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

type Profile = {
  avatarUrl?: string;
  nickname: string;
  birthday?: string; // "YYYY.MM.DD"
  gender?: "MEN" | "WOMEN";
  email?: string; // 읽기 전용일 수 있음
};

export default function ProfilePage() {
  // TODO: 실제 API 연동
  const [me, setMe] = useState<Profile>({
    avatarUrl: "",
    nickname: "",
    birthday: "",
    gender: "WOMEN",
    email: "user@example.com",
  });
  const [checking, setChecking] = useState(false);
  const [dupOk, setDupOk] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    // 초기 프로필 fetch 자리
    // setMe(...)
  }, []);

  const valid = useMemo(() => me.nickname.trim().length >= 2, [me.nickname]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMe((prev) => ({ ...prev, avatarUrl: url }));
  };

  const checkNickname = async () => {
    if (!me.nickname.trim()) return;
    setChecking(true);
    try {
      // await fetch(`/api/users/check-nickname?value=${encodeURIComponent(me.nickname)}`)
      // const ok = (await res.json()).ok;
      const ok = me.nickname.trim().length >= 2; // MOCK
      setDupOk(ok);
    } finally {
      setChecking(false);
    }
  };

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      // await fetch(..., { method: "PATCH", body: JSON.stringify(me) })
      nav("/user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[480px] px-4 pt-8 pb-28">
        <h1 className="text-center text-xl font-extrabold">회원 정보 수정</h1>

        {/* 아바타 */}
        <div className="mt-6 flex flex-col items-center">
          <label className="relative block size-28 overflow-hidden rounded-full bg-gray-100">
            {me.avatarUrl ? (
              <img src={me.avatarUrl} alt="avatar" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-gray-400">
                이미지 추가
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          {me.email && <p className="mt-2 text-xs text-gray-500">{me.email}</p>}
        </div>

        {/* 폼 */}
        <div className="mt-6 space-y-4">
          {/* 닉네임 + 중복확인 */}
          <div className="flex items-center gap-2">
            <input
              value={me.nickname}
              onChange={(e) => setMe({ ...me, nickname: e.target.value })}
              placeholder="닉네임"
              className="flex-1 rounded-2xl border px-4 py-3 text-sm"
            />
            <button
              onClick={checkNickname}
              className="whitespace-nowrap rounded-2xl border px-3 py-3 text-xs hover:bg-gray-50"
              disabled={!me.nickname.trim() || checking}
            >
              {checking ? "확인중..." : "중복확인"}
            </button>
          </div>
          {dupOk !== null && (
            <p className={`text-xs ${dupOk ? "text-green-600" : "text-red-600"}`}>
              {dupOk ? "사용 가능한 닉네임입니다." : "이미 사용 중인 닉네임입니다."}
            </p>
          )}

          {/* 생일 */}
          <div className="relative">
            <input
              value={me.birthday ?? ""}
              onChange={(e) => setMe({ ...me, birthday: e.target.value })}
              placeholder="2000.04.17"
              className="w-full rounded-2xl border px-4 py-3 text-sm pr-10"
              inputMode="numeric"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              📅
            </span>
          </div>

          {/* 성별 토글 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMe({ ...me, gender: "MEN" })}
              className={`h-11 rounded-2xl border text-sm ${me.gender === "MEN" ? "bg-gray-100" : "bg-white"}`}
            >
              Men
            </button>
            <button
              type="button"
              onClick={() => setMe({ ...me, gender: "WOMEN" })}
              className={`h-11 rounded-2xl border text-sm ${me.gender === "WOMEN" ? "bg-green-100 text-green-700" : "bg-white"}`}
            >
              Women
            </button>
          </div>
        </div>

        {/* 배송지 빠른 액션 */}
        <div className="mt-8 rounded-2xl border p-4">
          <p className="text-sm font-semibold">배송지</p>
          <p className="mt-1 text-xs text-gray-500">배송지는 별도 페이지에서 관리돼요.</p>
          <div className="mt-3 flex gap-2">
            <Link
              to="/user/addresses"
              className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
            >
              배송지 관리로 이동
            </Link>
            <button
              onClick={() => nav("/user/addresses/new", { state: { background: loc } })}
              className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
            >
              새 배송지 추가
            </button>
          </div>
        </div>
      </div>

      {/* 하단 고정 CTA */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-white px-4 py-3">
        <button
          onClick={save}
          disabled={!valid || saving}
          className={`mx-auto block h-12 w-full max-w-[480px] rounded-2xl text-sm text-white
            ${valid ? "bg-gray-900 hover:opacity-90" : "bg-gray-300"}
          `}
        >
          {saving ? "저장 중..." : "변경 완료"}
        </button>
      </div>
    </div>
  );
}
