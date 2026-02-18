package com.lendy.backend.payments.controller;

import com.lendy.backend.payments.service.PaymentService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${portone.webhook.secret:}")
    private String webhookSecret;

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyPayment(@RequestBody VerifyRequest request) {
        log.info("Payment verify request: merchantUid={}", request.getMerchantUid());
        paymentService.verifyPayment(request.getMerchantUid(), request.getImpUid());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhook/portone")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-PortOne-Signature", required = false) String signature) {
        log.info("PortOne webhook received");

        // 서명 검증 (webhookSecret이 설정된 경우에만)
        if (webhookSecret != null && !webhookSecret.isBlank()) {
            if (signature == null || !verifySignature(rawBody, signature)) {
                log.warn("PortOne webhook signature verification failed");
                return ResponseEntity.status(401).build();
            }
        }

        // rawBody를 Map으로 파싱
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = mapper.readValue(rawBody, Map.class);
            paymentService.handleWebhook(payload);
        } catch (Exception e) {
            log.error("Failed to parse webhook payload", e);
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computed = java.util.Base64.getEncoder().encodeToString(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("Webhook signature verification error", e);
            return false;
        }
    }

    @Getter
    @Setter
    public static class VerifyRequest {
        private String merchantUid;
        private String impUid;
    }
}
