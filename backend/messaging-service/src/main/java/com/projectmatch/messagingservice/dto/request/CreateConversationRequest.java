package com.projectmatch.messagingservice.dto.request;

import com.projectmatch.messagingservice.entity.ConversationType;
import lombok.Data;
import java.util.List;

@Data
public class CreateConversationRequest {
    private ConversationType type;
    private String name;
    private Long projectId;
    private List<Long> participantIds; // pour DIRECT et GROUP uniquement
}