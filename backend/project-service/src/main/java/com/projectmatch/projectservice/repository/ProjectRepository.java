package com.projectmatch.projectservice.repository;

import com.projectmatch.projectservice.entity.Project;
import com.projectmatch.projectservice.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerId(Long ownerId);
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);
}