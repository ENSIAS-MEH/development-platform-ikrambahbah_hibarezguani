// src/components/messaging/ConversationItem.jsx
import { useEffect, useState } from "react";
import { getProfileByUserId } from "../../services/profileService";
import { getUserInfo } from "../../services/authService";
import "./Messaging.css";

export default function ConversationItem({ conversation, isActive, onClick }) {
  const [otherUser, setOtherUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    const otherId = conversation.participantIds?.find(id => id !== currentUserId);
    
    if (otherId && conversation.type === "DIRECT") {
      // Charger d'abord le profil
      getProfileByUserId(otherId)
        .then(profile => {
          setOtherUser(profile);
          // Si le profil a un email, l'utiliser
          if (profile?.email) {
            setUserEmail(profile.email);
          }
        })
        .catch(async (err) => {
          console.error("Erreur chargement profil:", err);
          // Si le profil n'existe pas, récupérer l'utilisateur auth
          try {
            const authUser = await getUserInfo(otherId);
            if (authUser?.data?.email) {
              setUserEmail(authUser.data.email);
            }
          } catch (authErr) {
            console.error("Erreur chargement auth user:", authErr);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [conversation, currentUserId]);

  // ✅ Obtenir le nom d'affichage à partir de l'email
  const getDisplayNameFromEmail = (email) => {
    if (email) {
      return email.split('@')[0];
    }
    return null;
  };

  const getDisplayName = () => {
    if (conversation.name) return conversation.name;
    if (conversation.type === "DIRECT") {
      // Priorité au nom du profil
      if (otherUser?.firstName && otherUser?.lastName) {
        return `${otherUser.firstName} ${otherUser.lastName}`;
      }
      if (otherUser?.firstName) return otherUser.firstName;
      // Ensuite, utiliser l'email
      const emailName = getDisplayNameFromEmail(userEmail || otherUser?.email);
      if (emailName) return emailName;
      // Dernier recours
      return `Utilisateur ${otherUser?.authUserId || "?"}`;
    }
    if (conversation.type === "GROUP") return "👥 Groupe";
    if (conversation.type === "PROJECT_TEAM") return "📁 Équipe projet";
    return "Conversation";
  };
const getAvatar = () => {
  // DIRECT avec photo de profil
  if (conversation.type === "DIRECT" && otherUser?.avatarUrl) {
    return <img src={otherUser.avatarUrl} alt="Avatar" className="conversation-avatar-img" />;
  }
  // DIRECT avec initiale (fond bleu)
  if (conversation.type === "DIRECT" && otherUser) {
    let initial = "?";
    if (otherUser.firstName) initial = otherUser.firstName[0];
    else if (otherUser.lastName) initial = otherUser.lastName[0];
    else if (userEmail) initial = userEmail[0].toUpperCase();
    else if (otherUser?.email) initial = otherUser.email[0].toUpperCase();
    return (
      <div className="conversation-avatar-placeholder">
        {initial.toUpperCase()}
      </div>
    );
  }
  // PROJECT_TEAM - icône fusée (fond bleu)
  if (conversation.type === "PROJECT_TEAM") {
    return <div className="conversation-avatar-default">🚀</div>;
  }
  // GROUP - icône groupe (fond bleu)
  if (conversation.type === "GROUP") {
    return <div className="conversation-avatar-default">👥</div>;
  }
  // DIRECT sans profil - icône utilisateur (fond bleu)
  return <div className="conversation-avatar-default">👤</div>;
};

  if (loading && conversation.type === "DIRECT") {
    return (
      <div className={`conversation-item ${isActive ? "active" : ""}`}>
        <div className="conversation-avatar-skeleton"></div>
        <div className="conversation-info">
          <div className="skeleton-text"></div>
          <div className="skeleton-text-small"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`conversation-item ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="conversation-avatar">{getAvatar()}</div>
      <div className="conversation-info">
        <div className="conversation-name">{getDisplayName()}</div>
        <div className="conversation-last-message">
          {conversation.lastMessageAt
            ? `Dernier message: ${new Date(conversation.lastMessageAt).toLocaleDateString()}`
            : "Aucun message"}
        </div>
      </div>
    </div>
  );
}