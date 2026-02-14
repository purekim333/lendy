package com.lendy.backend.orders.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateTrackingRequest {
    private String carrier;
    private String invoiceNo;
}
