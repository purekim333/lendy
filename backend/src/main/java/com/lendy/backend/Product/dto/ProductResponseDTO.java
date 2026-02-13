package com.lendy.backend.Product.dto;

import com.lendy.backend.Product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ProductResponseDTO {
    private Integer id;
    private String name;
    private Integer buyPrice;
    private Integer rentalPrice;
    private String imageURL;

    public static ProductResponseDTO of(Product product, String mainURL) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getProductName())
                .buyPrice(product.getBuyPrice())
                .rentalPrice(product.getRentalPrice())
                .imageURL(mainURL)
                .build();
    }
}
