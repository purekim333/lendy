package com.lendy.backend.orders.controller;

import com.lendy.backend.orders.dto.CheckoutRequest;
import com.lendy.backend.orders.dto.CheckoutResponse;
import com.lendy.backend.orders.dto.GuestOrderResponse;
import com.lendy.backend.orders.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutRequest request) {
        CheckoutResponse response = orderService.checkout(request);
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
}
