package com.lendy.backend.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ShipRequest {
    private String carrier;
    private String invoiceNo;
}
