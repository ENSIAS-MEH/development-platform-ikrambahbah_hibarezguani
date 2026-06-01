package com.projectmatch.messagingservice.dto.request;

import lombok.Data;
import java.util.List;

/**
 * ✅ FIX B2 : senderId supprimé du DTO.
 * Il est maintenant extrait du JWT dans MessageController
 * et passé directement à MessageService.sendMessage(req, senderId).
 *
 * Cela empêche tout utilisateur de se faire passer pour quelqu'un d'autre
 * en forgeant un body avec un senderId arbitraire.
 */
@Data
public class SendMessageRequest {
    private Long conversationId;
    private String content;
    private List<String> attachmentUrls;
}