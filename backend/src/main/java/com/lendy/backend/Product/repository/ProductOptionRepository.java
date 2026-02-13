package com.lendy.backend.Product.repository;

import com.lendy.backend.Product.entity.ProductOption;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductOptionRepository extends JpaRepository<ProductOption, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ProductOption p where p.id = :id")
    Optional<ProductOption> findByIdForUpdate(@Param("id") Integer id);
}