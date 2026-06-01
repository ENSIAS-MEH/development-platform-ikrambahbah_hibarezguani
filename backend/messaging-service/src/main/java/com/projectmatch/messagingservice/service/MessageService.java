package com.projectmatch.messagingservice.service;

import com.projectmatch.messagingservice.dto.MessageStatusUpdate;
import com.projectmatch.messagingservice.dto.request.SendMessageRequest;
import com.projectmatch.messagingservice.dto.response.MessageResponse;
import com.projectmatch.messagingservice.entity.*;
import com.projectmatch.messagingservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository         messageRepository;
    private final MessageAttachmentRepository attachmentRepository;
    private final ConversationRepository    conversationRepository;
    private final ParticipantRepository     participantRepository;
    private final SimpMessagingTemplate     messagingTemplate;
    private final FileStorageService fileStorageService;

    // ─────────────────────────────────────────────────────────────────
    // ENVOYER UN MESSAGE
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest req, Long senderId) {
        if (!participantRepository.existsByConversationIdAndUserId(
                req.getConversationId(), senderId)) {
            throw new RuntimeException("L'utilisateur n'est pas participant de cette conversation.");
        }

        Message message = Message.builder()
                .conversationId(req.getConversationId())
                .senderId(senderId)
                .content(req.getContent())
                .status(MessageStatus.SENT)
                .build();
        message = messageRepository.save(message);

        final Long convId = req.getConversationId();
        conversationRepository.findById(convId).ifPresent(conv -> {
            conv.setLastMessageAt(LocalDateTime.now());
            conversationRepository.save(conv);
        });

        List<String> attachmentUrls = List.of();
        if (req.getAttachmentUrls() != null && !req.getAttachmentUrls().isEmpty()) {
            final Long msgId = message.getId();
            List<MessageAttachment> attachments = req.getAttachmentUrls().stream()
                    .map(url -> MessageAttachment.builder()
                            .messageId(msgId)
                            .fileUrl(url)
                            .build())
                    .collect(Collectors.toList());
            attachmentRepository.saveAll(attachments);
            attachmentUrls = req.getAttachmentUrls();
        }

        MessageResponse response = toResponse(message, attachmentUrls);
        broadcastToConversation(convId, response);

        return response;
    }

    // ─────────────────────────────────────────────────────────────────
    // LIRE LES MESSAGES
    // ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderBySentAtAsc(conversationId)
                .stream()
                .map(msg -> {
                    List<String> urls = attachmentRepository.findByMessageId(msg.getId())
                            .stream().map(MessageAttachment::getFileUrl).collect(Collectors.toList());
                    return toResponse(msg, urls);
                })
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // MARQUER DELIVERED (conversation spécifique)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void markAsDelivered(Long conversationId, Long recipientId) {
        List<Message> messages = messageRepository
                .findByConversationIdAndSenderIdNotAndStatus(
                        conversationId, recipientId, MessageStatus.SENT);

        if (!messages.isEmpty()) {
            messages.forEach(msg -> msg.setStatus(MessageStatus.DELIVERED));
            messageRepository.saveAll(messages);
            for (Message msg : messages) {
                broadcastStatusUpdate(conversationId, msg.getId(), MessageStatus.DELIVERED);
            }
            System.out.println("✅ " + messages.size() + " messages → DELIVERED (conv: " + conversationId + ")");
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // ✅ NOUVEAU : MARQUER DELIVERED (TOUTES les conversations)
    // Appelé quand l'utilisateur se connecte au WebSocket
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void markAllAsDelivered(Long recipientId) {
        List<Message> messages = messageRepository.findAllUndeliveredMessages(recipientId);

        if (!messages.isEmpty()) {
            // Grouper par conversation pour éviter trop de broadcasts
            java.util.Map<Long, List<Message>> byConversation = messages.stream()
                    .collect(Collectors.groupingBy(Message::getConversationId));

            for (java.util.Map.Entry<Long, List<Message>> entry : byConversation.entrySet()) {
                Long convId = entry.getKey();
                List<Message> convMessages = entry.getValue();

                convMessages.forEach(msg -> msg.setStatus(MessageStatus.DELIVERED));
                messageRepository.saveAll(convMessages);

                for (Message msg : convMessages) {
                    broadcastStatusUpdate(convId, msg.getId(), MessageStatus.DELIVERED);
                }
                System.out.println("✅ " + convMessages.size() + " messages → DELIVERED (conv: " + convId + ")");
            }

            System.out.println("✅ TOTAL: " + messages.size() + " messages marqués DELIVERED pour user " + recipientId);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // MARQUER READ (toute la conversation)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void markConversationAsRead(Long conversationId, Long readerId) {
        List<Message> unread = messageRepository
                .findByConversationIdAndSenderIdNotAndStatusNot(
                        conversationId, readerId, MessageStatus.READ);

        List<Message> toUpdate = unread.stream()
                .filter(m -> m.getStatus() != MessageStatus.DELETED)
                .collect(Collectors.toList());

        if (!toUpdate.isEmpty()) {
            toUpdate.forEach(msg -> msg.setStatus(MessageStatus.READ));
            messageRepository.saveAll(toUpdate);
            for (Message msg : toUpdate) {
                broadcastStatusUpdate(conversationId, msg.getId(), MessageStatus.READ);
            }
            System.out.println("✅ " + toUpdate.size() + " messages → READ (conv: " + conversationId + ")");
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // MARQUER READ (message individuel)
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public void markAsRead(Long messageId, Long readerId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message introuvable : " + messageId));

        if (!msg.getSenderId().equals(readerId)
                && msg.getStatus() != MessageStatus.READ
                && msg.getStatus() != MessageStatus.DELETED) {
            msg.setStatus(MessageStatus.READ);
            messageRepository.save(msg);
            broadcastStatusUpdate(msg.getConversationId(), messageId, MessageStatus.READ);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // MISE À JOUR MANUELLE
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse updateStatus(Long messageId, MessageStatus newStatus) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message introuvable : " + messageId));

        if (!isRegression(msg.getStatus(), newStatus)) {
            msg.setStatus(newStatus);
            messageRepository.save(msg);
            broadcastStatusUpdate(msg.getConversationId(), messageId, newStatus);
        }

        List<String> urls = attachmentRepository.findByMessageId(messageId)
                .stream().map(MessageAttachment::getFileUrl).collect(Collectors.toList());
        return toResponse(msg, urls);
    }

    private boolean isRegression(MessageStatus current, MessageStatus next) {
        return statusOrder(next) < statusOrder(current);
    }

    private int statusOrder(MessageStatus s) {
        return switch (s) {
            case SENT      -> 0;
            case DELIVERED -> 1;
            case READ      -> 2;
            case DELETED   -> 3;
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // BROADCAST WebSocket
    // ─────────────────────────────────────────────────────────────────

    private void broadcastToConversation(Long conversationId, Object payload) {
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, payload);
    }

    private void broadcastStatusUpdate(Long conversationId, Long messageId, MessageStatus status) {
        MessageStatusUpdate update = MessageStatusUpdate.builder()
                .type("STATUS_UPDATE")
                .messageId(messageId)
                .conversationId(conversationId)
                .status(status.name())
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, update);
    }

    private MessageResponse toResponse(Message msg, List<String> attachmentUrls) {
        return MessageResponse.builder()
                .id(msg.getId())
                .conversationId(msg.getConversationId())
                .senderId(msg.getSenderId())
                .content(msg.getContent())
                .status(msg.getStatus())
                .sentAt(msg.getSentAt())
                .attachmentUrls(attachmentUrls)
                .build();
    }
// ─────────────────────────────────────────────────────────────────
// SUPPRIMER UN MESSAGE (soft delete)
// ─────────────────────────────────────────────────────────────────

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message introuvable : " + messageId));

        if (!msg.getSenderId().equals(userId)) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres messages");
        }

        if (msg.getStatus() == MessageStatus.DELETED) {
            throw new RuntimeException("Ce message est déjà supprimé");
        }

        // ✅ Récupérer et supprimer les pièces jointes
        List<MessageAttachment> attachments = attachmentRepository.findByMessageId(messageId);
        List<String> attachmentUrls = attachments.stream()
                .map(MessageAttachment::getFileUrl)
                .collect(Collectors.toList());

        if (!attachmentUrls.isEmpty()) {
            fileStorageService.deleteFiles(attachmentUrls);
            attachmentRepository.deleteAll(attachments);
        }

        // Soft delete du message
        msg.setStatus(MessageStatus.DELETED);
        msg.setContent(null);
        messageRepository.save(msg);

        // Broadcast
        broadcastStatusUpdate(msg.getConversationId(), messageId, MessageStatus.DELETED);
    }
}