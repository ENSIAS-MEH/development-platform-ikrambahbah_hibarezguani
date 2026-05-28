// ParticipantRepository.java
package com.projectmatch.messagingservice.repository;

import com.projectmatch.messagingservice.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByConversationId(Long conversationId);
    List<Participant> findByUserId(Long userId);
    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);
}