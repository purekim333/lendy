package com.lendy.backend.orders.service;

import com.lendy.backend.orders.dto.OrderAdminResponse;
import com.lendy.backend.orders.entity.Order;
import com.lendy.backend.orders.entity.OrderStatus;
import com.lendy.backend.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public Page<OrderAdminResponse> listOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStatus(status, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }
        return orders.map(this::toAdminResponse);
    }

    public OrderAdminResponse getOrder(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderCode));
        return toAdminResponse(order);
    }

    @Transactional
    public void updateStatus(String orderCode, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderCode));

        // Validate status transition
        validateStatusTransition(order.getStatus(), newStatus);

        order.updateStatus(newStatus);
        orderRepository.save(order);
    }

    @Transactional
    public void markAsShipping(String orderCode, String carrier, String invoiceNo) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderCode));

        if (order.getStatus() != OrderStatus.READY && order.getStatus() != OrderStatus.PAID) {
            throw new IllegalStateException("Order must be in READY or PAID status to mark as shipping");
        }

        order.updateStatus(OrderStatus.SHIPPING);
        order.setTrackingInfo(carrier, invoiceNo);
        orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderCode));

        // Can only cancel if not yet shipped
        if (order.getStatus() == OrderStatus.SHIPPING || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel order that has already been shipped");
        }

        order.updateStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // TODO: Trigger refund via payment service if already paid
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        // Define valid transitions
        boolean valid = switch (current) {
            case PAYMENT_PENDING -> next == OrderStatus.PAID || next == OrderStatus.CANCELLED;
            case PAID -> next == OrderStatus.READY || next == OrderStatus.CANCELLED;
            case READY -> next == OrderStatus.SHIPPING || next == OrderStatus.CANCELLED;
            case SHIPPING -> next == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false; // Terminal states
        };

        if (!valid) {
            throw new IllegalStateException(
                    String.format("Invalid status transition from %s to %s", current, next));
        }
    }

    private OrderAdminResponse toAdminResponse(Order order) {
        return OrderAdminResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .buyerName(order.getBuyerName())
                .buyerPhone(order.getBuyerPhone())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .address1(order.getAddress1())
                .address2(order.getAddress2())
                .zipCode(order.getZipCode())
                .carrier(order.getCarrier())
                .invoiceNo(order.getInvoiceNo())
                .merchantUid(order.getMerchantUid())
                .items(order.getItems().stream()
                        .map(item -> OrderAdminResponse.OrderItemResponse.builder()
                                .productName(item.getProductName())
                                .optionDescription(item.getOptionDescription())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .build())
                        .toList())
                .build();
    }
}
