declare global {
  interface Window {
    IMP: any;
  }
}

export const requestPayment = (orderName: string, amount: number) => {
  return new Promise((resolve, reject) => {
    const { IMP } = window;
    if (!IMP) return reject("포트원 SDK 로드 실패");

    IMP.init("imp60840556");

    IMP.request_pay(
      {
        pg: "html5_inicis",
        pay_method: "card",
        merchant_uid: `mid_${new Date().getTime()}`,
        name: orderName,
        amount: amount,
        buyer_email: "tmdduf785@naver.com",
        buyer_name: "오승열",
        buyer_tel: "010-3762-9160",
      },
      (rsp: any) => {
        if (rsp.success) {
          resolve(rsp);
        } else {
          reject(rsp.error_msg);
        }
      }
    );
  });
};
