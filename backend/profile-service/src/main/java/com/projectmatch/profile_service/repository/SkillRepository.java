package com.projectmatch.profile_service.repository;

import com.projectmatch.profile_service.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {
}