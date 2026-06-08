package com.projectmatch.training_service.repository;

import com.projectmatch.training_service.entity.Training;
import com.projectmatch.training_service.entity.enums.TrainingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TrainingRepository extends JpaRepository<Training, Long> {

    List<Training> findByMentorId(Long mentorId);

    List<Training> findByStatus(TrainingStatus status);

    @Query("SELECT t FROM Training t WHERE t.status = 'PUBLISHED'")
    List<Training> findAllPublished();

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.training.id = :trainingId")
    Integer countEnrollmentsByTrainingId(@Param("trainingId") Long trainingId);
}