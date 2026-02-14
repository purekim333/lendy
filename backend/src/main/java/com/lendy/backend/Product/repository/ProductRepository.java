package com.lendy.backend.product.repository;

import com.lendy.backend.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByIsPublishedTrueAndIsDeletedFalse();
}
