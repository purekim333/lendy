package com.lendy.backend.product.dto;

import com.lendy.backend.product.entity.Product;
import com.lendy.backend.product.entity.ProductImage;
import com.lendy.backend.product.entity.ProductOption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ProductDetailResponseDTO {
    private Integer id;
    private String productName;
    private String type;
    private String tag;
    private String color;
    private String description;
    private Integer buyPrice;
    private Integer rentalPrice;
    private Byte thickness;
    private Byte elasticity;
    private Byte lining;
    private Byte handFeel;
    private Byte seeThrough;
    private List<ProductOptionResponseDTO> options;
    private List<String> imageUrls;

    public static ProductDetailResponseDTO of(Product product, List<ProductOption> options, List<ProductImage> images) {
        return ProductDetailResponseDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .type(product.getType())
                .tag(product.getTag())
                .color(product.getColor())
                .description(product.getDescription())
                .buyPrice(product.getBuyPrice())
                .rentalPrice(product.getRentalPrice())
                .thickness(product.getThickness())
                .elasticity(product.getElasticity())
                .lining(product.getLining())
                .handFeel(product.getHandFeel())
                .seeThrough(product.getSeeThrough())
                .options(options.stream().map(ProductOptionResponseDTO::of).toList())
                .imageUrls(images.stream().map(ProductImage::getImageURL).toList())
                .build();
    }
}
