package com.projectmatch.training_service.repository;

import com.projectmatch.training_service.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByTrainingId(Long trainingId);
}