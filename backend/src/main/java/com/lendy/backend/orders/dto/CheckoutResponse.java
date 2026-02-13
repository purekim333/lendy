package com.lendy.backend.orders.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckoutResponse {

    private String orderCode;
    private String orderAccessKey;
    private String merchantUid;
    private Integer subtotalAmount;
    private Integer shippingFee;
    private Integer totalAmount;
    private String status;
}
