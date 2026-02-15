package com.lendy.backend.orders.service;

import com.lendy.backend.orders.dto.CheckoutRequest;
import com.lendy.backend.orders.dto.CheckoutResponse;
import com.lendy.backend.orders.dto.GuestOrderResponse;
import com.lendy.backend.orders.dto.MyOrderResponse;
import com.lendy.backend.orders.entity.Order;
import com.lendy.backend.orders.entity.OrderItem;
import com.lendy.backend.orders.entity.OrderStatus;
import com.lendy.backend.orders.repository.OrderRepository;
import com.lendy.backend.payments.service.PaymentService;
import com.lendy.backend.product.entity.ProductOption;
import com.lendy.backend.product.repository.ProductOptionRepository;
import com.lendy.backend.user.entity.UserEntity;
import com.lendy.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductOptionRepository productOptionRepository;
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    private static final int FREE_SHIPPING_THRESHOLD = 50000;
    private static final int SHIPPING_FEE = 3000;

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request, Long userId) {
        // Validate and compute totals
        AtomicInteger subtotal = new AtomicInteger(0);

        // Determine buyer info based on userId or guest info
        String buyerName;
        String buyerPhone;
        String buyerEmail;

        if (userId != null) {
            // Member order - get user info
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            buyerName = user.getNickname();
            buyerPhone = ""; // User entity doesn't have phone, use empty or get from shipping
            buyerEmail = user.getEmail();
        } else {
            // Guest order - use guest info from request
            if (request.getGuest() == null) {
                throw new IllegalArgumentException("Guest info is required for non-authenticated checkout");
            }
            buyerName = request.getGuest().getName();
            buyerPhone = request.getGuest().getPhone();
            buyerEmail = request.getGuest().getEmail();
        }

        Order order = Order.builder()
                .orderCode(Order.generateOrderCode())
                .orderAccessKeyHash("") // Will be set after generating key
                .buyerName(buyerName)
                .buyerPhone(buyerPhone)
                .buyerEmail(buyerEmail)
                .userId(userId)
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

        // Set pricing snapshot (use setter to preserve item references)
        order.setPricingSnapshot(subtotalAmount, shippingFee, totalAmount);

        // Generate access key and hash it
        String accessKey = generateAccessKey();
        order.setOrderAccessKeyHash(hashAccessKey(accessKey));

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

    public String hashAccessKey(String accessKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(accessKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash access key", e);
        }
    }

    public GuestOrderResponse getGuestOrder(String orderCode, String accessKey) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        String providedHash = hashAccessKey(accessKey);
        if (!providedHash.equals(order.getOrderAccessKeyHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid access key");
        }

        return GuestOrderResponse.builder()
                .orderCode(order.getOrderCode())
                .status(order.getStatus().name())
                .buyerName(order.getBuyerName())
                .buyerPhone(order.getBuyerPhone())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .address1(order.getAddress1())
                .address2(order.getAddress2())
                .zipCode(order.getZipCode())
                .deliveryMessage(order.getDeliveryMessage())
                .carrier(order.getCarrier())
                .invoiceNo(order.getInvoiceNo())
                .items(order.getItems().stream()
                        .map(item -> GuestOrderResponse.OrderItemInfo.builder()
                                .productName(item.getProductName())
                                .optionDescription(item.getOptionDescription())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .imageUrl(item.getImageUrl())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public void cancelGuestOrder(String orderCode, String accessKey) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Validate access key
        String providedHash = hashAccessKey(accessKey);
        if (!providedHash.equals(order.getOrderAccessKeyHash())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid access key");
        }

        // Idempotency - if already cancelled, return success
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return;
        }

        // Only allow cancellation before shipping
        if (order.getStatus() != OrderStatus.PAYMENT_PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot cancel order in status: " + order.getStatus());
        }

        // Cancel payment if it was paid
        if (order.getStatus() == OrderStatus.PAID) {
            paymentService.cancelPayment(order.getMerchantUid(), "Guest cancellation");
        }

        // Update order status
        order.updateStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public List<MyOrderResponse> getMyOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return orders.stream()
                .map(order -> {
                    List<OrderItem> items = order.getItems();
                    String firstItemName = items.isEmpty() ? "" : items.get(0).getProductName();
                    String firstItemImageUrl = items.isEmpty() ? null : items.get(0).getImageUrl();
                    int itemCount = items.size();

                    return MyOrderResponse.builder()
                            .orderCode(order.getOrderCode())
                            .status(order.getStatus().name())
                            .totalAmount(order.getTotalAmount())
                            .createdAt(order.getCreatedAt())
                            .firstItemName(firstItemName)
                            .itemCount(itemCount)
                            .firstItemImageUrl(firstItemImageUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public GuestOrderResponse getMyOrderDetail(String orderCode, Long userId) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Verify this order belongs to the user
        if (!userId.equals(order.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this order");
        }

        return GuestOrderResponse.builder()
                .orderCode(order.getOrderCode())
                .status(order.getStatus().name())
                .buyerName(order.getBuyerName())
                .buyerPhone(order.getBuyerPhone())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .address1(order.getAddress1())
                .address2(order.getAddress2())
                .zipCode(order.getZipCode())
                .deliveryMessage(order.getDeliveryMessage())
                .carrier(order.getCarrier())
                .invoiceNo(order.getInvoiceNo())
                .items(order.getItems().stream()
                        .map(item -> GuestOrderResponse.OrderItemInfo.builder()
                                .productName(item.getProductName())
                                .optionDescription(item.getOptionDescription())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .imageUrl(item.getImageUrl())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
