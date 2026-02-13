package com.lendy.backend.Order.controller;

import com.lendy.backend.Order.dto.CreateOrderFromCartRequest;
import com.lendy.backend.Order.dto.OrderResponse;
import com.lendy.backend.Order.entity.Order;
import com.lendy.backend.Order.repository.OrderRepository;
import com.lendy.backend.Order.service.OrderService;;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 주문 컨트롤러
 * - 카트 기반 주문 생성
 * - 주문 목록 / 상세 조회
 * - 주문 상태 변경 (예: 취소 등)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    /** ✅ 카트 기반 주문 생성 */
    @PostMapping("/from-cart")
    public ResponseEntity<OrderResponse> createFromCart(
            @RequestAttribute("userId") Long userId, // 또는 @AuthenticationPrincipal 사용
            @RequestBody CreateOrderFromCartRequest req
    ) {
        OrderResponse result = orderService.createOrderFromCart(userId, req);
        return ResponseEntity.ok(result);
    }

    /** ✅ 단일 주문 조회 */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetail(
            @PathVariable Integer orderId
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
        OrderResponse response = OrderResponse.of(order, order.getOrderDetails());
        return ResponseEntity.ok(response);
    }

    /** ✅ 사용자별 주문 목록 */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @RequestAttribute("userId") Long userId // JWT 필터에서 주입
    ) {
        List<Order> orders = orderRepository.findAllByUserEntityIdOrderByOrderDateDesc(userId);
        List<OrderResponse> responses = orders.stream()
                .map(o -> OrderResponse.of(o, o.getOrderDetails()))
                .toList();
        return ResponseEntity.ok(responses);
    }

    /** ✅ 주문 취소 (결제 완료 전 상태만) */
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(
            @PathVariable Integer orderId,
            @RequestAttribute("userId") Long userId
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));

        if (!order.getUserEntity().getId().equals(userId)) {
            throw new IllegalArgumentException("본인 주문만 취소할 수 있습니다.");
        }

        if (order.getStatus() == Order.Status.PAID
                || order.getStatus() == Order.Status.PREPARING) {
            order.setStatus(Order.Status.CANCELED);
            orderRepository.save(order);
            return ResponseEntity.ok("주문이 취소되었습니다.");
        }
        return ResponseEntity.badRequest().body("취소 불가 상태입니다.");
    }
}
