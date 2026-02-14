package com.lendy.backend.orders.dto;

import com.lendy.backend.orders.entity.Order;
import com.lendy.backend.orders.entity.OrderItem;
import com.lendy.backend.orders.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderResponse {

    private Long id;
    private String orderCode;
    private String buyerName;
    private String buyerPhone;
    private String buyerEmail;
    private String receiverName;
    private String receiverPhone;
    private String address1;
    private String address2;
    private String zipCode;
    private String deliveryMessage;
    private Integer subtotalAmount;
    private Integer shippingFee;
    private Integer totalAmount;
    private OrderStatus status;
    private String merchantUid;
    private String carrier;
    private String invoiceNo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDto> items;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long id;
        private Integer productOptionId;
        private String productName;
        private String optionDescription;
        private Integer quantity;
        private Integer unitPrice;
        private Integer totalPrice;
        private String imageUrl;

        public static OrderItemDto from(OrderItem item) {
            return OrderItemDto.builder()
                    .id(item.getId())
                    .productOptionId(item.getProductOptionId())
                    .productName(item.getProductName())
                    .optionDescription(item.getOptionDescription())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalPrice(item.getTotalPrice())
                    .imageUrl(item.getImageUrl())
                    .build();
        }
    }

    public static AdminOrderResponse from(Order order) {
        return AdminOrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .buyerName(order.getBuyerName())
                .buyerPhone(order.getBuyerPhone())
                .buyerEmail(order.getBuyerEmail())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .address1(order.getAddress1())
                .address2(order.getAddress2())
                .zipCode(order.getZipCode())
                .deliveryMessage(order.getDeliveryMessage())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .merchantUid(order.getMerchantUid())
                .carrier(order.getCarrier())
                .invoiceNo(order.getInvoiceNo())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getItems().stream()
                        .map(OrderItemDto::from)
                        .collect(Collectors.toList()))
                .build();
    }
}
