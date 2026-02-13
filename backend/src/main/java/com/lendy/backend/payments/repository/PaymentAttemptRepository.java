package com.lendy.backend.payments.repository;

import com.lendy.backend.payments.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, Long> {

    Optional<PaymentAttempt> findByMerchantUid(String merchantUid);

    Optional<PaymentAttempt> findByImpUid(String impUid);

    boolean existsByMerchantUid(String merchantUid);
}
