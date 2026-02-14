package com.lendy.backend.product.repository;

import com.lendy.backend.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Integer> {
    List<ProductImage> findByProductId(Integer productId);
    Optional<ProductImage> findByProductIdAndIsMainTrue(Integer productId);
}
