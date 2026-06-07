package com.projectmatch.messagingservice.controller;

import com.projectmatch.messagingservice.dto.request.CreateConversationRequest;
import com.projectmatch.messagingservice.dto.response.ConversationResponse;
import com.projectmatch.messagingservice.service.ConversationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationResponse> create(@RequestBody CreateConversationRequest req) {
        return ResponseEntity.ok(conversationService.createConversation(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getConversation(id));
    }

    /**
     * ✅ FIX B3 : userId extrait du JWT, plus depuis le path.
     * Avant : GET /conversations/user/{userId} → n'importe qui pouvait lire les convs d'un autre.
     * Après  : GET /conversations/me → retourne les convs de l'utilisateur connecté uniquement.
     */
    @GetMapping("/me")
    public ResponseEntity<List<ConversationResponse>> getMyConversations(HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(conversationService.getConversationsForUser(userId));
    }

    /**
     * Endpoint de test — vérifie que le JWT est bien décodé.
     */
    @GetMapping("/test")
    public ResponseEntity<String> test(HttpServletRequest request) {
        Long userId  = (Long) request.getAttribute("userId");
        String email = (String) request.getAttribute("email");
        return ResponseEntity.ok("Token validé — userId: " + userId + ", email: " + email);
    }
}