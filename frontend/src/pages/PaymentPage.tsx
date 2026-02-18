import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPayment } from "../services/PaymentService";
import { checkout, verifyPayment } from "../services/orderService";
import { fetchCart, clearCart as clearBackendCart, type CartItemDto } from "../services/cartService";
import { getUser } from "../services/userService";
import { getAddresses, type Address } from "../services/addressService";

type Step = "shipping" | "processing" | "success" | "failed";

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("shipping");
  const [cartItems, setCartItems] = useState<CartItemDto[]>([]);

  // 배송 정보
  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zip, setZip] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");

  // 주문 결과
  const [orderCode, setOrderCode] = useState("");
  const [orderAccessKey, setOrderAccessKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  function applyAddress(addr: Address) {
    setReceiverName(addr.receiverName);
    setPhone(addr.phone);
    setZip(addr.zipCode);
    setAddress1(addr.address1);
    setAddress2(addr.address2);
  }

  useEffect(() => {
    // 백엔드 장바구니 API에서 데이터 로드
    fetchCart()
      .then((data) => {
        if (data.myCart.length === 0) {
          alert("장바구니가 비어 있습니다.");
          navigate("/cart");
          return;
        }
        setCartItems(data.myCart);
        setIsLoggedIn(true);

        // 저장된 배송지 로드
        getAddresses()
          .then((addresses) => {
            setSavedAddresses(addresses);
            // 기본 배송지 자동 적용
            const def = addresses.find((a) => a.isDefault);
            if (def) applyAddress(def);
          })
          .catch(() => {});

        // 이메일 자동 채우기
        getUser()
          .then((u) => { if (u.email) setEmail(u.email); })
          .catch(() => {});
      })
      .catch(() => {
        alert("로그인이 필요합니다.");
        navigate("/login");
      });
  }, [navigate]);

  const subtotal = cartItems.reduce((s, i) => s + i.unitTotalPrice, 0);
  const shippingFee = subtotal >= 50000 ? 0 : 3000;
  const total = subtotal + shippingFee;

  const handleCheckout = async () => {
    // Validation
    if (!receiverName.trim()) {
      alert("받는 분 이름을 입력해주세요.");
      return;
    }
    if (!phone.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!address1.trim() || !zip.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    setStep("processing");

    try {
      // 1. 주문 생성
      const checkoutReq: any = {
        items: cartItems.map((item) => ({
          productOptionId: item.productOptionId,
          qty: item.count,
        })),
        shipping: {
          receiverName,
          phone,
          address1,
          address2,
          zip,
          ...(deliveryMessage && { deliveryMessage }),
        },
      };

      // Only add guest info if not logged in
      if (!isLoggedIn) {
        checkoutReq.guest = {
          name: receiverName,
          phone,
          email,
        };
      }

      const checkoutRes = await checkout(checkoutReq);
      const { merchantUid, totalAmount, orderCode: code, orderAccessKey: key } = checkoutRes;

      // 2. 포트원 결제 요청
      const orderName = cartItems.length === 1
        ? cartItems[0].productName
        : `${cartItems[0].productName} 외 ${cartItems.length - 1}건`;

      const rsp: any = await requestPayment(
        merchantUid,
        totalAmount,
        orderName,
        { name: receiverName, email, phone }
      );

      // 3. 결제 검증
      await verifyPayment({
        merchantUid: rsp.merchant_uid,
        impUid: rsp.imp_uid,
      });

      // 4. 성공 처리
      setOrderCode(code);
      setOrderAccessKey(key);
      setStep("success");

      // 5. 백엔드 장바구니 비우기
      await clearBackendCart().catch(() => {});

    } catch (err: any) {
      setErrorMsg(err.message || "결제 처리 중 오류가 발생했습니다.");
      setStep("failed");
    }
  };

  if (step === "processing") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[480px] items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">결제 처리 중...</div>
          <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
        </div>
      </main>
    );
  }

  if (step === "success") {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-8">
        <div className="text-center">
          <div className="mb-6 text-6xl">✅</div>
          <h1 className="mb-2 text-2xl font-bold">결제 완료</h1>
          <p className="mb-6 text-gray-600">주문이 정상적으로 완료되었습니다.</p>

          {isLoggedIn ? (
            // Logged in users - show link to my orders
            <div className="mb-8 space-y-3">
              <button
                onClick={() => navigate("/my-orders")}
                className="w-full rounded-2xl bg-emerald-300 py-3 font-semibold hover:bg-emerald-400"
              >
                주문 내역 보기
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full rounded-2xl bg-gray-200 py-3 font-semibold hover:bg-gray-300"
              >
                홈으로 돌아가기
              </button>
            </div>
          ) : (
            // Guest users - show access key
            <>
              <div className="mb-8 rounded-2xl border border-gray-200 p-6 text-left">
                <div className="mb-3 text-sm font-semibold text-gray-700">주문 조회 정보</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">주문번호</span>
                    <span className="font-mono font-semibold">{orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">조회키</span>
                    <span className="font-mono font-semibold">{orderAccessKey}</span>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-sky-50 p-3 text-xs text-gray-600">
                  위 정보로 주문 내역을 조회할 수 있습니다.
                </div>
              </div>

              <button
                onClick={() => navigate("/")}
                className="w-full rounded-2xl bg-emerald-300 py-3 font-semibold hover:bg-emerald-400"
              >
                홈으로 돌아가기
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  if (step === "failed") {
    return (
      <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 py-8">
        <div className="text-center">
          <div className="mb-6 text-6xl">❌</div>
          <h1 className="mb-2 text-2xl font-bold">결제 실패</h1>
          <p className="mb-6 text-gray-600">{errorMsg}</p>

          <button
            onClick={() => {
              setStep("shipping");
              setErrorMsg("");
            }}
            className="w-full rounded-2xl bg-gray-200 py-3 font-semibold hover:bg-gray-300"
          >
            다시 시도
          </button>
        </div>
      </main>
    );
  }

  // step === "shipping"
  return (
    <main className="mx-auto min-h-screen max-w-[480px] bg-white px-4 pb-32 pt-4">
      <h1 className="mb-6 text-xl font-bold">주문/결제</h1>

      {/* 주문 상품 정보 */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">주문 상품</h2>
        <ul className="space-y-2">
          {cartItems.map((item) => (
            <li
              key={item.productOptionId}
              className="flex gap-3 rounded-2xl border border-gray-100 p-3"
            >
              <img
                src={item.imageURL}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.productName}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {item.size} · {item.color} · 수량 {item.count}
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {fmt(item.unitTotalPrice)}원
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 배송 정보 */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">배송 정보</h2>

        {/* 저장된 배송지 선택 */}
        {savedAddresses.length > 0 && (
          <div className="mb-3">
            <select
              onChange={(e) => {
                const addr = savedAddresses.find((a) => a.id === Number(e.target.value));
                if (addr) applyAddress(addr);
              }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>저장된 배송지 선택</option>
              {savedAddresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.isDefault ? "[기본] " : ""}{a.label || a.receiverName} - {a.address1}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="받는 분 이름 *"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
          />
          <input
            type="tel"
            placeholder="연락처 (- 없이 입력) *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
          />
          <input
            type="email"
            placeholder="이메일 *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="우편번호 *"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-24 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="주소 *"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="상세주소"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="배송 메시지 (선택)"
            value={deliveryMessage}
            onChange={(e) => setDeliveryMessage(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </section>

      {/* 결제 금액 */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">결제 금액</h2>
        <div className="space-y-2 rounded-2xl border border-gray-100 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">상품 금액</span>
            <span>{fmt(subtotal)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">배송비</span>
            <span>{fmt(shippingFee)}원</span>
          </div>
          <div className="border-t border-gray-200 pt-2" />
          <div className="flex justify-between text-base font-bold">
            <span>총 결제 금액</span>
            <span className="text-emerald-600">{fmt(total)}원</span>
          </div>
        </div>
      </section>

      {/* 하단 고정 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="mx-auto w-full max-w-[480px]">
          <button
            onClick={handleCheckout}
            className="w-full rounded-2xl bg-emerald-300 py-4 text-center font-semibold hover:bg-emerald-400"
          >
            {fmt(total)}원 결제하기
          </button>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
