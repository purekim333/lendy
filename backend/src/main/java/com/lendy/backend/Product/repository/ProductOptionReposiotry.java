package com.lendy.backend.Product.repository;

import com.lendy.backend.Product.entity.ProductOption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductOptionReposiotry extends JpaRepository<ProductOption, Integer> {
}
