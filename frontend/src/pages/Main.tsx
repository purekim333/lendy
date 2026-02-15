// src/pages/Main.tsx
import React, { useEffect, useState } from "react";
import main1 from "../assets/main1.png";
import main2 from "../assets/main2.png";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const nav = useNavigate();

  // 온보딩 카드 상태
  const [open, setOpen] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<"M" | "W" | null>(null);
  const valid = birthday && gender;

  // 첫 방문에만 노출
  useEffect(() => {
    const seen = localStorage.getItem("lendy:onboardingSeen");
    if (!seen) setOpen(true);
  }, []);

  const handleSubmit = () => {
    if (!valid) return;
    localStorage.setItem("lendy:onboardingSeen", "1");
    localStorage.setItem("lendy:birthday", birthday);
    localStorage.setItem("lendy:gender", String(gender));
    setOpen(false);
    // 필요하면 이동
    // nav("/products");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">


      {/* 메인 위에 얹는 온보딩 카드 */}
      {open && (
        <div className="absolute inset-x-0 bottom-20 flex justify-center z-30 px-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur-sm">
            {/* 닫기 */}
            <button
              aria-label="close"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-2 text-gray-400 hover:bg-gray-100"
            >
              ✕
            </button>

            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 text-center">
              LENDY, <span className="font-black">렌탈 구매 서비스</span>
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              첫 Lendy의 방문을 환영합니다. <br />
              더 좋은 서비스를 제공하기 위해 필수정보를 입력해주세요 :)
            </p>

            {/* 생년월일 */}
            <label className="mt-5 block text-sm font-medium text-gray-700">
              생년월일
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border px-3 py-2">
              <input
                type="date"
                className="w-full text-sm outline-none bg-transparent"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>

            {/* 성별 */}
            <div className="mt-4 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setGender("M")}
                className={`h-10 w-32 rounded-full border text-sm font-medium transition ${gender === "M"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Men
              </button>
              <button
                type="button"
                onClick={() => setGender("W")}
                className={`h-10 w-32 rounded-full border text-sm font-medium transition ${gender === "W"
                    ? "bg-emerald-400 text-white border-emerald-400"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Women
              </button>
            </div>

            {/* 완료 */}
            <button
              type="button"
              disabled={!valid}
              onClick={handleSubmit}
              className="mt-6 h-11 w-full rounded-full bg-gray-800 text-white text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              완료
            </button>
          </div>
        </div>
      )}



      {/* --- Main visual 1 (배너) --- */}
      <section className="relative">
        <img
          src={main1}
          alt="Cafe terrace"
          className="w-full h-[600px] object-cover"
        />

        {/* 배너 CTA */}
        <button
          onClick={() => nav("/products")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#FFFDFA] text-black w-[220px] py-2 border font-serif z-20"
        >
          Shop More
        </button>
      </section>

      {/* --- Quick Shop Button (prominent) --- */}
      <section className="px-5 py-8 bg-emerald-50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">지금 바로 쇼핑하기</h2>
          <p className="text-gray-600 mb-6">
            트렌디한 스타일을 경험해보세요
          </p>
          <button
            onClick={() => nav("/products")}
            className="w-full max-w-xs bg-emerald-400 hover:bg-emerald-500 text-gray-900 font-semibold py-4 px-8 rounded-2xl transition shadow-md"
          >
            상품 목록 보기
          </button>
        </div>
      </section>

      {/* --- Main visual 2 --- */}
      <section className="relative">
        <img
          src={main2}
          alt="Street view"
          className="w-full h-[400px] object-cover"
        />
      </section>

      {/* --- Text section --- */}
      <section className="px-5 py-10">
        <h2 className="font-bold text-lg mb-2">
          지금 가장 트렌디한 순간을 빌려입는 Lendy
        </h2>
        <p className="text-sm leading-relaxed text-gray-600">
          Lendy는 ‘옷을 경험한다’는 생각에서 시작됐습니다. 꼭 소유하지 않아도,
          우리는 옷을 통해 다양한 나를 표현할 수 있어야 하니까요.
          <br />
          <br />
          데이트, 면접, 여행, 파티… 그날의 기분과 상황에 맞는 ‘단 하나의 옷’을
          고르고, 입고, 반납하면 끝. 옷장이 줄어들지 않고, 계절을 따라가는 비용
          부담도 없습니다.
          <br />
          <br />
          Lendy는 당신이 지금의 나답게 입는 것, 그리고 더 많은 스타일을 가볍게
          경험하는 것을 돕습니다.
          <br />
          <strong>트렌드는 사는 게 아니라, 빌리는 거야.</strong>
        </p>
      </section>

      {/* --- Footer --- */}
      <footer className="mt-auto border-t text-sm">
        <div>
          <details className="p-5">
            <summary className="font-semibold cursor-pointer">COMPANY INFO</summary>
            <p className="mx-4 mt-2 text-gray-500 text-sm">
              회사 정보나 사업자 등록번호 등 추가 내용 기재
            </p>
          </details>

          <details className="p-5 border-y">
            <summary className="font-semibold cursor-pointer">INSTAGRAM</summary>
            <p className="mx-4 mt-2 text-gray-500 text-sm">
              인스타그램 계정 링크나 소개
            </p>
          </details>
        </div>

        <p className="mt-8 text-gray-400 text-xs text-center">
          ©Copyright Lendy ALL Rights reserved
        </p>
      </footer>
    </div>
  );
}
