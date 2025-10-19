package com.lendy.backend.Product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "PRODUCT_IMAGE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_product_image_product"))
    private Product product;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain;

    @Column(name = "image_URL", nullable = false, length = 512)
    private String imageURL;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false,updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private ProductImage(Product product, Boolean isMain, String imageURL) {
        this.product = product;
        this.isMain = isMain;
        this.imageURL = imageURL;
    }
}

