package com.lendy.backend.user.dto;

public record UserResponseDTO(
        String username,
        Boolean social,
        String nickname,
        String email) {
}
