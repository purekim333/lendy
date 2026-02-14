package com.lendy.backend.payments.service;

import com.lendy.backend.orders.entity.Order;
import com.lendy.backend.orders.entity.OrderStatus;
import com.lendy.backend.orders.repository.OrderRepository;
import com.lendy.backend.payments.client.PortOneClient;
import com.lendy.backend.payments.entity.PaymentAttempt;
import com.lendy.backend.payments.entity.PaymentEventLog;
import com.lendy.backend.payments.entity.PaymentStatus;
import com.lendy.backend.payments.repository.PaymentAttemptRepository;
import com.lendy.backend.payments.repository.PaymentEventLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentAttemptRepository paymentAttemptRepository;
    private final PaymentEventLogRepository paymentEventLogRepository;
    private final OrderRepository orderRepository;
    private final PortOneClient portOneClient;

    @Transactional
    public void finalizePayment(String merchantUid, String impUid, String source) {
        log.info("Finalizing payment: merchantUid={}, impUid={}, source={}", merchantUid, impUid, source);

        // Find or create payment attempt
        PaymentAttempt payment = paymentAttemptRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new IllegalArgumentException("Payment attempt not found: " + merchantUid));

        // Idempotency check - already in terminal state
        if (payment.isTerminal()) {
            log.info("Payment already finalized: merchantUid={}, status={}", merchantUid, payment.getStatus());
            return;
        }

        // Query PortOne for payment status
        PortOneClient.PaymentResponse portOneResponse = portOneClient.getPaymentByImpUid(impUid);

        if (portOneResponse == null) {
            log.error("Failed to get payment from PortOne: impUid={}", impUid);
            logEvent(payment, impUid, source, null, "PORTONE_QUERY_FAILED", "Failed to query payment");
            throw new IllegalStateException("Failed to verify payment with PortOne");
        }

        // Strict verification
        if (!merchantUid.equals(portOneResponse.getMerchantUid())) {
            log.error("Merchant UID mismatch: expected={}, actual={}", merchantUid, portOneResponse.getMerchantUid());
            logEvent(payment, impUid, source, portOneResponse.getAmount(), "MERCHANT_MISMATCH", "Merchant UID mismatch");
            throw new IllegalStateException("Payment verification failed: merchant mismatch");
        }

        if (!payment.getAmount().equals(portOneResponse.getAmount())) {
            log.error("Amount mismatch: expected={}, actual={}", payment.getAmount(), portOneResponse.getAmount());
            logEvent(payment, impUid, source, portOneResponse.getAmount(), "AMOUNT_MISMATCH", "Amount mismatch");
            throw new IllegalStateException("Payment verification failed: amount mismatch");
        }

        if (!"paid".equals(portOneResponse.getStatus())) {
            log.error("Payment not paid: status={}", portOneResponse.getStatus());
            logEvent(payment, impUid, source, portOneResponse.getAmount(), "NOT_PAID", "Payment status: " + portOneResponse.getStatus());
            payment.markAsFailed("NOT_PAID", "Payment status: " + portOneResponse.getStatus());
            paymentAttemptRepository.save(payment);
            return;
        }

        // Mark as paid
        payment.markAsPaid(
                impUid,
                portOneResponse.getPayMethod(),
                portOneResponse.getPgProvider(),
                portOneResponse.getReceiptUrl()
        );
        paymentAttemptRepository.save(payment);

        // Update order status
        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new IllegalStateException("Order not found: " + payment.getOrderId()));
        order.updateStatus(OrderStatus.PAID);
        orderRepository.save(order);

        logEvent(payment, impUid, source, portOneResponse.getAmount(), "SUCCESS", null);
        log.info("Payment finalized successfully: merchantUid={}", merchantUid);
    }

    @Transactional
    public void createPaymentAttempt(Long orderId, String merchantUid, Integer amount) {
        PaymentAttempt payment = PaymentAttempt.builder()
                .orderId(orderId)
                .merchantUid(merchantUid)
                .amount(amount)
                .status(PaymentStatus.CREATED)
                .build();
        paymentAttemptRepository.save(payment);
    }

    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        String impUid = (String) payload.get("imp_uid");
        String merchantUid = (String) payload.get("merchant_uid");
        Integer amount = payload.get("amount") != null ? Integer.valueOf(payload.get("amount").toString()) : null;

        // Log event
        Optional<PaymentAttempt> existingPayment = paymentAttemptRepository.findByMerchantUid(merchantUid);
        if (existingPayment.isPresent()) {
            logEvent(existingPayment.get(), impUid, "WEBHOOK", amount, "RECEIVED", payload.toString());
        }

        // Trigger finalize
        finalizePayment(merchantUid, impUid, "WEBHOOK");
    }

    @Transactional
    public void verifyPayment(String merchantUid, String impUid) {
        finalizePayment(merchantUid, impUid, "VERIFY_API");
    }

    @Transactional
    public void cancelPayment(String merchantUid, String reason) {
        log.info("Cancelling payment: merchantUid={}, reason={}", merchantUid, reason);

        PaymentAttempt payment = paymentAttemptRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new IllegalArgumentException("Payment attempt not found: " + merchantUid));

        // Idempotency check - already cancelled
        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            log.info("Payment already cancelled: merchantUid={}", merchantUid);
            return;
        }

        // If payment is PAID, call PortOne to cancel/refund
        if (payment.isPaid()) {
            boolean success = portOneClient.cancelPayment(payment.getImpUid(), reason);
            if (!success) {
                logCancelEvent(payment, "PORTONE_CANCEL_FAILED", "Failed to cancel payment via PortOne");
                throw new IllegalStateException("Failed to cancel payment with PortOne");
            }
        }

        // Update payment status
        payment.markAsCancelled();
        paymentAttemptRepository.save(payment);

        logCancelEvent(payment, "SUCCESS", null);
        log.info("Payment cancelled successfully: merchantUid={}", merchantUid);
    }

    private void logEvent(PaymentAttempt payment, String impUid, String source, Integer amount, String result, String error) {
        PaymentEventLog eventLog = PaymentEventLog.builder()
                .merchantUid(payment.getMerchantUid())
                .impUid(impUid)
                .eventType("FINALIZE")
                .source(source)
                .amount(amount)
                .processingResult(result)
                .errorMessage(error)
                .build();
        paymentEventLogRepository.save(eventLog);
    }

    private void logCancelEvent(PaymentAttempt payment, String result, String error) {
        PaymentEventLog eventLog = PaymentEventLog.builder()
                .merchantUid(payment.getMerchantUid())
                .impUid(payment.getImpUid())
                .eventType("CANCEL")
                .source("ORDER_CANCEL")
                .amount(payment.getAmount())
                .processingResult(result)
                .errorMessage(error)
                .build();
        paymentEventLogRepository.save(eventLog);
    }
}
