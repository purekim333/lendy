package com.lendy.backend.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyOrderResponse {

    private String orderCode;
    private String status;
    private Integer totalAmount;
    private LocalDateTime createdAt;
    private String firstItemName;
    private Integer itemCount;
    private String firstItemImageUrl;
}
