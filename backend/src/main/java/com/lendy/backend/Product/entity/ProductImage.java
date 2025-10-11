package com.lendy.backend.Product.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
<<<<<<< HEAD
@Table(name = "PRODUCT_IMAGE")
=======
@Table(name = "PRODUCTIMAGE")
>>>>>>> develop
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
<<<<<<< HEAD
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_product_image_product"))
=======
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_productimage_product"))
>>>>>>> develop
    private Product product;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain;

    @Column(name = "image_URL", nullable = false, length = 50)
    private String imageURL;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false,updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

