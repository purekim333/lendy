package com.lendy.backend.product.dto;

import com.lendy.backend.product.entity.Product;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminProductResponseDTO {
    private Integer id;
    private String productName;
    private String type;
    private String tag;
    private String color;
    private Integer buyPrice;
    private Integer rentalPrice;
    private Boolean isPublished;
    private String mainImageUrl;
    private Integer optionCount;
    private LocalDateTime createdAt;

    public static AdminProductResponseDTO of(Product product, String mainImageUrl, Integer optionCount) {
        return AdminProductResponseDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .type(product.getType())
                .tag(product.getTag())
                .color(product.getColor())
                .buyPrice(product.getBuyPrice())
                .rentalPrice(product.getRentalPrice())
                .isPublished(product.getIsPublished())
                .mainImageUrl(mainImageUrl)
                .optionCount(optionCount)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
