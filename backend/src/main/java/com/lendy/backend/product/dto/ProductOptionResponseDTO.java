package com.lendy.backend.product.dto;

import com.lendy.backend.product.entity.ProductOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProductOptionResponseDTO {
    private Integer id;
    private String size;
    private Integer count;
    private Integer buyPrice;
    private Integer rentalPrice;

    public static ProductOptionResponseDTO of(ProductOption option) {
        return ProductOptionResponseDTO.builder()
                .id(option.getId())
                .size(option.getSize())
                .count(option.getCount())
                .buyPrice(option.getBuyPrice())
                .rentalPrice(option.getRentalPrice())
                .build();
    }
}
