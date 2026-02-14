package com.lendy.backend.payments.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENT_ATTEMPT",
        indexes = {
                @Index(name = "idx_payment_merchant_uid", columnList = "merchant_uid"),
                @Index(name = "idx_payment_imp_uid", columnList = "imp_uid")
        })
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "merchant_uid", nullable = false, unique = true, length = 50)
    private String merchantUid;

    @Column(name = "imp_uid", unique = true, length = 50)
    private String impUid;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.CREATED;

    @Column(name = "buyer_name", length = 100)
    private String buyerName;

    @Column(name = "buyer_email", length = 255)
    private String buyerEmail;

    @Column(name = "buyer_tel", length = 20)
    private String buyerTel;

    @Column(name = "pay_method", length = 20)
    private String payMethod;

    @Column(name = "pg_provider", length = 30)
    private String pgProvider;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_msg", length = 500)
    private String errorMsg;

    @Version
    @Column(name = "version")
    @Builder.Default
    private Long version = 0L;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void markAsRequested() {
        if (this.status == PaymentStatus.CREATED) {
            this.status = PaymentStatus.REQUESTED;
        }
    }

    public void markAsPaid(String impUid, String payMethod, String pgProvider, String receiptUrl) {
        this.impUid = impUid;
        this.payMethod = payMethod;
        this.pgProvider = pgProvider;
        this.receiptUrl = receiptUrl;
        this.status = PaymentStatus.PAID;
    }

    public void markAsFailed(String errorCode, String errorMsg) {
        this.errorCode = errorCode;
        this.errorMsg = errorMsg;
        this.status = PaymentStatus.FAILED;
    }

    public boolean isTerminal() {
        return this.status == PaymentStatus.PAID ||
               this.status == PaymentStatus.FAILED ||
               this.status == PaymentStatus.CANCELLED ||
               this.status == PaymentStatus.REFUNDED;
    }

    public boolean isPaid() {
        return this.status == PaymentStatus.PAID;
    }

    public void markAsCancelled() {
        this.status = PaymentStatus.CANCELLED;
    }
}
