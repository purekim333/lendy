package com.lendy.backend.user.repository;

import com.lendy.backend.user.entity.UserEntity;
import com.lendy.backend.user.entity.UserRoleType;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Boolean existsByUsername(String username);
    Optional<UserEntity> findByUsernameAndIsLock(String username, Boolean isLock);
    @Transactional
    void deleteByUsername(String username);
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByUsernameAndIsSocial(String username, Boolean social);
    Optional<UserEntity> findByUsernameAndIsLockAndIsSocial(String username, Boolean isLock, Boolean isSocial);

    // Admin user management queries
    Page<UserEntity> findByUsernameContainingOrEmailContaining(String username, String email, Pageable pageable);
    Page<UserEntity> findByRoleType(UserRoleType roleType, Pageable pageable);
    Page<UserEntity> findByRoleTypeAndUsernameContainingOrRoleTypeAndEmailContaining(
            UserRoleType roleType1, String username, UserRoleType roleType2, String email, Pageable pageable);
}
