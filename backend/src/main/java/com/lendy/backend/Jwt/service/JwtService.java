package com.lendy.backend.Jwt.service;

import com.lendy.backend.Jwt.entity.RefreshEntity;
import com.lendy.backend.Jwt.repository.RefreshRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final RefreshRepository refreshRepository;

    @Transactional
    public void addRefresh(String username, String refreshToken) {
        RefreshEntity entity = RefreshEntity.builder()
                .username(username)
                .refresh(refreshToken)
                .build();

        refreshRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public Boolean existsRefresh(String refreshToken) {
        return refreshRepository.existsByRefresh(refreshToken);
    }

    public void removeRefresh(String refreshToken){
        refreshRepository.deleteByRefresh(refreshToken);
    }

    public void removeRefreshUser(String username){
        refreshRepository.deleteByUsername(username);
    }
}
