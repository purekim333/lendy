import React from "react";
import { requestPayment } from "../services/PaymentService";

const PaymentPage: React.FC = () => {
  const handlePayment = async () => {
    try {
      const rsp: any = await requestPayment("원피스", 1000);

      // 결제 성공 시 imp_uid, merchant_uid를 백엔드로 전달
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imp_uid: rsp.imp_uid,
          merchant_uid: rsp.merchant_uid,
        }),
      });
      const data = await res.json();

      if (data.status === "paid") {
        alert("결제 검증 완료! 주문 확정");
      } else {
        alert("결제 검증 실패");
      }
    } catch (err) {
      alert("결제 실패: " + err);
    }
  };

  return (
    <div>
      <h1>KG이니시스 결제 테스트</h1>
      <button onClick={handlePayment}>결제하기</button>
    </div>
  );
};

export default PaymentPage;
