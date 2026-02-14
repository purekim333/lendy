package com.lendy.backend.orders.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderAdminResponse {

    private Long id;
    private String orderCode;
    private String status;
    private Integer totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String buyerName;
    private String buyerPhone;
    private String receiverName;
    private String receiverPhone;
    private String address1;
    private String address2;
    private String zipCode;

    private String carrier;
    private String invoiceNo;

    private String merchantUid;

    private List<OrderItemResponse> items;

    @Getter
    @Builder
    public static class OrderItemResponse {
        private String productName;
        private String optionDescription;
        private Integer quantity;
        private Integer unitPrice;
        private Integer totalPrice;
    }
}
