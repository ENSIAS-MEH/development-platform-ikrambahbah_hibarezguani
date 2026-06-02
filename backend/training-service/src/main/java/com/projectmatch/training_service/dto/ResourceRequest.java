package com.projectmatch.training_service.dto;

import com.projectmatch.training_service.entity.enums.ResourceType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequest {
    private String title;
    private String url;
    private ResourceType type;
    private Integer orderIndex;
}