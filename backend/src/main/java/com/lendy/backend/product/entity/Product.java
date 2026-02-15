package com.lendy.backend.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "PRODUCT")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_name", nullable = false, length = 30)
    private String productName;

    @Column(name = "type", nullable = false, length = 15)
    private String type;

    @Column(name = "tag", nullable = false, length = 10)
    private String tag;

    @Column(name = "color", nullable = false, length = 10)
    private String color;

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "buy_price", nullable = false)
    private Integer buyPrice;

    @Column(name = "rental_price", nullable = false)
    private Integer rentalPrice;

    @Column(name = "thickness", nullable = false)
    private Byte thickness;

    @Column(name = "elasticity", nullable = false)
    private Byte elasticity;

    @Column(name = "lining", nullable = false)
    private Byte lining;

    @Column(name = "hand_feel", nullable = false)
    private Byte handFeel;

    @Column(name = "see_through", nullable = false)
    private Byte seeThrough;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false,updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "is_pulished", nullable = false)
    private Boolean isPublished;

    @Builder
    private Product(
            String productName, String type, String tag, String color, String description,
            Integer buyPrice, Integer rentalPrice,
            Byte thickness, Byte elasticity, Byte lining, Byte handFeel, Byte seeThrough,
            Boolean isDeleted, Boolean isPublished
    ) {
        this.productName = productName;
        this.type = type;
        this.tag = tag;
        this.color = color;
        this.description = description;
        this.buyPrice = buyPrice;
        this.rentalPrice = rentalPrice;
        this.thickness = thickness;
        this.elasticity = elasticity;
        this.lining = lining;
        this.handFeel = handFeel;
        this.seeThrough = seeThrough;
        this.isDeleted = (isDeleted != null) ? isDeleted : Boolean.FALSE;   // 기본값
        this.isPublished = (isPublished != null) ? isPublished : Boolean.TRUE; // 기본값
    }

    @PrePersist
    protected void onCreateDefaults() {
        if (isDeleted == null)   isDeleted = false;
        if (isPublished == null) isPublished = true;
    }
}
