import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Form = {
  label: string;    // 배송지명 *
  receiver: string; // 수령인 *
  address: string;  // 주소 *
  phone: string;    // 연락처 *
};

export default function AddressAddModal() {
  const nav = useNavigate();
  const [form, setForm] = useState<Form>({
    label: "",
    receiver: "",
    address: "",
    phone: "",
  });

  const valid = useMemo(() => {
    return (
      form.label.trim() &&
      form.receiver.trim() &&
      form.address.trim() &&
      form.phone.trim()
    );
  }, [form]);

  const close = () => nav(-1);

  const save = async () => {
    if (!valid) return;
    // TODO: POST /addresses
    // 성공 후 목록 갱신은 Query invalidation or redirect로 해결
    close();
  };

  const openPostcode = () => {
    // TODO: 다음/카카오 우편번호 연동
    // window.daum?.postcode.load(() => new daum.Postcode({ oncomplete: ({ address }) => setForm(f => ({...f, address})) }).open());
    alert("주소 검색(카카오) 연동 자리");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-[420px] rounded-3xl bg-white p-5 shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">배송지 추가</h2>
          <button onClick={close} aria-label="닫기" className="rounded p-1 hover:bg-gray-50">✕</button>
        </div>

        {/* 폼 */}
        <div className="mt-4 space-y-4">
          <Field
            label="배송지명*"
            value={form.label}
            onChange={(v) => setForm({ ...form, label: v })}
          />
          <Field
            label="수령인*"
            value={form.receiver}
            onChange={(v) => setForm({ ...form, receiver: v })}
          />

          {/* 주소 + 우측 '주소 검색' 작은 버튼 (피그마 느낌) */}
          <div className="relative">
            <Field
              label="주소*"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              inputClass="pr-24"
            />
            <button
              type="button"
              onClick={openPostcode}
              className="absolute right-2 top-[30px] rounded-full border px-3 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
            >
              주소 검색
            </button>
          </div>

          <Field
            label="연락처*"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            placeholder="010-0000-0000"
            inputMode="tel"
          />
        </div>

        {/* 하단 CTA (비활성 → 회색) */}
        <button
          onClick={save}
          disabled={!valid}
          className={`mt-6 h-11 w-full rounded-2xl text-sm 
            ${valid ? "bg-gray-900 text-white hover:opacity-90" : "bg-gray-200 text-gray-400"}
          `}
        >
          완료
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  inputClass = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  inputClass?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className={`mt-1 w-full rounded-2xl border px-4 py-3 text-sm ${inputClass}`}
      />
    </div>
  );
}
