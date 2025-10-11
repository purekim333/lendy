package com.lendy.backend.Product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "PRODUCT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
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

}
