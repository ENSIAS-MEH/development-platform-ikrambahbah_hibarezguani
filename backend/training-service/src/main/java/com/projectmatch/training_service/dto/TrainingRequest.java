package com.projectmatch.training_service.dto;

import com.projectmatch.training_service.entity.enums.TrainingType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingRequest {
    private String title;
    private String description;
    private TrainingType type;
    private Integer duration;
    private Integer maxStudents;
    private String thumbnailUrl;

    // ── NOUVEAU : prix (optionnel, null ou 0 pour les formations gratuites) ──
    private Double price;
}
