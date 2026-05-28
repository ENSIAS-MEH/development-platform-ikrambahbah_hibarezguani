package com.projectmatch.messagingservice.config;

import com.projectmatch.messagingservice.security.JwtUtil;
import com.projectmatch.messagingservice.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserStatusService userStatusService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");

            if (authHeaders == null || authHeaders.isEmpty()) {
                throw new RuntimeException("Token WebSocket manquant");
            }

            String token = authHeaders.get(0);
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            try {
                Long userId  = jwtUtil.extractUserId(token);
                String email = jwtUtil.extractEmail(token);
                String role  = jwtUtil.extractRole(token);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userId.toString(),
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );

                Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
                if (sessionAttrs != null) {
                    sessionAttrs.put("userId", userId);
                    sessionAttrs.put("email",  email);
                }

                accessor.setUser(auth);

                System.out.println("✅ WebSocket CONNECT — userId: " + userId + ", email: " + email);

            } catch (Exception e) {
                System.err.println("❌ WebSocket auth échouée : " + e.getMessage());
                throw new RuntimeException("Token WebSocket invalide ou expiré");
            }
        }
        return message;
    }

    @EventListener
    public void handleSessionConnected(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();

        System.out.println("🔌 [SessionConnectEvent] sessionId: " + sessionId);
        System.out.println("🔌 [SessionConnectEvent] sessionAttrs: " + sessionAttrs);

        if (sessionAttrs != null) {
            Long userId = (Long) sessionAttrs.get("userId");
            System.out.println("🔌 [SessionConnectEvent] userId récupéré: " + userId);
            if (userId != null) {
                userStatusService.userConnected(userId, sessionId);
            } else {
                System.out.println("❌ [SessionConnectEvent] userId est NULL !");
            }
        } else {
            System.out.println("❌ [SessionConnectEvent] sessionAttrs est NULL !");
        }
    }

    @EventListener
    public void handleSessionDisconnected(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttrs = accessor.getSessionAttributes();

        System.out.println("🔌 [SessionDisconnectEvent] sessionAttrs: " + sessionAttrs);

        if (sessionAttrs != null) {
            Long userId = (Long) sessionAttrs.get("userId");
            System.out.println("🔌 [SessionDisconnectEvent] userId récupéré: " + userId);
            if (userId != null) {
                userStatusService.userDisconnected(userId);
            }
        }
    }
}