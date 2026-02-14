package com.lendy.backend.orders.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class GuestOrderResponse {

    private String orderCode;
    private String status;

    // Buyer info
    private String buyerName;
    private String buyerPhone;

    // Receiver/shipping info
    private String receiverName;
    private String receiverPhone;
    private String address1;
    private String address2;
    private String zipCode;

    // Pricing
    private Integer subtotalAmount;
    private Integer shippingFee;
    private Integer totalAmount;

    // Tracking
    private String carrier;
    private String invoiceNo;

    // Items
    private List<OrderItemInfo> items;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    public static class OrderItemInfo {
        private String productName;
        private String optionDescription;
        private Integer quantity;
        private Integer unitPrice;
        private Integer totalPrice;
    }
}
