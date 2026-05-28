package com.projectmatch.projectservice.service;

import com.projectmatch.projectservice.dto.request.JoinRequestDto;
import com.projectmatch.projectservice.dto.response.JoinRequestResponse;
import com.projectmatch.projectservice.entity.JoinRequest;
import com.projectmatch.projectservice.entity.Project;
import com.projectmatch.projectservice.entity.ProjectMember;
import com.projectmatch.projectservice.enums.MemberRole;
import com.projectmatch.projectservice.enums.RequestStatus;
import com.projectmatch.projectservice.exception.BusinessException;
import com.projectmatch.projectservice.exception.ResourceNotFoundException;
import com.projectmatch.projectservice.repository.JoinRequestRepository;
import com.projectmatch.projectservice.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final ProjectMemberRepository memberRepository;
    private final ProjectService projectService;

    // ── Envoyer une demande ──────────────────────────────────────
    public JoinRequestResponse sendRequest(Long projectId, JoinRequestDto dto, Long applicantId) {
        Project project = projectService.findOrThrow(projectId);

        if (project.getStatus() != com.projectmatch.projectservice.enums.ProjectStatus.PUBLISHED) {
            throw new BusinessException("Ce projet n'accepte pas de demandes");
        }
        if (project.getOwnerId().equals(applicantId)) {
            throw new BusinessException("Tu es déjà propriétaire de ce projet");
        }
        if (memberRepository.existsByProjectIdAndUserId(projectId, applicantId)) {
            throw new BusinessException("Tu es déjà membre de ce projet");
        }
        if (joinRequestRepository.existsByProjectIdAndApplicantIdAndStatus(
                projectId, applicantId, RequestStatus.PENDING)) {
            throw new BusinessException("Une demande est déjà en attente pour ce projet");
        }
        if (project.isFull()) {
            throw new BusinessException("Ce projet a atteint sa capacité maximale");
        }

        JoinRequest request = JoinRequest.builder()
                .project(project)
                .applicantId(applicantId)
                .message(dto.getMessage())
                .status(RequestStatus.PENDING)
                .build();

        return toResponse(joinRequestRepository.save(request));
    }

    // ── Approuver une demande ─────────────────────────────────────
    public JoinRequestResponse approveRequest(Long projectId, Long requestId, Long ownerId) {
        Project project = projectService.findOrThrow(projectId);
        checkOwner(project, ownerId);

        JoinRequest joinRequest = findRequestOrThrow(requestId);
        checkRequestBelongsToProject(joinRequest, projectId);

        if (joinRequest.getStatus() != RequestStatus.PENDING) {
            throw new BusinessException("Cette demande a déjà été traitée");
        }
        if (project.isFull()) {
            throw new BusinessException("Le projet est complet, impossible d'approuver");
        }

        joinRequest.approve();
        joinRequestRepository.save(joinRequest);

        // Ajouter automatiquement en tant que membre CONTRIBUTOR
        ProjectMember newMember = ProjectMember.builder()
                .project(project)
                .userId(joinRequest.getApplicantId())
                .role(MemberRole.CONTRIBUTOR)
                .build();
        memberRepository.save(newMember);

        return toResponse(joinRequest);
    }

    // ── Rejeter une demande ──────────────────────────────────────
    public JoinRequestResponse rejectRequest(Long projectId, Long requestId, Long ownerId) {
        Project project = projectService.findOrThrow(projectId);
        checkOwner(project, ownerId);

        JoinRequest joinRequest = findRequestOrThrow(requestId);
        checkRequestBelongsToProject(joinRequest, projectId);

        if (joinRequest.getStatus() != RequestStatus.PENDING) {
            throw new BusinessException("Cette demande a déjà été traitée");
        }

        joinRequest.reject();
        return toResponse(joinRequestRepository.save(joinRequest));
    }

    // ── Voir les demandes d'un projet ────────────────────────────
    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getRequestsByProject(Long projectId, Long ownerId) {
        Project project = projectService.findOrThrow(projectId);
        checkOwner(project, ownerId);
        return joinRequestRepository.findByProjectId(projectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Mes demandes (applicant) ─────────────────────────────────
    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getMyRequests(Long applicantId) {
        return joinRequestRepository.findByApplicantId(applicantId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────
    private JoinRequest findRequestOrThrow(Long id) {
        return joinRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable : " + id));
    }

    private void checkRequestBelongsToProject(JoinRequest req, Long projectId) {
        if (!req.getProject().getId().equals(projectId)) {
            throw new BusinessException("Cette demande n'appartient pas à ce projet");
        }
    }

    private void checkOwner(Project project, Long userId) {
        if (!project.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Action réservée au propriétaire du projet");
        }
    }

    private JoinRequestResponse toResponse(JoinRequest r) {
        return JoinRequestResponse.builder()
                .id(r.getId())
                .projectId(r.getProject().getId())
                .applicantId(r.getApplicantId())
                .status(r.getStatus().name())
                .message(r.getMessage())
                .requestedAt(r.getRequestedAt())
                .reviewedAt(r.getReviewedAt())
                .build();
    }
}