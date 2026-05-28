package com.projectmatch.profile_service.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceRequest {
    private String title;
    private String company;
    private String description;
    private LocalDate startDate;  // Garder LocalDate
    private LocalDate endDate;
    private boolean current;
}