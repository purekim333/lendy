package com.lendy.backend.orders.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ORDERS")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 36)
    private String orderCode;

    @Column(name = "order_access_key_hash", nullable = false, length = 64)
    private String orderAccessKeyHash;

    // Guest buyer fields
    @Column(name = "buyer_name", nullable = false, length = 100)
    private String buyerName;

    @Column(name = "buyer_phone", nullable = false, length = 20)
    private String buyerPhone;

    @Column(name = "buyer_email", length = 255)
    private String buyerEmail;

    // Shipping address fields
    @Column(name = "receiver_name", nullable = false, length = 100)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Column(name = "address1", nullable = false, length = 255)
    private String address1;

    @Column(name = "address2", length = 255)
    private String address2;

    @Column(name = "zip_code", nullable = false, length = 10)
    private String zipCode;

    @Column(name = "delivery_message", length = 500)
    private String deliveryMessage;

    // Pricing snapshot (immutable)
    @Column(name = "subtotal_amount", nullable = false)
    private Integer subtotalAmount;

    @Column(name = "shipping_fee", nullable = false)
    private Integer shippingFee;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PAYMENT_PENDING;

    @Column(name = "merchant_uid", nullable = false, unique = true, length = 50)
    private String merchantUid;

    // Tracking info (filled after shipping)
    @Column(name = "carrier", length = 50)
    private String carrier;

    @Column(name = "invoice_no", length = 50)
    private String invoiceNo;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public static String generateOrderCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
    }

    public void setTrackingInfo(String carrier, String invoiceNo) {
        this.carrier = carrier;
        this.invoiceNo = invoiceNo;
    }
}
