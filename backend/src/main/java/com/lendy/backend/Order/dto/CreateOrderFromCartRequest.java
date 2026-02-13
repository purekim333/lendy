package com.lendy.backend.Order.dto;

import java.util.List;

public record CreateOrderFromCartRequest(
        List<Integer> productOptionIds,
        String recipientName,
        String recipientPhone,
        String address,
        String addressDetail,
        String shippingMemo,
        String enterMemo,
        String postCode,
        Integer usePointAmount
) {}
