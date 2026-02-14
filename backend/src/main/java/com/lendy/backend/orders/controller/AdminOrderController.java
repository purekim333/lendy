package com.lendy.backend.orders.controller;

import com.lendy.backend.orders.dto.OrderAdminResponse;
import com.lendy.backend.orders.dto.UpdateTrackingRequest;
import com.lendy.backend.orders.entity.OrderStatus;
import com.lendy.backend.orders.service.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<Page<OrderAdminResponse>> listOrders(
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {
        Page<OrderAdminResponse> orders = adminOrderService.listOrders(status, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<OrderAdminResponse> getOrder(@PathVariable String orderCode) {
        OrderAdminResponse order = adminOrderService.getOrder(orderCode);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{orderCode}/ready")
    public ResponseEntity<Void> markAsReady(@PathVariable String orderCode) {
        adminOrderService.updateStatus(orderCode, OrderStatus.READY);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderCode}/shipping")
    public ResponseEntity<Void> markAsShipping(
            @PathVariable String orderCode,
            @RequestBody UpdateTrackingRequest request) {
        adminOrderService.markAsShipping(orderCode, request.getCarrier(), request.getInvoiceNo());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderCode}/delivered")
    public ResponseEntity<Void> markAsDelivered(@PathVariable String orderCode) {
        adminOrderService.updateStatus(orderCode, OrderStatus.DELIVERED);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable String orderCode) {
        adminOrderService.cancelOrder(orderCode);
        return ResponseEntity.ok().build();
    }
}
