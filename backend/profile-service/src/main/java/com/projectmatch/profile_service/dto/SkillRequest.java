package com.projectmatch.profile_service.dto;

import com.projectmatch.profile_service.entity.enums.SkillLevel;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SkillRequest {
    private String name;
    private SkillLevel level;
}