package com.lendy.backend.orders.controller;

import com.lendy.backend.orders.dto.AdminOrderResponse;
import com.lendy.backend.orders.dto.ShipRequest;
import com.lendy.backend.orders.entity.Order;
import com.lendy.backend.orders.entity.OrderStatus;
import com.lendy.backend.orders.service.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<Page<AdminOrderResponse>> listOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<Order> orders = adminOrderService.listOrders(status, pageable);
        Page<AdminOrderResponse> response = orders.map(AdminOrderResponse::from);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<AdminOrderResponse> getOrder(@PathVariable String orderCode) {
        Order order = adminOrderService.getOrder(orderCode);
        return ResponseEntity.ok(AdminOrderResponse.from(order));
    }

    @PostMapping("/{orderCode}/ready")
    public ResponseEntity<AdminOrderResponse> transitionToReady(@PathVariable String orderCode) {
        Order order = adminOrderService.transitionToReady(orderCode);
        return ResponseEntity.ok(AdminOrderResponse.from(order));
    }

    @PostMapping("/{orderCode}/ship")
    public ResponseEntity<AdminOrderResponse> transitionToShipping(
            @PathVariable String orderCode,
            @RequestBody ShipRequest request
    ) {
        Order order = adminOrderService.transitionToShipping(orderCode, request.getCarrier(), request.getInvoiceNo());
        return ResponseEntity.ok(AdminOrderResponse.from(order));
    }

    @PostMapping("/{orderCode}/deliver")
    public ResponseEntity<AdminOrderResponse> transitionToDelivered(@PathVariable String orderCode) {
        Order order = adminOrderService.transitionToDelivered(orderCode);
        return ResponseEntity.ok(AdminOrderResponse.from(order));
    }

    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<AdminOrderResponse> cancelOrder(@PathVariable String orderCode) {
        Order order = adminOrderService.cancelOrder(orderCode);
        return ResponseEntity.ok(AdminOrderResponse.from(order));
    }
}
