// utils/auth.ts
/**
 * AccessToken 만료 시 Refreshing
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("RefreshToken이 없습니다.");

  const response = await fetch(
    `${process.env.REACT_APP_BACKEND_API_BASE_URL}/jwt/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }
  );

  if (!response.ok) throw new Error("AccessToken 갱신 실패");

  // 성공 시 새 Token 저장
  const data: { accessToken: string; refreshToken?: string } =
    await response.json();

  localStorage.setItem("accessToken", data.accessToken);
  // 서버가 refreshToken도 재발급한다면 갱신
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  return data.accessToken;
}

/**
 * AccessToken을 자동으로 부착하고 401 시 재발급 후 재요청하는 fetch
 * @returns Response
 */
export async function fetchWithAccess(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = localStorage.getItem("accessToken") ?? "";

  // HeadersInit을 Headers로 정규화 후 Authorization 부착
  const headers = new Headers(options.headers ?? {});
  headers.set("Authorization", `Bearer ${accessToken}`);

  // 정규화한 headers를 options에 다시 세팅
  options.headers = headers;

  // 1차 요청
  let response = await fetch(url, options);

  // 401 이면 토큰 갱신 후 재시도
  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${accessToken}`);
      options.headers = headers;

      response = await fetch(url, options);
    } catch (err) {
      // Refresh 실패 → 토큰 제거 및 로그인 페이지로 이동
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      // 이후 코드 진행 방지용 throw
      throw err instanceof Error ? err : new Error("토큰 갱신 실패");
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP 오류: ${response.status}`);
  }

  return response;
}
