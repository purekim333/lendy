package com.lendy.backend.User.service;

import com.lendy.backend.User.dto.UserRequestDTO;
import com.lendy.backend.User.entity.UserEntity;
import com.lendy.backend.User.entity.UserRoleType;
import com.lendy.backend.User.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 유저 정보 조회
     * @param dto
     * @return
     */
    @Transactional(readOnly = true)
    public Boolean existUser(UserRequestDTO dto) {
        return userRepository.existsByUsername(dto.getUsername());
    }

    /**
     * 회원가입(유저 추가)
     * @param dto
     * @return
     */
    @Transactional
    public Long addUser(UserRequestDTO dto) {

        if(userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("이미 유저가 존재합니다.");
        }

        UserEntity newUser = UserEntity.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .isLock(false)
                .isSocial(false)
                .roleType(UserRoleType.ROLE_USER)
                .nickname(dto.getNickname())
                .email(dto.getEmail())
                .build();

        return userRepository.save(newUser).getId();
    }

    /**
     * 유저 업데이트
     * @param dto
     * @return
     * @throws AccessDeniedException
     */
    @Transactional
    public Long updateUser(UserRequestDTO dto) throws AccessDeniedException {

        String sessionUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if(!sessionUsername.equals(dto.getUsername())) {
            throw new AccessDeniedException("본인 계정만 수정 가능");
        }

        UserEntity user = userRepository.findByUsernameAndIsLockAndIsSocial(dto.getUsername(), false, false)
                .orElseThrow(() -> new UsernameNotFoundException(dto.getUsername()));

        user.updateUser(dto);

        return userRepository.save(user).getId();
    }

    /**
     * 자체 로그인
     * @param username
     * @return
     * @throws UsernameNotFoundException
     */
    @Transactional(readOnly = true)
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        UserEntity user = userRepository.findByUsernameAndIsLockAndIsSocial(username, false, false)
                .orElseThrow(() -> new UsernameNotFoundException(username));

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRoleType().name())
                .accountLocked(user.getIsLock())
                .build();
    }
}
