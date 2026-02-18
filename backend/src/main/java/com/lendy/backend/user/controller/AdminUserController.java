package com.lendy.backend.user.controller;

import com.lendy.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.listAllUsers(PageRequest.of(page, size), search, role));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> toggleRole(@PathVariable Long id) {
        userService.toggleUserRole(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> toggleLock(@PathVariable Long id) {
        userService.toggleUserLock(id);
        return ResponseEntity.ok().build();
    }
}
