import type { CartItem } from "../types/Cart";

const K = "cart:v1";
export const CART_EVENT = "cart:changed";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(K);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  localStorage.setItem(K, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(newItem: Omit<CartItem, "key" | "checked">) {
  const key = `${newItem.productId}|${newItem.size}|${newItem.color}`;
  const items = getCart();
  const i = items.findIndex((it) => it.key === key);
  if (i >= 0) {
    items[i].qty += newItem.qty;
    items[i].checked = true;
  } else {
    items.unshift({ ...newItem, key, checked: true });
  }
  setCart(items);
}

// 장바구니 옷 총 수량
export function getCartCount(): number {                       
  return getCart().reduce((sum, it) => sum + (it.qty || 0), 0);
}