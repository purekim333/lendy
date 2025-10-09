export type Product = {
  id: string;
  name: string;
  price: number;               // 현재 판매가
  salePrice?: number;     // 세일 가격
  img: string;                 // 대표 이미지
  images?: string[];           // 상세 페이지용 이미지
  rating?: number;             // 평균 평점
  reviewCount?: number;        // 리뷰 개수
  category: "ALL" | "Tops" | "Bottoms" | "Outers";
  theme: "ALL" | "Daily" | "Work" | "Travel" | "Dating" | "Party";
  createdAt: string | Date;   // 정렬용
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
