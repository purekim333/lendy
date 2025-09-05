import React from "react";
import main1 from "../assets/main1.png"
import main2 from "../assets/main2.png"


export default function Main() {
  return (
<div className="min-h-screen flex flex-col bg-white text-gray-800">

      {/* --- Main visual 1 --- */}
      <section className="relative">
        <img
          src={main1}
          alt="Cafe terrace"
          className="w-full h-[600px] object-cover"
        />
        <button className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#FFFDFA] text-black w-[220px] py-2 border font-serif">
          Shop More
        </button>
      </section>

      {/* --- Main visual 2 --- */}
      <section className="relative">
        <img
          src={main2}
          alt="Street view"
          className="w-full h-[400px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">

        </div>
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
  <div className="">
    <details className="p-5">
      <summary className="font-semibold cursor-pointer">
        COMPANY INFO
      </summary>
      <p className="mx-4 mt-2 text-gray-500 text-sm">
        회사 정보나 사업자 등록번호 등 추가 내용 기재
      </p>
    </details>


    <details className="p-5 border-y">
      <summary className="font-semibold cursor-pointer">
        INSTAGRAM
      </summary>
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