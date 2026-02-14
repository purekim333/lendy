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
    private Integer subtotalAmount;
    private Integer shippingFee;
    private Integer totalAmount;
    private LocalDateTime createdAt;

    private String receiverName;
    private String receiverPhone;
    private String address1;
    private String address2;
    private String zipCode;
    private String deliveryMessage;

    private String carrier;
    private String invoiceNo;

    private List<GuestOrderItemResponse> items;

    @Getter
    @Builder
    public static class GuestOrderItemResponse {
        private String productName;
        private String optionDescription;
        private Integer quantity;
        private Integer unitPrice;
        private Integer totalPrice;
        private String imageUrl;
    }
}
