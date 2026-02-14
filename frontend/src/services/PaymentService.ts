declare global {
  interface Window {
    IMP: any;
  }
}

export interface BuyerInfo {
  name: string;
  email: string;
  phone: string;
}

export const requestPayment = (
  merchantUid: string,
  amount: number,
  orderName: string,
  buyer: BuyerInfo
) => {
  return new Promise((resolve, reject) => {
    const { IMP } = window;
    if (!IMP) return reject("포트원 SDK 로드 실패");

    IMP.init("imp60840556");

    IMP.request_pay(
      {
        pg: "html5_inicis",
        pay_method: "card",
        merchant_uid: merchantUid,
        name: orderName,
        amount: amount,
        buyer_email: buyer.email,
        buyer_name: buyer.name,
        buyer_tel: buyer.phone,
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
