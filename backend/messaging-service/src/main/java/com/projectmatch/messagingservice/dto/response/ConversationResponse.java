package com.projectmatch.messagingservice.dto.response;

import com.projectmatch.messagingservice.entity.ConversationType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ConversationResponse {
    private Long id;
    private ConversationType type;
    private String name;
    private Long projectId;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private List<Long> participantIds;
}