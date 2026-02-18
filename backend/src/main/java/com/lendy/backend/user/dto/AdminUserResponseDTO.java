package com.lendy.backend.user.dto;

import com.lendy.backend.user.entity.UserEntity;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponseDTO {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String role;
    private Boolean isLock;
    private Boolean isSocial;
    private String socialProvider;
    private LocalDateTime createdDate;

    public static AdminUserResponseDTO from(UserEntity user) {
        return AdminUserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .role(user.getRoleType().name())
                .isLock(user.getIsLock())
                .isSocial(user.getIsSocial())
                .socialProvider(user.getSocialProviderType() != null ? user.getSocialProviderType().name() : null)
                .createdDate(user.getCreatedDate())
                .build();
    }
}
