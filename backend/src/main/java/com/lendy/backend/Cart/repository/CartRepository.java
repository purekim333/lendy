package com.lendy.backend.cart.repository;

import com.lendy.backend.cart.dto.CartItemDto;
import com.lendy.backend.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, Cart.CartId> {

    // 장바구니 화면 DTO 한 방 조회 (구매가 기준; 대여가면 rental_price로 바꾸세요)
    @Query("""
      select new com.lendy.backend.cart.dto.CartItemDto(
        pi.imageURL,
        p.productName,
        p.color,
        po.size,
        c.quantity,
        po.buyPrice,
        (po.buyPrice * c.quantity)
      )
      from Cart c
      join c.productOption po
      join po.product p
      left join com.lendy.backend.product.entity.ProductImage pi
             on pi.product = p and pi.isMain = true
      where c.userEntity.id = :userId
        and c.isDeleted = false
    """)
    List<CartItemDto> findCartItems(@Param("userId") Long id);

    // 유저별 전체 삭제 (하드 삭제)
    long deleteAllByUserEntity_Id(Long userId);


    @Query("""
        select c from Cart c
        join fetch c.productOption po
        where c.userEntity.id = :userId and c.isDeleted = false
    """)
    List<Cart> findByUserEntityId(@Param("userId") Long userId);

    @Query("""
        select c from Cart c
        join fetch c.productOption po
        where c.userEntity.id = :userId and c.isDeleted = false and po.id in :optionIds
    """)
    List<Cart> findByUserEntityIdAndOptionIds(@Param("userId") Long userId,
                                              @Param("optionIds") List<Integer> optionIds);
}
