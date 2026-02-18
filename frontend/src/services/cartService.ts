import { fetchWithAccess } from "../util/fetchUtil";

const API_BASE = "/api/v1/cart";

// 백엔드 CartItemDto 구조
export interface CartItemDto {
  productOptionId: number;
  productId: number;
  imageURL: string;
  productName: string;
  color: string;
  size: string;
  count: number;
  unitPrice: number;
  unitTotalPrice: number;
}

export interface CartResponse {
  myCart: CartItemDto[];
  totalPrice: number;
  totalCount: number;
}

/** 장바구니 조회 */
export async function fetchCart(): Promise<CartResponse> {
  const res = await fetchWithAccess(`${API_BASE}/items`);
  if (!res.ok) throw new Error("장바구니 조회 실패");
  return res.json();
}

/** 장바구니에 상품 추가 */
export async function addCartItem(
  productOptionId: number,
  quantity: number = 1,
): Promise<void> {
  const res = await fetchWithAccess(
    `${API_BASE}/items/${productOptionId}?quantity=${quantity}`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error("장바구니 추가 실패");
}

/** 장바구니 수량 변경 (delta: +1 or -1) */
export async function changeCartItemQty(
  productOptionId: number,
  delta: number,
): Promise<void> {
  const res = await fetchWithAccess(
    `${API_BASE}/items/${productOptionId}?delta=${delta}`,
    { method: "PATCH" },
  );
  if (!res.ok) throw new Error("수량 변경 실패");
}

/** 장바구니 아이템 1개 삭제 */
export async function removeCartItem(
  productOptionId: number,
): Promise<void> {
  const res = await fetchWithAccess(
    `${API_BASE}/items/${productOptionId}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("아이템 삭제 실패");
}

/** 장바구니 전체 삭제 */
export async function clearCart(): Promise<void> {
  const res = await fetchWithAccess(`${API_BASE}/items`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("장바구니 전체 삭제 실패");
}
