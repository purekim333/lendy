package com.lendy.backend.Order.service;

import com.lendy.backend.Cart.entity.Cart;
import com.lendy.backend.Cart.repository.CartRepository;
import com.lendy.backend.Order.dto.CreateOrderFromCartRequest;
import com.lendy.backend.Order.dto.OrderResponse;
import com.lendy.backend.Order.entity.Order;
import com.lendy.backend.Order.entity.OrderDetail;
import com.lendy.backend.Order.repository.OrderDetailRepository;
import com.lendy.backend.Order.repository.OrderRepository;
import com.lendy.backend.Product.entity.ProductOption;
import com.lendy.backend.Product.repository.ProductOptionRepository;
import com.lendy.backend.User.entity.UserEntity;
import com.lendy.backend.User.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CartRepository cartRepository;
    private final ProductOptionRepository productOptionRepository;
    private final UserRepository userRepository;

    private static final int FREE_SHIPPING_THRESHOLD = 50_000;
    private static final int SHIPPING_COST = 3_000;

    @Transactional
    public OrderResponse createOrderFromCart(Long userId, CreateOrderFromCartRequest req) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        List<Cart> carts = (req.productOptionIds() == null || req.productOptionIds().isEmpty())
                ? cartRepository.findByUserEntityId(userId)
                : cartRepository.findByUserEntityIdAndOptionIds(userId, req.productOptionIds());

        if (carts.isEmpty()) throw new IllegalArgumentException("유효한 카트 없음");

        int itemsTotal = 0;
        List<OrderDetail> details = new ArrayList<>();

        for (Cart c : carts) {
            ProductOption opt = productOptionRepository.findByIdForUpdate(c.getProductOption().getId())
                    .orElseThrow(() -> new IllegalArgumentException("상품 옵션 없음"));

            int unitPrice = Math.toIntExact(Math.round(opt.getRentalPrice()));
            int qty = c.getQuantity();
            int discount = 0;
            int subtotal = unitPrice * qty - discount;
            itemsTotal += subtotal;

            details.add(OrderDetail.create(null, opt, unitPrice, qty, discount, subtotal));
        }

        int shippingCost = itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        int discountTotal = details.stream().mapToInt(OrderDetail::getDiscountAmount).sum();
        int usePoint = req.usePointAmount() == null ? 0 : req.usePointAmount();

        String orderNo = "LNDY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.create(
                user, orderNo,
                req.recipientName(), req.recipientPhone(),
                req.address(), req.addressDetail(),
                req.shippingMemo(), req.enterMemo(), req.postCode(),
                itemsTotal, discountTotal, usePoint, shippingCost,
                Order.Status.PREPARING
        );

        orderRepository.save(order);
        details.forEach(d -> d.setOrder(order));
        orderDetailRepository.saveAll(details);
        cartRepository.deleteAll(carts);

        return OrderResponse.of(order, details);
    }
}
