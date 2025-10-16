import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Address = {
  id: string;
  label: string;     // 배송지명
  full: string;      // 전체 주소(표기용)
  isDefault?: boolean;
};

export default function AddressListPage() {
  const [list, setList] = useState<Address[]>([]);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    // TODO: 실제 목록 fetch
    setList([
      { id: "a1", label: "다인집", full: "서울특별시 영등포구 당산동5가 9-2 1012호", isDefault: true },
      { id: "a2", label: "회사", full: "서울특별시 중구 을지로 100 10층" },
      { id: "a3", label: "친정", full: "경기도 수원시 영통구 법조로 25 205호" },
    ]);
  }, []);

  const openAdd = () => {
    nav("/user/addresses/new", { state: { background: loc } });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[480px] px-4 py-8">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-extrabold">배송지 정보</h1>
          <button
            onClick={openAdd}
            className="rounded-full border px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            + 배송지 추가
          </button>
        </div>

        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id} className="flex items-start gap-3 rounded-2xl border p-4">
              {/* 왼쪽 썸네일(핀 아이콘 대체) */}
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50">
                <span>📍</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  배송지명: {a.label}{" "}
                  {a.isDefault && (
                    <span className="ml-1 rounded-full border px-2 py-[2px] text-[10px] text-gray-600">
                      기본배송지
                    </span>
                  )}
                </p>
                <p className="mt-1 truncate text-sm text-gray-600">{a.full}</p>
              </div>

              {/* 수정/삭제는 추후 확장 */}
              {/* <button className="rounded-lg border px-2 py-1 text-xs">수정</button> */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
