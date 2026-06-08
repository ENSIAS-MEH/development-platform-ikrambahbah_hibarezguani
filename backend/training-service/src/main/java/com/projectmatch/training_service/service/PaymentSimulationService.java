package com.projectmatch.training_service.service;

import com.projectmatch.training_service.dto.PaymentRequest;
import com.projectmatch.training_service.dto.PaymentResult;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Service de simulation de paiement.
 *
 * Aucune vraie transaction bancaire n'est effectuée.
 * Les règles de simulation sont :
 *
 *   Carte commençant par "0000"  → refus (fonds insuffisants)
 *   Carte commençant par "9999"  → refus (carte bloquée)
 *   CVV = "000"                  → refus (CVV invalide)
 *   Date expirée (avant 2024)    → refus (carte expirée)
 *   Montant > 10 000             → refus (limite dépassée)
 *   Tout le reste                → succès
 */
@Service
public class PaymentSimulationService {

    public PaymentResult process(PaymentRequest request) {

        // ── Validation de base ──
        if (request.getCardNumber() == null || request.getCardNumber().isBlank()) {
            return PaymentResult.failure("Numéro de carte manquant");
        }
        if (request.getAmount() == null || request.getAmount() <= 0) {
            return PaymentResult.failure("Montant invalide");
        }

        String card = request.getCardNumber().replaceAll("\\s+", "");

        // ── Règles de refus simulées ──
        if (card.startsWith("0000")) {
            return PaymentResult.failure("Fonds insuffisants sur la carte");
        }
        if (card.startsWith("9999")) {
            return PaymentResult.failure("Carte bloquée — contactez votre banque");
        }
        if ("000".equals(request.getCvv())) {
            return PaymentResult.failure("CVV invalide");
        }
        if (isExpired(request.getExpiryDate())) {
            return PaymentResult.failure("Carte expirée");
        }
        if (request.getAmount() > 10_000) {
            return PaymentResult.failure("Montant dépasse la limite autorisée (10 000)");
        }

        // ── Délai de traitement simulé (300 ms) ──
        simulateProcessingDelay();

        // ── Succès ──
        String transactionId = generateTransactionId();
        String currency = request.getCurrency() != null ? request.getCurrency() : "MAD";
        return PaymentResult.success(transactionId, request.getAmount(), currency);
    }

    // ── Helpers privés ──

    private boolean isExpired(String expiryDate) {
        if (expiryDate == null || !expiryDate.matches("\\d{2}/\\d{2,4}")) return false;
        try {
            String[] parts = expiryDate.split("/");
            int month = Integer.parseInt(parts[0]);
            int year  = Integer.parseInt(parts[1]);
            // Normaliser l'année sur 4 chiffres
            if (year < 100) year += 2000;
            // Comparer avec l'année courante (2024)
            return year < 2024 || (year == 2024 && month < 1);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String generateTransactionId() {
        String uuid = UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 8);
        String date = java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "TXN-" + date + "-" + uuid;
    }

    private void simulateProcessingDelay() {
        try {
            Thread.sleep(300);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
