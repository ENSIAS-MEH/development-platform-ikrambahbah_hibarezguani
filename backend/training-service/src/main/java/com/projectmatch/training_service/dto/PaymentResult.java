package com.projectmatch.training_service.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResult {

    private boolean success;
    private String transactionId;      // ex : "TXN-20240531-AB12CD"
    private String message;            // "Paiement accepté" ou raison du refus
    private Double amountCharged;
    private String currency;
    private LocalDateTime processedAt;

    // ── Helpers statiques ──

    public static PaymentResult success(String transactionId, Double amount, String currency) {
        return PaymentResult.builder()
                .success(true)
                .transactionId(transactionId)
                .message("Paiement accepté")
                .amountCharged(amount)
                .currency(currency)
                .processedAt(LocalDateTime.now())
                .build();
    }

    public static PaymentResult failure(String reason) {
        return PaymentResult.builder()
                .success(false)
                .transactionId(null)
                .message(reason)
                .processedAt(LocalDateTime.now())
                .build();
    }
}
