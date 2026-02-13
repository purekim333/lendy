package com.lendy.backend.orders.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CheckoutRequest {

    private List<CheckoutItem> items;
    private ShippingInfo shipping;
    private GuestInfo guest;

    @Getter
    @Builder
    public static class CheckoutItem {
        private Integer productOptionId;
        private Integer qty;
    }

    @Getter
    @Builder
    public static class ShippingInfo {
        private String receiverName;
        private String phone;
        private String address1;
        private String address2;
        private String zip;
        private String deliveryMessage;
    }

    @Getter
    @Builder
    public static class GuestInfo {
        private String name;
        private String phone;
        private String email;
    }
}
