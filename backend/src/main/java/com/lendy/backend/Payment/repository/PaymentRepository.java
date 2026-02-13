package com.lendy.backend.Payment.repository;

import com.lendy.backend.Payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findByMerchantUid(String merchantUid);
    Optional<Payment> findByImpUid(String impUid);
}
