package com.projectmatch.messagingservice.repository;

import com.projectmatch.messagingservice.entity.Conversation;
import com.projectmatch.messagingservice.entity.ConversationType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByProjectId(Long projectId);
    boolean existsByProjectId(Long projectId);

    // ✅  méthode pour récupérer les conversations par type
    List<Conversation> findByType(ConversationType type);
}