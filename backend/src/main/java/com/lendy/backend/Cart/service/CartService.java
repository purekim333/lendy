package com.lendy.backend.Cart.service;

import com.lendy.backend.Cart.dto.CartItemDto;
import com.lendy.backend.Cart.dto.CartResponse;
import com.lendy.backend.Cart.entity.Cart;
import com.lendy.backend.Cart.repository.CartRepository;
import com.lendy.backend.Product.entity.ProductOption;
import com.lendy.backend.Product.repository.ProductOptionReposiotry;
import com.lendy.backend.User.entity.UserEntity;
import com.lendy.backend.User.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductOptionReposiotry productOptionReposiotry;

    @Transactional
    public Integer addToCart(String username, Integer productOptionId, int quantity){
        if (quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");
        // 유저가 없다면 취소
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("회원등록된 사용자가 아닙니다"));

        // 상품이 없다면 취소
        ProductOption option = productOptionReposiotry.findById(productOptionId)
                .orElseThrow(() -> new EntityNotFoundException("해당 상품 옵션을 찾을 수 없습니다"));

        Cart.CartId id = new Cart.CartId(user.getId(), option.getId());
        Cart cartItem = cartRepository.findById(id).orElse(null);

        if (cartItem == null) {
            cartItem = new Cart(user, option, quantity);
            cartRepository.save(cartItem);
        } else {
            cartItem.increaseQuantity(quantity);
        }
        // 4) 성공 시 productOptionId 반환
        return productOptionId;
    }

    @Transactional(readOnly = true)
    public CartResponse showMyCart(String username){
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("회원이 아닙니다."));

        List<CartItemDto> items = cartRepository.findCartItems(user.getId());

        float totalPrice = 0f;
        int totalCount = 0;
        for (CartItemDto d : items) {
            totalPrice += d.unitTotalPrice();
            totalCount += d.count();
        }
        return new CartResponse(items, totalPrice, totalCount);
    }

    @Transactional
    public void deleteMyCart(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("누구냐 너!!!"));

        cartRepository.deleteAllByUserEntity_Id(user.getId());
    }

    @Transactional
    public Integer changeCart(String username, Integer productOptionId, int delta) {
        if (delta == 0 ) return productOptionId;

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("회원등록된 사용자가 아닙니다"));
        ProductOption option = productOptionReposiotry.findById(productOptionId)
                .orElseThrow(() -> new EntityNotFoundException("해당 상품 옵션을 찾을 수 없습니다"));

        Cart.CartId id = new Cart.CartId(user.getId(), option.getId());
        Cart cartItem = cartRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("장바구니에 해당 옵션이 없습니다"));

        int newQty = cartItem.getQuantity() + delta;
        if (newQty <= 0) {
            // 0 이하 → 삭제
            cartRepository.deleteById(id);
        } else {
            cartItem.changeQuantity(newQty);
        }
        return productOptionId;
    }

    @Transactional
    public Integer deleteItemFromMyCart(String username, Integer productOptionId) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("회원등록된 사용자가 아닙니다"));
        ProductOption option = productOptionReposiotry.findById(productOptionId)
                .orElseThrow(() -> new EntityNotFoundException("해당 상품 옵션을 찾을 수 없습니다"));

        Cart.CartId id = new Cart.CartId(user.getId(), option.getId());
        cartRepository.deleteById(id);
        return productOptionId;
    }
}
