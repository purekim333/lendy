package com.lendy.backend.User.dto;

public record UserResponseDTO(
        String username,
        Boolean social,
        String nickname,
        String email) {
}
