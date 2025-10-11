package com.lendy.backend.User.repository;

import com.lendy.backend.User.entity.UserEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Boolean existsByUsername(String username);
    Optional<UserEntity> findByUsernameAndIsLock(String username, Boolean isLock);
    @Transactional
    void deleteByUsername(String username);
<<<<<<< HEAD
    Optional<UserEntity> findByUsername(String username);
=======
>>>>>>> develop
    Optional<UserEntity> findByUsernameAndIsSocial(String username, Boolean social);
    Optional<UserEntity> findByUsernameAndIsLockAndIsSocial(String username, Boolean isLock, Boolean isSocial);
}
