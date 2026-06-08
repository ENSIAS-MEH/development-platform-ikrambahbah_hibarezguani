// src/components/messaging/ConversationList.jsx
import ConversationItem from "./ConversationItem";
import "./Messaging.css";

export default function ConversationList({ conversations, currentConversationId, loading, onConversationClick }) {
  if (loading) {
    return (
      <div className="conversations-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conversations-empty">
        <div className="empty-state-icon">💬</div>
        <p>Aucune conversation</p>
        <p>Les conversations apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="conversations-list">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === currentConversationId}
          onClick={() => onConversationClick?.(conv.id)}
        />
      ))}
    </div>
  );
}