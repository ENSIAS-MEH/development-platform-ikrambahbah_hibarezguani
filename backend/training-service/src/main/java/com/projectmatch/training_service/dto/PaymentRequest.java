package com.projectmatch.training_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    // Infos carte (simulées, jamais stockées)
    private String cardNumber;      // ex : "4111111111111111"
    private String cardHolder;      // ex : "YOUSSEF ALAOUI"
    private String expiryDate;      // ex : "12/26"
    private String cvv;             // ex : "123"

    // Infos paiement
    private Double amount;
    private String currency;        // "MAD", "EUR", "USD"
}
