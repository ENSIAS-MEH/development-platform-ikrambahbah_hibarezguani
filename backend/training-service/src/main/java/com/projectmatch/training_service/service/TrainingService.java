package com.projectmatch.training_service.service;

import com.projectmatch.training_service.dto.*;
import com.projectmatch.training_service.entity.*;
import com.projectmatch.training_service.entity.enums.TrainingStatus;
import com.projectmatch.training_service.entity.enums.TrainingType;
import com.projectmatch.training_service.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ResourceRepository resourceRepository;
    private final ReviewRepository reviewRepository;
    private final RestTemplate restTemplate;

    // ── NOUVEAU : injection du service de paiement simulé ──
    private final PaymentSimulationService paymentSimulationService;

    @Value("${profile.service.url:http://localhost:8082}")
    private String profileServiceUrl;

    // ========== FORMATIONS ==========

    @Transactional
    public TrainingResponse createTraining(Long mentorId, TrainingRequest request) {
        Training training = Training.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .mentorId(mentorId)
                .type(request.getType())
                .status(TrainingStatus.DRAFT)
                .duration(request.getDuration())
                .maxStudents(request.getMaxStudents())
                .thumbnailUrl(request.getThumbnailUrl())
                .price(request.getPrice())          // ← NOUVEAU
                .build();
        return TrainingResponse.fromEntity(trainingRepository.save(training));
    }

    public List<TrainingResponse> getMyTrainings(Long mentorId) {
        return trainingRepository.findByMentorId(mentorId)
                .stream()
                .map(TrainingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TrainingResponse updateTraining(Long trainingId, Long mentorId, TrainingRequest request) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));

        if (!training.getMentorId().equals(mentorId)) {
            throw new RuntimeException("Unauthorized");
        }

        training.setTitle(request.getTitle());
        training.setDescription(request.getDescription());
        training.setType(request.getType());
        training.setDuration(request.getDuration());
        training.setMaxStudents(request.getMaxStudents());
        training.setThumbnailUrl(request.getThumbnailUrl());
        training.setPrice(request.getPrice());      // ← NOUVEAU

        return TrainingResponse.fromEntity(trainingRepository.save(training));
    }

    @Transactional
    public TrainingResponse publishTraining(Long trainingId, Long mentorId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));

        if (!training.getMentorId().equals(mentorId)) {
            throw new RuntimeException("Unauthorized");
        }

        training.setStatus(TrainingStatus.PUBLISHED);
        return TrainingResponse.fromEntity(trainingRepository.save(training));
    }

    @Transactional
    public void deleteTraining(Long trainingId, Long mentorId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));

        if (!training.getMentorId().equals(mentorId)) {
            throw new RuntimeException("Unauthorized");
        }

        trainingRepository.deleteById(trainingId);
    }

    public List<TrainingResponse> getAllPublishedTrainings() {
        return trainingRepository.findAllPublished()
                .stream()
                .map(TrainingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TrainingResponse getTrainingById(Long trainingId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));
        return TrainingResponse.fromEntity(training);
    }

    // ========== INSCRIPTIONS ==========

    /**
     * Inscription à une formation GRATUITE (sans paiement).
     * Appelé directement pour les formations FREE.
     */
    @Transactional
    public void enrollToTraining(Long trainingId, Long userId) {
        Training training = getValidatedTraining(trainingId, userId);

        // Vérifier que la formation est bien gratuite
        if (training.getType() == TrainingType.PAID) {
            throw new RuntimeException("Cette formation est payante. Veuillez passer par le paiement.");
        }

        saveEnrollment(training, userId);
    }

    /**
     * Inscription à une formation PAYANTE avec simulation de paiement.
     * Retourne le résultat du paiement simulé.
     */
    @Transactional
    public PaymentResult enrollWithPayment(Long trainingId, Long userId, PaymentRequest paymentRequest) {
        Training training = getValidatedTraining(trainingId, userId);

        // Vérifier que la formation est bien payante
        if (training.getType() != TrainingType.PAID) {
            throw new RuntimeException("Cette formation est gratuite, pas de paiement nécessaire.");
        }

        // Appliquer le prix de la formation
        double amount = training.getPrice() != null ? training.getPrice() : 0.0;
        paymentRequest.setAmount(amount);
        if (paymentRequest.getCurrency() == null) {
            paymentRequest.setCurrency("MAD");
        }

        // ── Simulation du paiement ──
        PaymentResult result = paymentSimulationService.process(paymentRequest);

        // Si le paiement est accepté → créer l'inscription
        if (result.isSuccess()) {
            saveEnrollment(training, userId);
        }

        return result;
    }

    public List<TrainingResponse> getMyEnrolledTrainings(Long userId) {
        return enrollmentRepository.findByUserId(userId)
                .stream()
                .map(enrollment -> TrainingResponse.fromEntity(enrollment.getTraining()))
                .collect(Collectors.toList());
    }

    // ========== RESSOURCES ==========

    @Transactional
    public Resource addResource(Long trainingId, Long mentorId, ResourceRequest request) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));

        if (!training.getMentorId().equals(mentorId)) {
            throw new RuntimeException("Unauthorized");
        }

        Resource resource = Resource.builder()
                .title(request.getTitle())
                .url(request.getUrl())
                .type(request.getType())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .training(training)
                .build();

        return resourceRepository.save(resource);
    }

    @Transactional
    public void deleteResource(Long resourceId) {
        resourceRepository.deleteById(resourceId);
    }

    public List<Resource> getResources(Long trainingId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));
        return training.getResources();
    }

    // ========== AVIS (REVIEWS) ==========

    @Transactional
    public ReviewResponse addReview(Long trainingId, Long userId, ReviewRequest request) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Training not found"));

        if (!enrollmentRepository.existsByUserIdAndTrainingId(userId, trainingId)) {
            throw new RuntimeException("Vous devez être inscrit pour donner un avis");
        }

        if (reviewRepository.existsByUserIdAndTrainingId(userId, trainingId)) {
            throw new RuntimeException("Vous avez déjà donné un avis");
        }

        Review review = Review.builder()
                .userId(userId)
                .training(training)
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepository.save(review);
        return buildReviewResponse(saved);
    }

    public List<ReviewResponse> getReviews(Long trainingId) {
        List<Review> reviews = reviewRepository.findByTrainingIdOrderByCreatedAtDesc(trainingId);
        return reviews.stream()
                .map(this::buildReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    // ========== HELPERS PRIVÉS ==========

    private Training getValidatedTraining(Long trainingId, Long userId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new EntityNotFoundException("Formation introuvable"));

        if (training.getStatus() != TrainingStatus.PUBLISHED) {
            throw new RuntimeException("La formation n'est pas encore publiée");
        }

        if (enrollmentRepository.existsByUserIdAndTrainingId(userId, trainingId)) {
            throw new RuntimeException("Vous êtes déjà inscrit à cette formation");
        }

        int currentEnrollments = trainingRepository.countEnrollmentsByTrainingId(trainingId);
        if (training.getMaxStudents() != null && currentEnrollments >= training.getMaxStudents()) {
            throw new RuntimeException("La formation est complète");
        }

        return training;
    }

    private void saveEnrollment(Training training, Long userId) {
        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .training(training)
                .build();
        enrollmentRepository.save(enrollment);
    }

    // Cache simple en mémoire pour éviter N appels HTTP pour N reviews du même user
    private final java.util.Map<Long, Map<String, String>> userInfoCache =
            new java.util.concurrent.ConcurrentHashMap<>();

    private Map<String, String> getUserInfo(Long userId) {
        // 1. Retourner depuis le cache si déjà récupéré
        if (userInfoCache.containsKey(userId)) {
            return userInfoCache.get(userId);
        }

        // 2. Essayer l'endpoint principal : /api/profiles/user/{userId}
        Map<String, String> info = fetchFromProfileService(
                profileServiceUrl + "/api/profiles/user/" + userId
        );

        // 3. Si 404, essayer l'endpoint alternatif : /api/profiles/{userId}
        if (info == null) {
            info = fetchFromProfileService(
                    profileServiceUrl + "/api/profiles/" + userId
            );
        }

        // 4. Mettre en cache (même si null → évite de rappeler pour ce userId)
        if (info != null) {
            userInfoCache.put(userId, info);
        }

        return info;
    }

    private Map<String, String> fetchFromProfileService(String url) {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            // 404 silencieux — profil non créé, fallback utilisé
        } catch (Exception e) {
            // Autre erreur (service down, timeout…) → log discret
            System.err.println("[TrainingService] Profile service unavailable for userId="
                    + url + " : " + e.getClass().getSimpleName());
        }
        return null;
    }

    private ReviewResponse buildReviewResponse(Review review) {
        String userFullName = "Utilisateur #" + review.getUserId();
        String userAvatar = null;

        Map<String, String> userInfo = getUserInfo(review.getUserId());
        if (userInfo != null && !"true".equals(userInfo.get("anonymous"))) {
            // Profil réel trouvé
            String firstName = getField(userInfo, "firstName", "first_name", "prenom");
            String lastName  = getField(userInfo, "lastName",  "last_name",  "nom");
            String avatar    = getField(userInfo, "avatarUrl", "avatar_url", "avatar", "photo");

            if (firstName != null || lastName != null) {
                userFullName = ((firstName != null ? firstName : "") + " "
                        + (lastName  != null ? lastName  : "")).trim();
                // Si le nom est vide après trim (profil créé mais nom non renseigné)
                if (userFullName.isBlank()) {
                    userFullName = "Utilisateur #" + review.getUserId();
                }
            }
            if (avatar != null && !avatar.isBlank()) {
                userAvatar = avatar;
            }
        }

        // Fallback avatar généré si aucun profil trouvé
        if (userAvatar == null || userAvatar.isBlank()) {
            userAvatar = "https://ui-avatars.com/api/?name="
                    + userFullName.replace(" ", "+")
                    + "&background=667eea&color=fff&size=128";
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUserId())
                .userFullName(userFullName)
                .userAvatar(userAvatar)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .formattedDate(formatDate(review.getCreatedAt()))
                .build();
    }

    /** Cherche un champ dans la map en essayant plusieurs noms de clés possibles */
    private String getField(Map<String, String> map, String... keys) {
        for (String key : keys) {
            Object val = map.get(key);
            if (val != null && !val.toString().isBlank()) {
                return val.toString();
            }
        }
        return null;
    }

    private String formatDate(LocalDateTime date) {
        if (date == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        return date.format(formatter);
    }
}
