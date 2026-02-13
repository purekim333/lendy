package com.lendy.backend.Order.entity;

import com.lendy.backend.Product.entity.ProductOption;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "order_detail")
public class OrderDetail {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", foreignKey = @ForeignKey(name = "fk_detail_order"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_option_id", foreignKey = @ForeignKey(name = "fk_detail_option"))
    private ProductOption productOption;

    @Column(name = "unit_price", nullable = false)
    private Integer unitPrice;

    @Column(name = "qty", nullable = false)
    private Integer qty;

    @Column(name = "discount_amount", nullable = false)
    private Integer discountAmount;

    @Column(name = "subtotal_amount", nullable = false)
    private Integer subtotalAmount;

    public static OrderDetail create(Order order, ProductOption option,
                                     int unitPrice, int qty, int discount, int subtotal) {
        OrderDetail d = new OrderDetail();
        d.order = order;
        d.productOption = option;
        d.unitPrice = unitPrice;
        d.qty = qty;
        d.discountAmount = discount;
        d.subtotalAmount = subtotal;
        return d;
    }
}
