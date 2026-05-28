package com.projectmatch.messagingservice.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;

@Service
public class UserStatusService {

    private final ConcurrentHashMap<Long, String> onlineUsers = new ConcurrentHashMap<>();

    public void userConnected(Long userId, String sessionId) {
        onlineUsers.put(userId, sessionId);
        System.out.println("🟢 [UserStatusService] User " + userId + " connected - Total online: " + onlineUsers.size());
    }

    public void userDisconnected(Long userId) {
        onlineUsers.remove(userId);
        System.out.println("🔴 [UserStatusService] User " + userId + " disconnected - Total online: " + onlineUsers.size());
    }

    public boolean isOnline(Long userId) {
        boolean online = onlineUsers.containsKey(userId);
        System.out.println("🔍 [UserStatusService] isOnline(" + userId + ") = " + online);
        return online;
    }

    public Set<Long> getAllOnlineUsers() {
        return onlineUsers.keySet();
    }
}