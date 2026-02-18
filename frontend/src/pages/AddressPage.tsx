import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
} from "../services/addressService";

const empty: Address = {
  label: "",
  receiverName: "",
  phone: "",
  zipCode: "",
  address1: "",
  address2: "",
  isDefault: false,
};

export default function AddressPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Address | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => {
    setLoading(true);
    getAddresses()
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startNew = () => {
    setEditing({ ...empty, isDefault: addresses.length === 0 });
    setIsNew(true);
  };

  const startEdit = (addr: Address) => {
    setEditing({ ...addr });
    setIsNew(false);
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.receiverName.trim() || !editing.phone.trim() || !editing.address1.trim() || !editing.zipCode.trim()) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    try {
      if (isNew) {
        await createAddress(editing);
      } else {
        await updateAddress(editing.id!, editing);
      }
      cancel();
      load();
    } catch (e: any) {
      alert(e.message || "저장 실패");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("이 배송지를 삭제하시겠습니까?")) return;
    try {
      await deleteAddress(id);
      load();
    } catch (e: any) {
      alert(e.message || "삭제 실패");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-lg">←</button>
        <h1 className="text-base font-bold">배송지 관리</h1>
      </div>

      <div className="mx-auto max-w-[480px] px-4 pt-4">
        {/* 추가 버튼 */}
        {!editing && (
          <button
            onClick={startNew}
            className="mb-4 w-full rounded-2xl border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
          >
            + 새 배송지 추가
          </button>
        )}

        {/* 편집 폼 */}
        {editing && (
          <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">{isNew ? "새 배송지" : "배송지 수정"}</h2>
            <div className="space-y-3">
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="배송지 이름 (예: 집, 회사)"
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="받는 분 *"
                value={editing.receiverName}
                onChange={(e) => setEditing({ ...editing, receiverName: e.target.value })}
              />
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="연락처 *"
                value={editing.phone}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              />
              <div className="flex gap-2">
                <input
                  className="w-28 rounded-xl border px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                  placeholder="우편번호 *"
                  value={editing.zipCode}
                  onChange={(e) => setEditing({ ...editing, zipCode: e.target.value })}
                />
                <input
                  className="flex-1 rounded-xl border px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                  placeholder="주소 *"
                  value={editing.address1}
                  onChange={(e) => setEditing({ ...editing, address1: e.target.value })}
                />
              </div>
              <input
                className="w-full rounded-xl border px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                placeholder="상세주소"
                value={editing.address2}
                onChange={(e) => setEditing({ ...editing, address2: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.isDefault}
                  onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                기본 배송지로 설정
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={cancel} className="flex-1 rounded-xl border py-2.5 text-sm hover:bg-gray-50">취소</button>
              <button onClick={save} className="flex-1 rounded-xl bg-black py-2.5 text-sm text-white hover:opacity-90">저장</button>
            </div>
          </div>
        )}

        {/* 배송지 목록 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          </div>
        ) : addresses.length === 0 && !editing ? (
          <div className="py-16 text-center text-sm text-gray-400">
            저장된 배송지가 없습니다.
          </div>
        ) : (
          <ul className="space-y-3">
            {addresses.map((addr) => (
              <li key={addr.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{addr.label || addr.receiverName}</span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">기본</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">{addr.receiverName} / {addr.phone}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      [{addr.zipCode}] {addr.address1} {addr.address2}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(addr)}
                    className="rounded-xl border px-3 py-1.5 text-xs hover:bg-gray-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => remove(addr.id!)}
                    className="rounded-xl border px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
