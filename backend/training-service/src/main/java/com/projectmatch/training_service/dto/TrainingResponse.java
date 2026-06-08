package com.projectmatch.training_service.dto;

import com.projectmatch.training_service.entity.Training;
import com.projectmatch.training_service.entity.enums.TrainingStatus;
import com.projectmatch.training_service.entity.enums.TrainingType;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainingResponse {
    private Long id;
    private String title;
    private String description;
    private Long mentorId;
    private TrainingType type;
    private TrainingStatus status;
    private Integer duration;
    private Integer maxStudents;
    private String thumbnailUrl;
    private LocalDateTime createdAt;
    private Integer enrolledCount;
    private Double averageRating;

    // ── NOUVEAU ──
    private Double price;

    public static TrainingResponse fromEntity(Training training) {
        return TrainingResponse.builder()
                .id(training.getId())
                .title(training.getTitle())
                .description(training.getDescription())
                .mentorId(training.getMentorId())
                .type(training.getType())
                .status(training.getStatus())
                .duration(training.getDuration())
                .maxStudents(training.getMaxStudents())
                .thumbnailUrl(training.getThumbnailUrl())
                .createdAt(training.getCreatedAt())
                .price(training.getPrice())
                .enrolledCount(training.getEnrollments() != null
                        ? training.getEnrollments().size() : 0)
                .build();
    }
}
