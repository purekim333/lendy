package com.lendy.backend.product.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductUpdateRequestDTO {
    private String name;
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
    private Boolean isPublished;
    private List<String> keepImageUrls;
    private List<ProductOptionRequestDTO> options;
}
