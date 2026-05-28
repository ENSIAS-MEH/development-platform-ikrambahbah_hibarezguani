// MessageAttachmentRepository.java
package com.projectmatch.messagingservice.repository;

import com.projectmatch.messagingservice.entity.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {
    List<MessageAttachment> findByMessageId(Long messageId);
}