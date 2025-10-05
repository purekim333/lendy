import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem" }}>
      <h2>페이지를 찾을 수 없어요 :(</h2>
      <Link to="/">메인으로</Link>
    </main>
  );
}
