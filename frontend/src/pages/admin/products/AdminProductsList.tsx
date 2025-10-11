import React from "react";
import { Link } from "react-router-dom";
export default function AdminProductsList() {
  // TODO: 서버에서 목록 페칭
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">상품 목록</h2>
        <Link to="/admin/products/new" className="px-3 py-2 rounded-xl bg-black text-white">
          상품 등록
        </Link>
      </div>
      <div className="border rounded-2xl bg-white p-4 text-sm text-gray-500">
        목록 테이블(검색/필터/페이지네이션) 자리
      </div>
    </div>
  );
}