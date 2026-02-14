package com.lendy.backend.cart.dto;

public record CartItemDto (
        String imageURL,
        String productName,
        String color,
        String size,
        Integer count,
        Float unitPrice,
        Float unitTotalPrice
)
{
}
