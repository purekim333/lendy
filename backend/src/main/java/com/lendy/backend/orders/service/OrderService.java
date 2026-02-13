package com.lendy.backend.orders.service;

import com.lendy.backend.orders.dto.CheckoutRequest;
import com.lendy.backend.orders.dto.CheckoutResponse;
import com.lendy.backend.orders.entity.Order;
import com.lendy.backend.orders.entity.OrderItem;
import com.lendy.backend.orders.entity.OrderStatus;
import com.lendy.backend.orders.repository.OrderRepository;
import com.lendy.backend.payments.service.PaymentService;
import com.lendy.backend.Product.entity.ProductOption;
import com.lendy.backend.Product.repository.ProductOptionReposiotry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductOptionReposiotry productOptionRepository;
    private final PaymentService paymentService;

    private static final int FREE_SHIPPING_THRESHOLD = 50000;
    private static final int SHIPPING_FEE = 3000;

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request) {
        // Validate and compute totals
        AtomicInteger subtotal = new AtomicInteger(0);

        Order order = Order.builder()
                .orderCode(Order.generateOrderCode())
                .orderAccessKeyHash("") // Will be set after generating key
                .buyerName(request.getGuest().getName())
                .buyerPhone(request.getGuest().getPhone())
                .buyerEmail(request.getGuest().getEmail())
                .receiverName(request.getShipping().getReceiverName())
                .receiverPhone(request.getShipping().getPhone())
                .address1(request.getShipping().getAddress1())
                .address2(request.getShipping().getAddress2())
                .zipCode(request.getShipping().getZip())
                .deliveryMessage(request.getShipping().getDeliveryMessage())
                .merchantUid(generateMerchantUid())
                .status(OrderStatus.PAYMENT_PENDING)
                .build();

        // Process items and calculate totals
        for (CheckoutRequest.CheckoutItem checkoutItem : request.getItems()) {
            ProductOption option = productOptionRepository.findById(checkoutItem.getProductOptionId())
                    .orElseThrow(() -> new IllegalArgumentException("Product option not found: " + checkoutItem.getProductOptionId()));

            int itemTotal = option.getBuyPrice().intValue() * checkoutItem.getQty();
            subtotal.addAndGet(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .productOptionId(option.getId())
                    .productName(option.getProduct().getProductName())
                    .optionDescription(option.getSize())
                    .quantity(checkoutItem.getQty())
                    .unitPrice(option.getBuyPrice().intValue())
                    .totalPrice(itemTotal)
                    .imageUrl(null) // Could be set from product images
                    .build();

            order.addItem(orderItem);
        }

        int subtotalAmount = subtotal.get();
        int shippingFee = subtotalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
        int totalAmount = subtotalAmount + shippingFee;

        // Set pricing snapshot
        order = order.toBuilder()
                .subtotalAmount(subtotalAmount)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .build();

        // Generate access key and hash it
        String accessKey = generateAccessKey();
        order = order.toBuilder()
                .orderAccessKeyHash(hashAccessKey(accessKey))
                .build();

        Order savedOrder = orderRepository.save(order);

        // Create payment attempt
        paymentService.createPaymentAttempt(savedOrder.getId(), savedOrder.getMerchantUid(), savedOrder.getTotalAmount());

        return CheckoutResponse.builder()
                .orderCode(savedOrder.getOrderCode())
                .orderAccessKey(accessKey) // Return plaintext key only once
                .merchantUid(savedOrder.getMerchantUid())
                .subtotalAmount(savedOrder.getSubtotalAmount())
                .shippingFee(savedOrder.getShippingFee())
                .totalAmount(savedOrder.getTotalAmount())
                .status(savedOrder.getStatus().name())
                .build();
    }

    private String generateMerchantUid() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().substring(0, 8);
        return "ORDER_" + timestamp + "_" + random;
    }

    private String generateAccessKey() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private String hashAccessKey(String accessKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(accessKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash access key", e);
        }
    }
}
