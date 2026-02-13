package com.lendy.backend.Order.entity;

import com.lendy.backend.User.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "orders")
public class Order {

    public enum Status {
        PENDING_PAYMENT, PREPARING, SHIPPING, COMPLETED, CANCELED, PAID
    }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_order_user"))
    private UserEntity userEntity;

    @Column(name = "order_no", nullable = false, unique = true, length = 50)
    private String orderNo;

    @Column(name = "recipient_name", length = 20)
    private String recipientName;

    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;

    @Column(name = "address", length = 100)
    private String address;

    @Column(name = "address_detail", length = 100)
    private String addressDetail;

    @Column(name = "shipping_memo", length = 100)
    private String shippingMemo;

    @Column(name = "enter_memo", length = 50)
    private String enterMemo;

    @Column(name = "post_code", length = 10)
    private String postCode;

    @Column(name = "items_total_amount", nullable = false)
    private Integer itemsTotalAmount;

    @Column(name = "discount_total_amount", nullable = false)
    private Integer discountTotalAmount;

    @Column(name = "use_point_amount", nullable = false)
    private Integer usePointAmount;

    @Column(name = "shipping_cost", nullable = false)
    private Integer shippingCost;

    @Column(name = "grand_total_amount", nullable = false)
    private Integer grandTotalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status;

    @CreationTimestamp
    @Column(name = "order_date", nullable = false, updatable = false)
    private LocalDateTime orderDate;

    public static Order create(UserEntity user,
                               String orderNo,
                               String recipientName,
                               String recipientPhone,
                               String address,
                               String addressDetail,
                               String shippingMemo,
                               String enterMemo,
                               String postCode,
                               int itemsTotal,
                               int discountTotal,
                               int usePoint,
                               int shippingCost,
                               Status status) {

        Order o = new Order();
        o.userEntity = user;
        o.orderNo = orderNo;
        o.recipientName = recipientName;
        o.recipientPhone = recipientPhone;
        o.address = address;
        o.addressDetail = addressDetail;
        o.shippingMemo = shippingMemo;
        o.enterMemo = enterMemo;
        o.postCode = postCode;
        o.itemsTotalAmount = itemsTotal;
        o.discountTotalAmount = discountTotal;
        o.usePointAmount = usePoint;
        o.shippingCost = shippingCost;
        o.grandTotalAmount = itemsTotal + shippingCost - discountTotal - usePoint;
        o.status = status != null ? status : Status.PREPARING;
        return o;
    }
}
