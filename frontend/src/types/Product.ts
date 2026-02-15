export type ProductOption = {
  id: number;
  productId: number;
  size: string;
  count: number;
  buyPrice: number;
  rentalPrice: number;
};

export type ProductSummary = {
  id: number;
  name: string;
  buyPrice: number;
  rentalPrice: number;
  imageURL: string;
  type: string;
  tag: string;
};

export type Product = {
  id: number;
  productName: string;
  type: string;
  tag: string;
  color: string;
  description: string;
  buyPrice: number;
  rentalPrice: number;
  thickness: number;
  elasticity: number;
  lining: number;
  handFeel: number;
  seeThrough: number;
  options: ProductOption[];
  imageUrls: string[];
};


// type Product = {
//   id: string;
//   name: string;
//   price: number;       // 대여가
//   salePrice?: number;  // 판매가 (옵션)
//   img: string;
//   category: "ALL" | "Tops" | "Bottoms" | "Outers";
//   theme: "ALL" | "Daily" | "Work" | "Travel" | "Dating" | "Party";
//   createdAt: string;   // 정렬용
// };
