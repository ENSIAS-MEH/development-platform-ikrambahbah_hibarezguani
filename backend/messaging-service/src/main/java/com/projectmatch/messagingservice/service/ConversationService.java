package com.projectmatch.messagingservice.service;

import com.projectmatch.messagingservice.dto.ProjectMembersResponse;
import com.projectmatch.messagingservice.dto.request.CreateConversationRequest;
import com.projectmatch.messagingservice.dto.response.ConversationResponse;
import com.projectmatch.messagingservice.entity.Conversation;
import com.projectmatch.messagingservice.entity.ConversationType;
import com.projectmatch.messagingservice.entity.Participant;
import com.projectmatch.messagingservice.repository.ConversationRepository;
import com.projectmatch.messagingservice.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ParticipantRepository participantRepository;
    private final RestTemplate restTemplate;

    @Value("${project.service.url:http://localhost:8085}")
    private String projectServiceUrl;

    @Transactional
    public ConversationResponse createConversation(CreateConversationRequest req) {

        // ✅ Vérifier si une conversation PROJECT_TEAM existe déjà
        if (req.getType() == ConversationType.PROJECT_TEAM && req.getProjectId() != null) {
            if (conversationRepository.existsByProjectId(req.getProjectId())) {
                log.info("Une conversation existe déjà pour le projet {}", req.getProjectId());
                Conversation existingConv = conversationRepository.findByProjectId(req.getProjectId())
                        .stream().findFirst().orElse(null);
                if (existingConv != null) {
                    List<Long> participantIds = participantRepository.findByConversationId(existingConv.getId())
                            .stream().map(Participant::getUserId).collect(Collectors.toList());
                    return toResponse(existingConv, participantIds);
                }
            }
        }

        // ✅ Vérifier si une conversation GROUP existe déjà avec les mêmes participants
        if (req.getType() == ConversationType.GROUP && req.getParticipantIds() != null) {
            List<Long> sortedParticipants = req.getParticipantIds().stream()
                    .sorted()
                    .collect(Collectors.toList());

            // Chercher une conversation GROUP existante avec exactement les mêmes participants
            List<Conversation> existingGroups = conversationRepository.findByType(ConversationType.GROUP);

            for (Conversation existing : existingGroups) {
                List<Long> existingParticipants = participantRepository.findByConversationId(existing.getId())
                        .stream().map(Participant::getUserId)
                        .sorted()
                        .collect(Collectors.toList());

                // Vérifier si les participants sont identiques
                if (existingParticipants.equals(sortedParticipants)) {
                    log.info("Une conversation de groupe existe déjà avec ces participants (id: {})", existing.getId());
                    return toResponse(existing, existingParticipants);
                }
            }
        }

        Conversation conversation = Conversation.builder()
                .type(req.getType())
                .name(req.getName())
                .projectId(req.getProjectId())
                .build();
        conversation = conversationRepository.save(conversation);

        final Long convId = conversation.getId();
        List<Long> participantIds;

        if (req.getType() == ConversationType.PROJECT_TEAM && req.getProjectId() != null) {
            participantIds = getProjectMembers(req.getProjectId());
            if (participantIds.isEmpty()) {
                throw new IllegalArgumentException("Aucun membre trouvé pour ce projet");
            }
        } else {
            participantIds = req.getParticipantIds();
            if (participantIds == null || participantIds.size() < 2) {
                throw new IllegalArgumentException("Une conversation nécessite au moins 2 participants.");
            }
        }

        List<Participant> participants = participantIds.stream()
                .map(userId -> Participant.builder()
                        .conversationId(convId)
                        .userId(userId)
                        .build())
                .collect(Collectors.toList());
        participantRepository.saveAll(participants);

        return toResponse(conversation, participantIds);
    }

    private List<Long> getProjectMembers(Long projectId) {
        try {
            String url = projectServiceUrl + "/api/projects/" + projectId + "/members/user-ids";
            ProjectMembersResponse response = restTemplate.getForObject(url, ProjectMembersResponse.class);
            if (response != null && response.getUserIds() != null) {
                log.info("Récupéré {} membres pour le projet {}", response.getUserIds().size(), projectId);
                return response.getUserIds();
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération des membres du projet {}: {}", projectId, e.getMessage());
            throw new RuntimeException("Impossible de récupérer les membres du projet");
        }
        return List.of();
    }

    public ConversationResponse getConversation(Long id) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation introuvable : " + id));
        List<Long> participantIds = participantRepository.findByConversationId(id)
                .stream().map(Participant::getUserId).collect(Collectors.toList());
        return toResponse(conv, participantIds);
    }

    public List<ConversationResponse> getConversationsForUser(Long userId) {
        return participantRepository.findByUserId(userId).stream()
                .map(p -> {
                    try {
                        Conversation conv = conversationRepository.findById(p.getConversationId()).orElse(null);
                        if (conv == null) {
                            log.warn("🗑️ Participant orphelin trouvé pour conversation {} (utilisateur {}), suppression...",
                                    p.getConversationId(), userId);
                            participantRepository.delete(p);
                            return null;
                        }
                        List<Long> participantIds = participantRepository.findByConversationId(conv.getId())
                                .stream().map(Participant::getUserId).collect(Collectors.toList());
                        return toResponse(conv, participantIds);
                    } catch (Exception e) {
                        log.error("Erreur lors du chargement de la conversation {}: {}", p.getConversationId(), e.getMessage());
                        return null;
                    }
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    private ConversationResponse toResponse(Conversation conv, List<Long> participantIds) {
        return ConversationResponse.builder()
                .id(conv.getId())
                .type(conv.getType())
                .name(conv.getName())
                .projectId(conv.getProjectId())
                .createdAt(conv.getCreatedAt())
                .lastMessageAt(conv.getLastMessageAt())
                .participantIds(participantIds)
                .build();
    }
}