package com.projectmatch.training_service.controller;

import com.projectmatch.training_service.config.JwtUtil;
import com.projectmatch.training_service.dto.*;
import com.projectmatch.training_service.entity.Resource;
import com.projectmatch.training_service.service.TrainingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainings")
@RequiredArgsConstructor
public class TrainingController {

    private final TrainingService trainingService;
    private final JwtUtil jwtUtil;

    // ── Extraction JWT ──

    private Long extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("No token provided");
        }
        return jwtUtil.extractUserId(authHeader.substring(7));
    }

    private String extractRole(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("No token provided");
        }
        return jwtUtil.extractRole(authHeader.substring(7));
    }

    // ========== FORMATIONS ==========

    @PostMapping
    public ResponseEntity<TrainingResponse> createTraining(
            @RequestBody TrainingRequest request,
            HttpServletRequest httpRequest) {
        if (!"MENTOR".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(trainingService.createTraining(extractUserId(httpRequest), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<TrainingResponse>> getMyTrainings(HttpServletRequest httpRequest) {
        if (!"MENTOR".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(trainingService.getMyTrainings(extractUserId(httpRequest)));
    }

    @PutMapping("/{trainingId}")
    public ResponseEntity<TrainingResponse> updateTraining(
            @PathVariable Long trainingId,
            @RequestBody TrainingRequest request,
            HttpServletRequest httpRequest) {
        if (!"MENTOR".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(trainingService.updateTraining(trainingId, extractUserId(httpRequest), request));
    }

    @PostMapping("/{trainingId}/publish")
    public ResponseEntity<TrainingResponse> publishTraining(
            @PathVariable Long trainingId,
            HttpServletRequest httpRequest) {
        if (!"MENTOR".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(trainingService.publishTraining(trainingId, extractUserId(httpRequest)));
    }

    @DeleteMapping("/{trainingId}")
    public ResponseEntity<Void> deleteTraining(
            @PathVariable Long trainingId,
            HttpServletRequest httpRequest) {
        if (!"MENTOR".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        trainingService.deleteTraining(trainingId, extractUserId(httpRequest));
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<TrainingResponse>> getAllPublishedTrainings() {
        return ResponseEntity.ok(trainingService.getAllPublishedTrainings());
    }

    @GetMapping("/{trainingId}")
    public ResponseEntity<TrainingResponse> getTrainingById(@PathVariable Long trainingId) {
        return ResponseEntity.ok(trainingService.getTrainingById(trainingId));
    }

    // ========== INSCRIPTIONS ==========

    /**
     * Inscription à une formation GRATUITE (STUDENT uniquement)
     */
    @PostMapping("/{trainingId}/enroll")
    public ResponseEntity<?> enrollToTraining(
            @PathVariable Long trainingId,
            HttpServletRequest httpRequest) {
        if (!"STUDENT".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        try {
            trainingService.enrollToTraining(trainingId, extractUserId(httpRequest));
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ── NOUVEAU : Inscription à une formation PAYANTE avec simulation paiement ──
     *
     * POST /api/trainings/{trainingId}/enroll-paid
     *
     * Body : { cardNumber, cardHolder, expiryDate, cvv, currency }
     * Retourne : { success, transactionId, message, amountCharged, currency, processedAt }
     */
    @PostMapping("/{trainingId}/enroll-paid")
    public ResponseEntity<PaymentResult> enrollWithPayment(
            @PathVariable Long trainingId,
            @RequestBody PaymentRequest paymentRequest,
            HttpServletRequest httpRequest) {

        if (!"STUDENT".equals(extractRole(httpRequest))) {
            return ResponseEntity.status(403).build();
        }

        Long userId = extractUserId(httpRequest);
        try {
            PaymentResult result = trainingService.enrollWithPayment(trainingId, userId, paymentRequest);
            // On retourne toujours 200 avec le résultat (succès ou échec simulé)
            // Le frontend lit result.success pour savoir si le paiement est passé
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            PaymentResult errorResult = new PaymentResult();
            errorResult.setSuccess(false);
            errorResult.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResult);
        }
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<List<TrainingResponse>> getMyEnrolledTrainings(HttpServletRequest httpRequest) {
        if (!"STUDENT".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(trainingService.getMyEnrolledTrainings(extractUserId(httpRequest)));
    }

    // ========== RESSOURCES ==========

    @PostMapping("/{trainingId}/resources")
    public ResponseEntity<Resource> addResource(
            @PathVariable Long trainingId,
            @RequestBody ResourceRequest request,
            HttpServletRequest httpRequest) {
        if (!"MENTOR".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(trainingService.addResource(trainingId, extractUserId(httpRequest), request));
    }

    @DeleteMapping("/resources/{resourceId}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long resourceId) {
        trainingService.deleteResource(resourceId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{trainingId}/resources")
    public ResponseEntity<List<Resource>> getResources(@PathVariable Long trainingId) {
        return ResponseEntity.ok(trainingService.getResources(trainingId));
    }

    // ========== AVIS (REVIEWS) ==========

    @PostMapping("/{trainingId}/reviews")
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable Long trainingId,
            @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {
        if (!"STUDENT".equals(extractRole(httpRequest))) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(trainingService.addReview(trainingId, extractUserId(httpRequest), request));
    }

    @GetMapping("/{trainingId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long trainingId) {
        return ResponseEntity.ok(trainingService.getReviews(trainingId));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        trainingService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }
}
