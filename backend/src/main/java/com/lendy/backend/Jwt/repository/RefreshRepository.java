package com.lendy.backend.Jwt.repository;

import com.lendy.backend.Jwt.entity.RefreshEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface RefreshRepository extends JpaRepository<RefreshEntity, Long> {
    Boolean existsByRefresh(String refreshToken);

    @Transactional
    void deletedByRefresh(String refresh);

    @Transactional
    void deletedByUsername(String username);
}