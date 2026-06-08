package com.projectmatch.training_service.repository;

import com.projectmatch.training_service.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByUserId(Long userId);

    List<Enrollment> findByTrainingId(Long trainingId);

    Optional<Enrollment> findByUserIdAndTrainingId(Long userId, Long trainingId);

    boolean existsByUserIdAndTrainingId(Long userId, Long trainingId);
}