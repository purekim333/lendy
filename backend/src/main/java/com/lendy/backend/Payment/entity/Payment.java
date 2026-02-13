package com.lendy.backend.Payment.entity;

import com.lendy.backend.Order.entity.Order;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "payment", indexes = {
        @Index(name = "idx_payment_merchant_uid", columnList = "merchant_uid", unique = true),
        @Index(name = "idx_payment_imp_uid", columnList = "imp_uid", unique = true)
})
public class Payment {

    public enum Status {
        READY, PAID, PARTIAL_CANCELED, CANCELED, FAILED
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", foreignKey = @ForeignKey(name = "fk_payment_order"))
    private Order order;

    @Column(name = "imp_uid", nullable = false, length = 100, unique = true)
    private String impUid;

    @Column(name = "merchant_uid", nullable = false, length = 100, unique = true)
    private String merchantUid;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Column(name = "pg_provider", length = 50)
    private String pgProvider;

    @Column(name = "pg_tid", length = 100)
    private String pgTid;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status;

    @CreationTimestamp
    @Column(name = "paid_at", updatable = false)
    private LocalDateTime paidAt;

    public static Payment ready(Order order, String merchantUid, Integer expectedAmount) {
        Payment p = new Payment();
        p.order = order;
        p.merchantUid = merchantUid;
        p.amount = expectedAmount;
        p.status = Status.READY;
        return p;
    }

    public void markPaid(String impUid, String pgProvider, String pgTid, int paidAmount) {
        this.impUid = impUid;
        this.pgProvider = pgProvider;
        this.pgTid = pgTid;
        this.amount = paidAmount;
        this.status = Status.PAID;
    }

    public void markCanceled(boolean partial) {
        this.status = partial ? Status.PARTIAL_CANCELED : Status.CANCELED;
    }

    public void markFailed() {
        this.status = Status.FAILED;
    }
}
