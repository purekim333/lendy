package com.lendy.backend.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PRODUCT_OPTION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    private Integer buyPrice;

    @Column(name = "rental_price", nullable = false)
    private Integer rentalPrice;

    @Builder
    private ProductOption(Product product, String size, Integer count, Integer buyPrice, Integer rentalPrice) {
        this.product = product;
        this.size = size;
        this.count = count;
        this.buyPrice = buyPrice;
        this.rentalPrice = rentalPrice;
    }

    public void decreaseStock(int quantity) {
        if (this.count < quantity) {
            throw new IllegalStateException(
                "재고 부족: " + this.product.getProductName() + " (" + this.size + ") - 남은 수량: " + this.count);
        }
        this.count -= quantity;
    }

    public void increaseStock(int quantity) {
        this.count += quantity;
    }
}
