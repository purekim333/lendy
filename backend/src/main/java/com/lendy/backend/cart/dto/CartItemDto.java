package com.lendy.backend.cart.dto;

public record CartItemDto(
                Integer productOptionId,
                Integer productId,
                String imageURL,
                String productName,
                String color,
                String size,
                Integer count,
                Integer unitPrice,
                Integer unitTotalPrice) {
}
