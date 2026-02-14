package com.lendy.backend.payments.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class PortOneClient {

    @Value("${portone.api.key:#{null}}")
    private String apiKey;

    @Value("${portone.api.secret:#{null}}")
    private String apiSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BASE_URL = "https://api.iamport.kr";

    public PaymentResponse getPaymentByImpUid(String impUid) {
        if (apiKey == null || apiSecret == null) {
            log.warn("PortOne API credentials not configured");
            return null;
        }

        try {
            String accessToken = getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    BASE_URL + "/payments/" + impUid,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null && (Integer) body.get("code") == 0) {
                Map<String, Object> payment = (Map<String, Object>) body.get("response");
                return PaymentResponse.builder()
                        .impUid((String) payment.get("imp_uid"))
                        .merchantUid((String) payment.get("merchant_uid"))
                        .amount((Integer) payment.get("amount"))
                        .status((String) payment.get("status"))
                        .payMethod((String) payment.get("pay_method"))
                        .pgProvider((String) payment.get("pg_provider"))
                        .receiptUrl((String) payment.get("receipt_url"))
                        .buyerName((String) payment.get("buyer_name"))
                        .buyerEmail((String) payment.get("buyer_email"))
                        .buyerTel((String) payment.get("buyer_tel"))
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to get payment from PortOne", e);
        }
        return null;
    }

    public boolean cancelPayment(String impUid, String reason) {
        if (apiKey == null || apiSecret == null) {
            log.warn("PortOne API credentials not configured");
            return false;
        }

        try {
            String accessToken = getAccessToken();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", accessToken);

            Map<String, String> requestBody = Map.of(
                    "imp_uid", impUid,
                    "reason", reason != null ? reason : "Guest cancellation"
            );

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    BASE_URL + "/payments/cancel",
                    entity,
                    Map.class
            );

            Map<String, Object> body = response.getBody();
            if (body != null && (Integer) body.get("code") == 0) {
                log.info("Payment cancelled successfully: impUid={}", impUid);
                return true;
            } else {
                log.error("Failed to cancel payment: impUid={}, response={}", impUid, body);
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to cancel payment via PortOne: impUid={}", impUid, e);
            return false;
        }
    }

    private String getAccessToken() {
        Map<String, String> request = Map.of(
                "imp_key", apiKey,
                "imp_secret", apiSecret
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(
                BASE_URL + "/users/getToken",
                request,
                Map.class
        );

        Map<String, Object> body = response.getBody();
        if (body != null && (Integer) body.get("code") == 0) {
            Map<String, Object> tokenResponse = (Map<String, Object>) body.get("response");
            return (String) tokenResponse.get("access_token");
        }
        throw new RuntimeException("Failed to get PortOne access token");
    }

    @Getter
    @Builder
    public static class PaymentResponse {
        @JsonProperty("imp_uid")
        private String impUid;

        @JsonProperty("merchant_uid")
        private String merchantUid;

        private Integer amount;
        private String status;

        @JsonProperty("pay_method")
        private String payMethod;

        @JsonProperty("pg_provider")
        private String pgProvider;

        @JsonProperty("receipt_url")
        private String receiptUrl;

        @JsonProperty("buyer_name")
        private String buyerName;

        @JsonProperty("buyer_email")
        private String buyerEmail;

        @JsonProperty("buyer_tel")
        private String buyerTel;
    }
}
