// src/components/messaging/MessageList.jsx
import { useEffect, useRef, useState } from "react";
import { deleteMessage } from "../../services/messagingApi";
import "./Messaging.css";

export default function MessageList({ messages, currentUserId, profiles = {} }) {
  const messagesEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fermer le menu contextuel au clic ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0, message: null });
    };
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getSenderName = (senderId) => {
    const profile = profiles[senderId];
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile?.firstName) return profile.firstName;
    return null;
  };

  const getStatusIcon = (msg) => {
    if (msg.isTemp) return <span className="msg-status" title="Envoi en cours...">⏳</span>;
    if (msg.error) return <span className="msg-status msg-status-error" title="Échec d'envoi">⚠️</span>;
    
    switch (msg.status) {
      case "READ":
        return <span className="msg-status msg-status-read" title="Lu">✓✓</span>;
      case "DELIVERED":
        return <span className="msg-status msg-status-delivered" title="Délivré">✓✓</span>;
      case "SENT":
        return <span className="msg-status msg-status-sent" title="Envoyé">✓</span>;
      case "DELETED":
        return <span className="msg-status msg-status-deleted" title="Message supprimé">🗑️</span>;
      default:
        return null;
    }
  };

  const isDeleted = (msg) => msg.status === "DELETED";

  // ✅ Gestion du clic droit pour ouvrir le menu contextuel
  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    // Seul l'expéditeur peut supprimer son message
    if (msg.senderId !== currentUserId) return;
    if (isDeleted(msg)) return;
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      message: msg
    });
  };

  // ✅ Supprimer un message
  const handleDeleteMessage = async () => {
    if (!contextMenu.message) return;
    
    setDeleteConfirm({
      id: contextMenu.message.id,
      content: contextMenu.message.content
    });
    setContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMessage(deleteConfirm.id);
      // Le message sera mis à jour via WebSocket (status DELETED)
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Impossible de supprimer le message");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getMessageContent = (msg) => {
    if (isDeleted(msg)) {
      return <em className="deleted-message">Ce message a été supprimé</em>;
    }
    
    return (
      <div className="message-content-wrapper">
        {msg.content && <div className="message-text">{msg.content}</div>}
        
        {msg.attachmentUrls && msg.attachmentUrls.length > 0 && (
          <div className="message-attachments">
            {msg.attachmentUrls.map((url, idx) => (
              <a 
                key={idx} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="message-attachment"
              >
                {url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) ? (
                  <img src={url} alt="attachment" className="attachment-image" />
                ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={url} controls className="attachment-video" />
                ) : (
                  <div className="attachment-file">
                    <span className="attachment-icon">📎</span>
                    <span className="attachment-name">{decodeURIComponent(url.split('/').pop() || 'fichier')}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="messages-empty">
        <div className="empty-state-icon">💬</div>
        <p>Aucun message pour le moment</p>
        <p>Soyez le premier à envoyer un message !</p>
      </div>
    );
  }

  return (
    <>
      <div className="messages-list">
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === currentUserId;
          const showDate = index === 0 ||
            new Date(msg.sentAt).toDateString() !== new Date(messages[index - 1]?.sentAt).toDateString();

          const prevMsg = messages[index - 1];
          const showSenderInfo = !isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId || showDate);
          const senderName = getSenderName(msg.senderId);
          const isDeletedMsg = isDeleted(msg);

          return (
            <div key={msg.id || `temp-${index}`}>
              {showDate && (
                <div className="messages-date-separator">
                  <span>{formatDateSeparator(msg.sentAt)}</span>
                </div>
              )}

              <div 
                className={`message-item ${isOwn ? "own" : "other"} ${msg.error ? "error" : ""} ${msg.isTemp ? "temp" : ""} ${isDeletedMsg ? "deleted" : ""}`}
                data-message-id={msg.id}
                onContextMenu={(e) => handleContextMenu(e, msg)}
              >
                {!isOwn && (
                  <div className="message-avatar-col">
                    {showSenderInfo ? (
                      <div className="message-avatar">
                        {profiles[msg.senderId]?.avatarUrl ? (
                          <img src={profiles[msg.senderId].avatarUrl} alt="avatar" className="message-avatar-img" />
                        ) : (
                          <div className="message-avatar-placeholder">
                            {senderName ? senderName[0].toUpperCase() : "?"}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="message-avatar-spacer" />
                    )}
                  </div>
                )}

                <div className="message-body">
                  {showSenderInfo && senderName && (
                    <div className="message-sender-name">{senderName}</div>
                  )}

                  <div className="message-bubble-wrapper">
                    <div className={`message-bubble ${isDeletedMsg ? "deleted" : ""}`}>
                      <div className="message-content">{getMessageContent(msg)}</div>
                    </div>
                    
                    <div className="message-meta">
                      <span className="message-time">{formatTime(msg.sentAt)}</span>
                      {isOwn && getStatusIcon(msg)}
                    </div>
                  </div>

                  {msg.error && (
                    <div className="message-error-label">⚠️ Échec de l'envoi</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Menu contextuel */}
      {contextMenu.visible && (
        <div 
          className="message-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={handleDeleteMessage}>
            <span className="context-menu-icon">🗑️</span>
            Supprimer pour moi
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Supprimer le message</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Voulez-vous vraiment supprimer ce message ?</p>
              {deleteConfirm.content && (
                <p className="delete-message-preview">"{deleteConfirm.content.substring(0, 50)}..."</p>
              )}
              <p className="delete-warning">Cette action est irréversible.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}