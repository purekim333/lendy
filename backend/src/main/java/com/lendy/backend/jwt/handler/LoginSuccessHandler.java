package com.lendy.backend.jwt.handler;

import com.lendy.backend.jwt.service.JwtService;
import com.lendy.backend.jwt.util.JWTUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Qualifier("LoginSuccessHandler")
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        // username, role
        String username = authentication.getName();
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        // JWT(Access/Refresh) 발급
        String accessToken = JWTUtil.createJWT(username, role, true);
        String refreshToken = JWTUtil.createJWT(username, role, false);

        // 발급한 Refresh DB 테이블 저장 (Refresh whitelist)
        jwtService.addRefresh(username, refreshToken);

        // 쿠키 생성 (Refresh Token)
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // HTTPS 적용 시 true 로 변경
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 1일

        // 응답에 쿠키 추가
        response.addCookie(cookie);

        // 프론트엔드 쿠키 교환 페이지로 리다이렉트 (Gateway 환경 고려하여 상대경로 or 절대경로)
        // 로컬 환경: http://localhost:5173/cookie (개발) or http://localhost/cookie (Docker)
        // 여기서는 Docker Compose 환경(Gateway=80)을 가정하고 상대경로 사용,
        // 혹은 OAUTH_REDIRECT_BASE 환경변수가 있다면 사용.
        // 일단 Docker 환경 기준 /cookie 로 리다이렉트 시도.
        response.sendRedirect("/cookie");
    }
}
