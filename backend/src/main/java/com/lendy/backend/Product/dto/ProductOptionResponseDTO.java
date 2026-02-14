package com.lendy.backend.Product.dto;

import com.lendy.backend.Product.entity.ProductOption;
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
    private Float buyPrice;
    private Float rentalPrice;

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
