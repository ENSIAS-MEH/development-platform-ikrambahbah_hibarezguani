// src/components/messaging/MessagingSidebar.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../../services/messagingApi";
import ConversationList from "./ConversationList";
import NewConversationModal from "./NewConversationModal";
import "./Messaging.css";

export default function MessagingSidebar({ currentConversationId, onConversationSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConversations();
      // ✅ Ne garder que les conversations valides (avec un id)
      const validConvs = (res.data || []).filter(conv => conv && conv.id);
      setConversations(validConvs);
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ✅ Rafraîchir après création d'une nouvelle conversation
  const handleModalSuccess = useCallback(async () => {
    await loadConversations();
    setShowModal(false);
  }, [loadConversations]);

  const handleConversationClick = (conversationId) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    } else {
      navigate(`/conversations/${conversationId}`);
    }
  };

  return (
    <div className="messaging-sidebar">
      <div className="messaging-header">
        <h2>Messages</h2>
        <button className="new-conversation-btn" onClick={() => setShowModal(true)}>
          + Nouvelle
        </button>
      </div>

      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversationId}
        loading={loading}
        onConversationClick={handleConversationClick}
      />

      <NewConversationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}