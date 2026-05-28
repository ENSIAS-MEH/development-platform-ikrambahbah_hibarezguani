package com.projectmatch.projectservice.controller;

import com.projectmatch.projectservice.dto.request.CreateProjectRequest;
import com.projectmatch.projectservice.dto.response.MemberResponse;
import com.projectmatch.projectservice.dto.response.ProjectResponse;
import com.projectmatch.projectservice.entity.ProjectMember;
import com.projectmatch.projectservice.repository.ProjectMemberRepository;
import com.projectmatch.projectservice.service.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMemberRepository memberRepository;  // ✅ AJOUTER CETTE LIGNE

    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @Valid @RequestBody CreateProjectRequest request,
            HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(request, userId));
    }

    @GetMapping
    public ResponseEntity<Page<ProjectResponse>> getPublished(Pageable pageable) {
        return ResponseEntity.ok(projectService.getPublishedProjects(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProjectResponse>> getMine(HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(projectService.getMyProjects(userId));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<ProjectResponse> publish(
            @PathVariable Long id, HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(projectService.publishProject(id, userId));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ProjectResponse> archive(
            @PathVariable Long id, HttpServletRequest http) {
        Long userId = (Long) http.getAttribute("userId");
        return ResponseEntity.ok(projectService.archiveProject(id, userId));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getMembers(id));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            HttpServletRequest http) {
        Long requesterId = (Long) http.getAttribute("userId");
        projectService.removeMember(id, userId, requesterId);
        return ResponseEntity.noContent().build();
    }

    // ✅ Endpoint pour récupérer uniquement les IDs des membres
    @GetMapping("/{id}/members/user-ids")
    public ResponseEntity<Map<String, List<Long>>> getMemberUserIds(@PathVariable Long id) {
        List<Long> userIds = memberRepository.findByProjectId(id)
                .stream()
                .map(ProjectMember::getUserId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("userIds", userIds));
    }
}