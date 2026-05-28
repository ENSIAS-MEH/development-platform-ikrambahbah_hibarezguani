package com.projectmatch.messagingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageStatusUpdate {
    private String type;          // "STATUS_UPDATE"
    private Long messageId;
    private Long conversationId;
    private String status;        // "SENT", "DELIVERED", "READ", "DELETED"
    private LocalDateTime timestamp;
}