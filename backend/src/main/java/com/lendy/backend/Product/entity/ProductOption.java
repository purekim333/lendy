package com.lendy.backend.Product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PRODUCT_OPTION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ProductOption {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_product_option_product"))
    private Product product;

    @Column(name = "size", nullable = false, length = 10)
    private String size;

    @Column(name = "count", nullable = false)
    private Integer count;

    @Column(name = "buy_price", nullable = false)
<<<<<<< HEAD
    private Float buyPrice;

    @Column(name = "rental_price", nullable = false)
    private Float rentalPrice;
=======
    private Integer buyPrice;

    private Integer rentalPrice;
>>>>>>> develop

}
