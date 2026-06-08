package com.projectmatch.projectservice.repository;

import com.projectmatch.projectservice.entity.ProjectTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectTagRepository extends JpaRepository<ProjectTag, Long> {
    List<ProjectTag> findByProjectId(Long projectId);
    void deleteByProjectId(Long projectId);
}