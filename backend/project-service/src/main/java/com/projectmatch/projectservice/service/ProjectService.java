package com.projectmatch.projectservice.service;

import com.projectmatch.projectservice.dto.request.CreateProjectRequest;
import com.projectmatch.projectservice.dto.response.MemberResponse;
import com.projectmatch.projectservice.dto.response.ProjectResponse;
import com.projectmatch.projectservice.entity.*;
import com.projectmatch.projectservice.enums.MemberRole;
import com.projectmatch.projectservice.enums.ProjectStatus;
import com.projectmatch.projectservice.exception.BusinessException;
import com.projectmatch.projectservice.exception.ResourceNotFoundException;
import com.projectmatch.projectservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final ProjectTagRepository tagRepository;

    // ── Créer un projet ──────────────────────────────────────────
    public ProjectResponse createProject(CreateProjectRequest req, Long ownerId) {
        Project project = Project.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .maxMembers(req.getMaxMembers())
                .ownerId(ownerId)
                .status(ProjectStatus.DRAFT)
                .build();
        project = projectRepository.save(project);

        // Owner automatiquement ajouté comme membre OWNER
        ProjectMember ownerMember = ProjectMember.builder()
                .project(project)
                .userId(ownerId)
                .role(MemberRole.OWNER)
                .build();
        memberRepository.save(ownerMember);

        // Sauvegarde des tags
        if (req.getTags() != null && !req.getTags().isEmpty()) {
            Project finalProject = project;
            List<ProjectTag> tags = req.getTags().stream()
                    .map(label -> ProjectTag.builder()
                            .label(label.trim().toLowerCase())
                            .project(finalProject)
                            .build())
                    .collect(Collectors.toList());
            tagRepository.saveAll(tags);
        }

        return toResponse(project);
    }

    // ── Publier un projet ────────────────────────────────────────
    public ProjectResponse publishProject(Long projectId, Long userId) {
        Project project = findOrThrow(projectId);
        checkOwner(project, userId);
        if (project.getStatus() == ProjectStatus.ARCHIVED) {
            throw new BusinessException("Un projet archivé ne peut pas être publié");
        }
        project.publish();
        return toResponse(projectRepository.save(project));
    }

    // ── Archiver un projet ───────────────────────────────────────
    public ProjectResponse archiveProject(Long projectId, Long userId) {
        Project project = findOrThrow(projectId);
        checkOwner(project, userId);
        project.archive();
        return toResponse(projectRepository.save(project));
    }

    // ── Lire un projet ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId) {
        return toResponse(findOrThrow(projectId));
    }

    // ── Lister les projets publiés (paginé) ──────────────────────
    @Transactional(readOnly = true)
    public Page<ProjectResponse> getPublishedProjects(Pageable pageable) {
        return projectRepository
                .findByStatus(ProjectStatus.PUBLISHED, pageable)
                .map(this::toResponse);
    }

    // ── Mes projets (owner) ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<ProjectResponse> getMyProjects(Long ownerId) {
        return projectRepository.findByOwnerId(ownerId)
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Membres d'un projet ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MemberResponse> getMembers(Long projectId) {
        return memberRepository.findByProjectId(projectId)
                .stream()
                .map(m -> MemberResponse.builder()
                        .id(m.getId())
                        .userId(m.getUserId())
                        .role(m.getRole().name())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Retirer un membre ────────────────────────────────────────
    public void removeMember(Long projectId, Long targetUserId, Long requesterId) {
        Project project = findOrThrow(projectId);
        checkOwner(project, requesterId);
        if (targetUserId.equals(project.getOwnerId())) {
            throw new BusinessException("Impossible de retirer le propriétaire du projet");
        }
        memberRepository.deleteByProjectIdAndUserId(projectId, targetUserId);
    }

    // ── Helpers ──────────────────────────────────────────────────
    public Project findOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + id));
    }

    private void checkOwner(Project project, Long userId) {
        if (!project.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Action réservée au propriétaire du projet");
        }
    }

    private ProjectResponse toResponse(Project p) {
        List<String> tags = tagRepository.findByProjectId(p.getId())
                .stream().map(ProjectTag::getLabel).collect(Collectors.toList());
        return ProjectResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .status(p.getStatus().name())
                .ownerId(p.getOwnerId())
                .maxMembers(p.getMaxMembers())
                .memberCount(memberRepository.findByProjectId(p.getId()).size())
                .tags(tags)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}