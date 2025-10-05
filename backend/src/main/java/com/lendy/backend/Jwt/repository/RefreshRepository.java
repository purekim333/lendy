package com.lendy.backend.Jwt.repository;

import com.lendy.backend.Jwt.entity.RefreshEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface RefreshRepository extends JpaRepository<RefreshEntity, Long> {
    Boolean existsByRefresh(String refreshToken);

    @Transactional
    void deleteByRefresh(String refresh);
    @Transactional
    void deleteByUsername(String username);
    // 특정일 지난 refresh 토큰 삭제
    @Transactional
    void deleteByCreatedDateBefore(LocalDateTime createdDate);
}