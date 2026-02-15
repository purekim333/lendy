package com.lendy.backend.product.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductCreateRequestDTO {
    private String name;
    private String type;
    private String tag;
    private String color;
    private Integer buyPrice;
    private Integer rentalPrice;
    private String description;
    private Byte thickness;
    private Byte elasticity;
    private Byte lining;
    private Byte handFeel;
    private Byte seeThrough;

    private List<ProductOptionRequestDTO> options;


}
