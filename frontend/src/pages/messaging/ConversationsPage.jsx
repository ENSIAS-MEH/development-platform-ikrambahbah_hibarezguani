// src/pages/messaging/ConversationsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../../services/messagingApi";
import ConversationList from "../../components/messaging/ConversationList";
import NewConversationModal from "../../components/messaging/NewConversationModal";
import "../../components/messaging/Messaging.css";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const navigate = useNavigate();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConversations();
      // ✅ Filtrer les conversations valides
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

  const handleModalSuccess = useCallback(async () => {
    await loadConversations();
    setShowModal(false);
  }, [loadConversations]);

  return (
    <div className="messaging-container">

      {/* Sidebar liste des conversations */}
      <div className="messaging-sidebar">
        <div className="messaging-header">
          <h2>Messages</h2>
          <button className="new-conversation-btn" onClick={() => setShowModal(true)}>
            + Nouvelle
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          loading={loading}
          onConversationClick={id => navigate(`/conversations/${id}`)}
        />
      </div>

      {/* Zone principale : placeholder quand aucune conversation ouverte */}
      <div className="messaging-main">
        <div className="messaging-placeholder">
          <div className="placeholder-icon">💬</div>
          <h3>Sélectionnez une conversation</h3>
          <p>Choisissez une conversation pour commencer à discuter</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            ✨ Nouvelle conversation
          </button>
        </div>
      </div>

      {/* Modal création de conversation */}
      <NewConversationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}