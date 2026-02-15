package com.lendy.backend.cart.controller;

import com.lendy.backend.cart.dto.CartResponse;
import com.lendy.backend.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;


@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    //장바구니 조회
    @GetMapping("/items")
    public ResponseEntity<CartResponse> showMyCart (Principal principal) {
        String username = principal.getName();
        return ResponseEntity.ok(cartService.showMyCart(username));
    }

    // 장바구니 전체 삭제
    @DeleteMapping("/items")
    public ResponseEntity<String> deleteMyCart(Principal principal) {
        String username = principal.getName();
        cartService.deleteMyCart(username);
        return ResponseEntity.ok( "장바구니 전체 삭제 완료");
    }

    //카트에 물건 담기
    @PostMapping("/items/{productOptionId}")
    public ResponseEntity<String> addToCart(
            @PathVariable Integer productOptionId,
            @RequestParam(name = "quantity", defaultValue = "1") int quantity,
            Principal principal) {

        String username = principal.getName();
        Integer addedItemId = cartService.addToCart(username, productOptionId, quantity);
        return ResponseEntity.ok(addedItemId + " 아이템 추가 완료");
    }

    // 장바구니 물건 수정하기
    @PatchMapping("/items/{productOptionId}")
    public ResponseEntity<String> changeCart(
            @PathVariable Integer productOptionId,
            @RequestParam(name = "delta") int delta,
            Principal principal) {

        String username = principal.getName();
        Integer changedItemId = cartService.changeCart(username, productOptionId, delta);
        return ResponseEntity.ok(changedItemId + " 번 아이템 수량 변경");
    }

    // 장바구니 item 1개 삭제
    @DeleteMapping("/items/{productOptionId}")
    public ResponseEntity<String> deleteItemFromMyCart(
            @PathVariable Integer productOptionId,
            Principal principal) {

        String username = principal.getName();
        return ResponseEntity.ok(cartService.deleteItemFromMyCart(username, productOptionId) + "번 아이템 장바구니에서 삭제 완료");

    }



}
