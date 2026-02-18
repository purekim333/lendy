package com.lendy.backend.orders.controller;

import com.lendy.backend.orders.dto.CheckoutRequest;
import com.lendy.backend.orders.dto.CheckoutResponse;
import com.lendy.backend.orders.dto.GuestOrderResponse;
import com.lendy.backend.orders.dto.MyOrderResponse;
import com.lendy.backend.orders.service.OrderService;
import com.lendy.backend.user.entity.UserEntity;
import com.lendy.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutRequest request) {
        // Extract userId from SecurityContext if authenticated
        Long userId = null;
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            if (username != null && !username.equals("anonymousUser")) {
                UserEntity user = userRepository.findByUsername(username).orElse(null);
                if (user != null) {
                    userId = user.getId();
                }
            }
        } catch (Exception e) {
            // Not authenticated, proceed as guest
        }

        CheckoutResponse response = orderService.checkout(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/guest/{orderCode}")
    public ResponseEntity<GuestOrderResponse> getGuestOrder(
            @PathVariable String orderCode,
            @RequestParam String accessKey) {
        GuestOrderResponse response = orderService.getGuestOrder(orderCode, accessKey);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/guest/{orderCode}/cancel")
    public ResponseEntity<Void> cancelGuestOrder(
            @PathVariable String orderCode,
            @RequestParam String accessKey) {
        orderService.cancelGuestOrder(orderCode, accessKey);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<MyOrderResponse>> getMyOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<MyOrderResponse> orders = orderService.getMyOrders(user.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my/{orderCode}")
    public ResponseEntity<GuestOrderResponse> getMyOrderDetail(@PathVariable String orderCode) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        GuestOrderResponse response = orderService.getMyOrderDetail(orderCode, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/my/{orderCode}/cancel")
    public ResponseEntity<Void> cancelMyOrder(@PathVariable String orderCode) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        orderService.cancelMyOrder(orderCode, user.getId());
        return ResponseEntity.ok().build();
    }
}
