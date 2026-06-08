package com.projectmatch.training_service.repository;

import com.projectmatch.training_service.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTrainingIdOrderByCreatedAtDesc(Long trainingId);
    boolean existsByUserIdAndTrainingId(Long userId, Long trainingId);
}