package com.projectmatch.messagingservice.repository;

import com.projectmatch.messagingservice.entity.Message;
import com.projectmatch.messagingservice.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Récupère tous les messages d'une conversation triés par date croissante.
     */
    List<Message> findByConversationIdOrderBySentAtAsc(Long conversationId);

    /**
     * ✅ Utilisé par markAsDelivered :
     * Messages SENT envoyés par quelqu'un d'autre que recipientId.
     */
    @Query("""
        SELECT m FROM Message m
        WHERE m.conversationId = :conversationId
          AND m.senderId       != :recipientId
          AND m.status         = 'SENT'
    """)
    List<Message> findByConversationIdAndSenderIdNotAndStatus(
            @Param("conversationId") Long conversationId,
            @Param("recipientId")   Long recipientId,
            MessageStatus status
    );

    /**
     * ✅ Utilisé par markConversationAsRead :
     * Messages non lus (status != READ) envoyés par quelqu'un d'autre que readerId.
     */
    @Query("""
        SELECT m FROM Message m
        WHERE m.conversationId = :conversationId
          AND m.senderId       != :readerId
          AND m.status         != 'READ'
          AND m.status         != 'DELETED'
    """)
    List<Message> findByConversationIdAndSenderIdNotAndStatusNot(
            @Param("conversationId") Long conversationId,
            @Param("readerId")       Long readerId,
            MessageStatus status
    );

    /**
     * ✅ NOUVEAU : Récupère TOUS les messages non délivrés (status SENT)
     * pour un utilisateur, toutes conversations confondues.
     * Utilisé pour markAllAsDelivered() après connexion WebSocket.
     */
    @Query("""
        SELECT m FROM Message m
        WHERE m.senderId != :userId
          AND m.status = 'SENT'
    """)
    List<Message> findAllUndeliveredMessages(@Param("userId") Long userId);
}