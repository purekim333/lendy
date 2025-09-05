package com.lendy.backend.User.controller;

import com.lendy.backend.User.dto.UserRequestDTO;
import com.lendy.backend.User.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 유저 존재 확인
    @PostMapping(value = "/user/exist", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Boolean> existUserApi(
            @Validated(UserRequestDTO.existGroup.class) @RequestBody UserRequestDTO dto
    ) {
        return ResponseEntity.ok(userService.existUser(dto));
    }

    // 회원 가입
    @PostMapping(value = "/user", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Long>> joinApi(
            @Validated(UserRequestDTO.addGroup.class) @RequestBody UserRequestDTO dto
    ) {
        Long id = userService.addUser(dto);
        Map<String, Long> responseBody = Collections.singletonMap("userEntityId", id);
        return ResponseEntity.status(201).body(responseBody);
    }

    // 유저 정보

    // 유저 수정

    // 유저 제거
}
