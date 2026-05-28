package com.projectmatch.projectservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JoinRequestResponse {
    private Long id;
    private Long projectId;
    private Long applicantId;
    private String status;
    private String message;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;
}