package com.lendy.backend.Jwt.controller;

import com.lendy.backend.Jwt.util.JWTUtil;
import com.lendy.backend.User.entity.UserRoleType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/dev/auth")
@RequiredArgsConstructor
@Profile("dev")
public class DevAuthController {

    @Value("${dev.admin.secret:default-dev-secret-change-me}")
    private String devAdminSecret;

    @PostMapping("/admin-token")
    public ResponseEntity<DevTokenResponse> createAdminToken(
            @RequestHeader(value = "X-Dev-Admin-Secret", required = false) String secret
    ) {
        if (secret == null || !secret.equals(devAdminSecret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid dev admin secret");
        }

        String adminToken = JWTUtil.createJWT("dev-admin", "ROLE_" + UserRoleType.ADMIN.name(), true);

        return ResponseEntity.ok(new DevTokenResponse(adminToken));
    }

    @Getter
    @RequiredArgsConstructor
    public static class DevTokenResponse {
        private final String accessToken;
    }
}
