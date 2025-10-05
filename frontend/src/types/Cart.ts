export type CartItem = {
  key: string;             // productId|size|color
  productId: string;
  name: string;
  img: string;
  price: number;           // 단가
  size: string;
  color: string;
  qty: number;             // 수량
  checked: boolean;        // 선택 여부
};
