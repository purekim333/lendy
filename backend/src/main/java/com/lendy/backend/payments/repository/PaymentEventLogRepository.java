package com.lendy.backend.payments.repository;

import com.lendy.backend.payments.entity.PaymentEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentEventLogRepository extends JpaRepository<PaymentEventLog, Long> {

    List<PaymentEventLog> findByMerchantUidOrderByCreatedAtDesc(String merchantUid);
}
