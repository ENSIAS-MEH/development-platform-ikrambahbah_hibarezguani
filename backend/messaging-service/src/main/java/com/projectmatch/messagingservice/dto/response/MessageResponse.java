package com.projectmatch.messagingservice.dto.response;

import com.projectmatch.messagingservice.entity.MessageStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String content;
    private MessageStatus status;
    private LocalDateTime sentAt;
    private List<String> attachmentUrls;
}