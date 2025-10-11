package com.lendy.backend.Cart.dto;

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
