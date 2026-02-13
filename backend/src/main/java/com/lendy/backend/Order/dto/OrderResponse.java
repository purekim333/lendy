package com.lendy.backend.Order.dto;

import com.lendy.backend.Order.entity.Order;
import com.lendy.backend.Order.entity.OrderDetail;
import java.util.List;

public record OrderResponse(
        String orderNo,
        String status,
        Integer totalAmount,
        List<Item> items
) {
    public record Item(String productName, Integer qty, Integer unitPrice, Integer subtotal) {}

    public static OrderResponse of(Order order, List<OrderDetail> details) {
        List<Item> items = details.stream()
                .map(d -> new Item(
                        d.getProductOption().getProduct().getProductName(),
                        d.getQty(),
                        d.getUnitPrice(),
                        d.getSubtotalAmount()
                )).toList();
        return new OrderResponse(order.getOrderNo(), order.getStatus().name(),
                order.getGrandTotalAmount(), items);
    }
}
