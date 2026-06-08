package com.projectmatch.messagingservice.controller;

import com.projectmatch.messagingservice.service.UserStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserStatusController {

    private final UserStatusService userStatusService;

    @GetMapping("/{userId}/status")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable Long userId) {
        boolean isOnline = userStatusService.isOnline(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "online", isOnline
        ));
    }
}