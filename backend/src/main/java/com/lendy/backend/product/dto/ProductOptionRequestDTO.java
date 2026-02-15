package com.lendy.backend.product.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductOptionRequestDTO {
    private String size;
    private Integer count;
    private Integer buyPrice;
    private Integer rentalPrice;

}
