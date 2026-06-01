package com.projectmatch.messagingservice.controller;

import com.projectmatch.messagingservice.dto.request.SendMessageRequest;
import com.projectmatch.messagingservice.dto.response.MessageResponse;
import com.projectmatch.messagingservice.entity.MessageStatus;
import com.projectmatch.messagingservice.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> send(
            @RequestBody SendMessageRequest req,
            HttpServletRequest http) {
        Long senderId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(messageService.sendMessage(req, senderId));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long conversationId) {
        return ResponseEntity.ok(messageService.getMessages(conversationId));
    }

    @PatchMapping("/{messageId}/status")
    public ResponseEntity<MessageResponse> updateStatus(
            @PathVariable Long messageId,
            @RequestParam MessageStatus status) {
        return ResponseEntity.ok(messageService.updateStatus(messageId, status));
    }

    @PostMapping("/conversation/{conversationId}/delivered")
    public ResponseEntity<Void> markDelivered(
            @PathVariable Long conversationId,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        messageService.markAsDelivered(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/delivered/all")
    public ResponseEntity<Void> markAllDelivered(HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        messageService.markAllAsDelivered(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        messageService.markConversationAsRead(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{messageId}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long messageId,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        messageService.markAsRead(messageId, userId);
        return ResponseEntity.ok().build();
    }

    // ✅ NOUVEAU : Supprimer un message (soft delete)
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        messageService.deleteMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }

    @MessageMapping("/chat.updateStatus")
    public void updateStatusWebSocket(@Payload Map<String, Object> payload) {
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        String statusStr = payload.get("status").toString();
        MessageStatus status = MessageStatus.valueOf(statusStr);

        if (status == MessageStatus.READ && payload.containsKey("userId")) {
            Long userId = Long.valueOf(payload.get("userId").toString());
            messageService.markAsRead(messageId, userId);
        } else {
            messageService.updateStatus(messageId, status);
        }
    }
}