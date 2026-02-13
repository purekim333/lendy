package com.lendy.backend.payments.controller;

import com.lendy.backend.payments.service.PaymentService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyPayment(@RequestBody VerifyRequest request) {
        log.info("Payment verify request: merchantUid={}", request.getMerchantUid());
        paymentService.verifyPayment(request.getMerchantUid(), request.getImpUid());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/webhook/portone")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-PortOne-Signature", required = false) String signature) {
        log.info("PortOne webhook received: {}", payload);

        // TODO: Verify webhook signature using secret
        // if (!verifySignature(payload, signature)) {
        //     return ResponseEntity.status(401).build();
        // }

        paymentService.handleWebhook(payload);
        return ResponseEntity.ok().build();
    }

    @Getter
    @Setter
    public static class VerifyRequest {
        private String merchantUid;
        private String impUid;
    }
}
