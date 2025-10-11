package com.lendy.backend.Cart.dto;


import java.util.List;

public record CartResponse (
        List<CartItemDto> myCart,
        Float totalPrice,
        Integer totalCount
) {
}
