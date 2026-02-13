package com.lendy.backend.Order.dto;

import lombok.Getter;

@Getter
public class OrderDetailRequest {
    private Integer productOptionId;
    private Integer qty;
    private Integer unitPrice;
    private Integer discountAmount;
}