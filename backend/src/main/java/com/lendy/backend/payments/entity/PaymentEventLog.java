package com.lendy.backend.payments.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENT_EVENT_LOG",
        indexes = {
                @Index(name = "idx_event_merchant_uid", columnList = "merchant_uid"),
                @Index(name = "idx_event_created_at", columnList = "created_at")
        })
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "merchant_uid", nullable = false, length = 50)
    private String merchantUid;

    @Column(name = "imp_uid", length = 50)
    private String impUid;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType;

    @Column(name = "source", nullable = false, length = 20)
    private String source;

    @Column(name = "amount")
    private Integer amount;

    @Lob
    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @Column(name = "processing_result", length = 50)
    private String processingResult;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public static PaymentEventLog fromWebhook(String merchantUid, String impUid, Integer amount, String rawPayload) {
        return PaymentEventLog.builder()
                .merchantUid(merchantUid)
                .impUid(impUid)
                .amount(amount)
                .eventType("WEBHOOK")
                .source("PORTONE")
                .rawPayload(redactSensitiveData(rawPayload))
                .build();
    }

    public static PaymentEventLog fromVerify(String merchantUid, String impUid, Integer amount, String result) {
        return PaymentEventLog.builder()
                .merchantUid(merchantUid)
                .impUid(impUid)
                .amount(amount)
                .eventType("VERIFY")
                .source("API")
                .processingResult(result)
                .build();
    }

    private static String redactSensitiveData(String payload) {
        if (payload == null) return null;
        // Simple redaction - in production, use a proper JSON parser
        return payload.replaceAll("\"buyer_name\":\"[^\"]*\"", "\"buyer_name\":\"[REDACTED]\"")
                .replaceAll("\"buyer_email\":\"[^\"]*\"", "\"buyer_email\":\"[REDACTED]\"")
                .replaceAll("\"buyer_tel\":\"[^\"]*\"", "\"buyer_tel\":\"[REDACTED]\"");
    }
}
