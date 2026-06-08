package com.projectmatch.projectservice.controller;

import com.projectmatch.projectservice.dto.request.JoinRequestDto;
import com.projectmatch.projectservice.dto.response.JoinRequestResponse;
import com.projectmatch.projectservice.service.JoinRequestService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    @PostMapping("/{projectId}/join-requests")
    @PreAuthorize("hasRole('STUDENT')")  // ✅ Seulement les étudiants
    public ResponseEntity<JoinRequestResponse> send(
            @PathVariable Long projectId,
            @RequestBody JoinRequestDto dto,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(joinRequestService.sendRequest(projectId, dto, userId));
    }

    @GetMapping("/{projectId}/join-requests")
    @PreAuthorize("hasRole('STUDENT')")  // ✅ Seulement les étudiants
    public ResponseEntity<List<JoinRequestResponse>> getAll(
            @PathVariable Long projectId,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(joinRequestService.getRequestsByProject(projectId, userId));
    }

    @PatchMapping("/{projectId}/join-requests/{requestId}/approve")
    @PreAuthorize("hasRole('STUDENT')")  // ✅ Seulement les étudiants
    public ResponseEntity<JoinRequestResponse> approve(
            @PathVariable Long projectId,
            @PathVariable Long requestId,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(joinRequestService.approveRequest(projectId, requestId, userId));
    }

    @PatchMapping("/{projectId}/join-requests/{requestId}/reject")
    @PreAuthorize("hasRole('STUDENT')")  // ✅ Seulement les étudiants
    public ResponseEntity<JoinRequestResponse> reject(
            @PathVariable Long projectId,
            @PathVariable Long requestId,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(joinRequestService.rejectRequest(projectId, requestId, userId));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('STUDENT')")  // ✅ Seulement les étudiants
    public ResponseEntity<List<JoinRequestResponse>> myRequests(HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(joinRequestService.getMyRequests(userId));
    }
}