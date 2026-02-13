package com.lendy.backend.orders.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ORDER_ITEM")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_item_order"))
    private Order order;

    @Column(name = "product_option_id", nullable = false)
    private Integer productOptionId;

    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @Column(name = "option_description", length = 100)
    private String optionDescription;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    // Immutable pricing snapshot
    @Column(name = "unit_price", nullable = false)
    private Integer unitPrice;

    @Column(name = "total_price", nullable = false)
    private Integer totalPrice;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    public void setOrder(Order order) {
        this.order = order;
    }
}
