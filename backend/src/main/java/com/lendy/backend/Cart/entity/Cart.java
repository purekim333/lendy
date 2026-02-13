package com.lendy.backend.Cart.entity;

import com.lendy.backend.Product.entity.ProductOption;
import com.lendy.backend.User.entity.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table( name = "CART",
        uniqueConstraints = @UniqueConstraint(
                name="uk_cart_user_option",
                columnNames={"user_entity_id","product_option_id"}
        ))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cart {

    @EmbeddedId
    private CartId id;

    @ManyToOne
    @MapsId("userEntityId")
    @JoinColumn(name = "user_entity_id", foreignKey = @ForeignKey(name = "fk_cart_user_entity"))
    private UserEntity userEntity;

    @ManyToOne
    @MapsId("productOptionId")
    @JoinColumn(name = "product_option_id", foreignKey = @ForeignKey(name = "fk_cart_product_option"))
    private ProductOption productOption;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public void increaseQuantity(int delta) {
        this.quantity += delta;
    }
    public void changeQuantity(int newQty) {
        this.quantity = newQty;
    }

    public Float getTotalPrice () {
        Float unitPrice = productOption.getBuyPrice();
        return unitPrice * quantity;
    }

    public Cart(
            UserEntity userEntity,
            ProductOption productOption,
            Integer quantity
    ) {
        this.id=new CartId(userEntity.getId(), productOption.getId());
        this.userEntity = userEntity;
        this.productOption = productOption;
        this.quantity = quantity;
        this.isDeleted = false;
        this.createdAt = LocalDateTime.now();
    }

    @Embeddable
    @Getter
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class CartId implements Serializable {
        private Long userEntityId;
        private Integer productOptionId;

        public CartId(Long userEntityId, Integer productOptionId) {
            this.userEntityId = userEntityId;
            this.productOptionId = productOptionId;
        }
    }

}
