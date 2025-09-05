import React from "react";

export default function Login() {
  return (
    <div className="p-6 grid gap-4">
      <h2 className="text-xl font-semibold">로그인</h2>
      <input className="border rounded-md px-3 py-2" placeholder="이메일" />
      <input className="border rounded-md px-3 py-2" placeholder="비밀번호" type="password" />
      <button className="bg-black text-white rounded-md py-2">로그인</button>
    </div>
  );
}
