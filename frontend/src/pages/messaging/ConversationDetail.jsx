// src/pages/messaging/ConversationDetail.jsx
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getConversation,
  getMessages,
  sendMessage as apiSendMessage,
  getConversations,
  markConversationAsRead,
} from "../../services/messagingApi";
import { getMultipleProfiles, getProfileByUserId } from "../../services/profileService";
import { getUserInfo } from "../../services/userApi";
import { useWebSocketContext } from "../../context/WebSocketContext";
import { useAuth } from "../../context/AuthContext";
import { useUserStatus } from "../../hooks/useUserStatus";
import ConversationList from "../../components/messaging/ConversationList";
import MessageList from "../../components/messaging/MessageList";
import MessageInput from "../../components/messaging/MessageInput";
import NewConversationModal from "../../components/messaging/NewConversationModal";
import GroupMembersModal from "../../components/messaging/GroupMembersModal";
import "../../components/messaging/Messaging.css";

export default function ConversationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversation, setConversation]   = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]           = useState([]);
  const [profiles, setProfiles]           = useState({});
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const [otherUser, setOtherUser]         = useState(null);
  const [otherUserEmail, setOtherUserEmail] = useState(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);

  const currentUserId = user?.userId ? parseInt(user.userId) : parseInt(localStorage.getItem("userId"));

  const loadAllCalledRef = useRef(false);
  const hasMarkedReadRef = useRef(false);
  const unsubscribeRef = useRef(null);

  // WebSocket global
  const { isConnected, subscribeToConversation, subscribeToUserStatus } = useWebSocketContext();

  // ✅ Calculer l'ID de l'autre utilisateur de manière fiable
  const otherUserId = useMemo(() => {
    if (!conversation) return null;
    if (conversation.type !== "DIRECT") return null;
    const participants = conversation.participantIds || [];
    const otherId = participants.find(pid => pid !== currentUserId);
    return otherId;
  }, [conversation, currentUserId]);

  // ✅ Statut en ligne de l'autre utilisateur
  const { isOnline: isOtherUserOnline, loading: statusLoading } = useUserStatus(otherUserId);

  // ✅ Charger l'email de l'autre utilisateur si nécessaire
  useEffect(() => {
    const loadUserEmail = async () => {
      if (otherUserId && !otherUserEmail && (!otherUser || !otherUser.email)) {
        try {
          const authUser = await getUserInfo(otherUserId);
          if (authUser?.data?.email) {
            setOtherUserEmail(authUser.data.email);
          }
        } catch (err) {
          console.error("Erreur chargement email utilisateur:", err);
        }
      }
    };
    loadUserEmail();
  }, [otherUserId, otherUserEmail, otherUser]);

  // ✅ Charger les détails du projet pour PROJECT_TEAM
  useEffect(() => {
    const loadProjectDetails = async () => {
      if (conversation?.type === "PROJECT_TEAM" && conversation?.projectId) {
        try {
          const { getProject } = await import("../../services/projectApi");
          const res = await getProject(conversation.projectId);
          setProjectDetails(res.data);
        } catch (err) {
          console.error("Erreur chargement projet:", err);
        }
      }
    };
    loadProjectDetails();
  }, [conversation]);

  // ✅ Charger les membres du groupe pour GROUP
  useEffect(() => {
    const loadGroupMembers = async () => {
      if (conversation?.type === "GROUP" && conversation?.participantIds) {
        const memberIds = conversation.participantIds || [];
        const profilesMap = await getMultipleProfiles(memberIds);
        
        // Charger les emails pour les membres sans profil
        const membersWithInfo = await Promise.all(memberIds.map(async (id) => {
          let profile = profilesMap[id];
          let email = profile?.email;
          
          if (!email && id !== currentUserId) {
            try {
              const authUser = await getUserInfo(id);
              email = authUser?.data?.email;
            } catch (err) {
              console.error(`Erreur chargement email pour user ${id}:`, err);
            }
          }
          
          const getDisplayName = () => {
            if (profile?.firstName && profile?.lastName) return `${profile.firstName} ${profile.lastName}`;
            if (profile?.firstName) return profile.firstName;
            if (email) return email.split('@')[0];
            return `Utilisateur ${id}`;
          };
          
          const getAvatarInitial = () => {
            if (profile?.firstName) return profile.firstName[0];
            if (profile?.lastName) return profile.lastName[0];
            if (email) return email[0].toUpperCase();
            return "?";
          };
          
          return {
            id,
            profile,
            email,
            displayName: getDisplayName(),
            avatarInitial: getAvatarInitial(),
            avatarUrl: profile?.avatarUrl || null,
            isCurrentUser: id === currentUserId
          };
        }));
        
        setGroupMembers(membersWithInfo);
      }
    };
    loadGroupMembers();
  }, [conversation, currentUserId]);

  // ✅ Navigation au clic sur l'avatar ou le header
  const handleHeaderClick = () => {
    if (conversation?.type === "DIRECT") {
      const targetId = otherUser?.authUserId || otherUserId;
      if (targetId) {
        navigate(`/profile/${targetId}`);
      }
    } else if (conversation?.type === "PROJECT_TEAM" && projectDetails?.id) {
      navigate(`/projects/${projectDetails.id}`);
    } else if (conversation?.type === "GROUP") {
      setShowGroupMembersModal(true);
    }
  };

  // ✅ Vérifier si le header est cliquable
  const isHeaderClickable = () => {
    return conversation?.type === "DIRECT" || 
           conversation?.type === "PROJECT_TEAM" || 
           conversation?.type === "GROUP";
  };

  // ✅ Texte du sous-titre
  const getHeaderSubtitle = () => {
    if (conversation?.type === "DIRECT") {
      return statusLoading ? "Chargement..." : (isOtherUserOnline ? "🟢 En ligne" : "⚫ Hors ligne");
    }
    if (conversation?.type === "PROJECT_TEAM" && projectDetails) {
      return `📁 ${projectDetails.memberCount || 0} membres • ${projectDetails.status || "Actif"}`;
    }
    if (conversation?.type === "GROUP") {
      return `👥 ${groupMembers.length} membres`;
    }
    return null;
  };

  // ✅ Obtenir la partie locale de l'email (avant @)
  const getEmailLocalPart = (email) => {
    if (email) {
      return email.split('@')[0];
    }
    return null;
  };

  // ✅ Nom affiché dans le header
  const getUserDisplayName = (userData) => {
    if (!userData) return null;
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.firstName) return userData.firstName;
    const email = userData.email || otherUserEmail;
    if (email) {
      return getEmailLocalPart(email);
    }
    return null;
  };

  const getHeaderDisplayName = () => {
    if (conversation?.name) return conversation.name;
    if (conversation?.type === "DIRECT") {
      const name = getUserDisplayName(otherUser);
      if (name) return name;
      return `Utilisateur ${otherUser?.authUserId || "?"}`;
    }
    if (conversation?.type === "GROUP") return "👥 Groupe";
    if (conversation?.type === "PROJECT_TEAM") return `📁 ${projectDetails?.title || "Équipe projet"}`;
    return "Conversation";
  };

  const getHeaderAvatar = () => {
    if (conversation?.type === "DIRECT" && otherUser?.avatarUrl) {
      return <img src={otherUser.avatarUrl} alt="Avatar" className="header-avatar-img" />;
    }
    if (conversation?.type === "DIRECT" && otherUser) {
      let initial = "?";
      const email = otherUser.email || otherUserEmail;
      if (otherUser.firstName) initial = otherUser.firstName[0];
      else if (otherUser.lastName) initial = otherUser.lastName[0];
      else if (email) initial = email[0].toUpperCase();
      return <div className="header-avatar-placeholder">{initial.toUpperCase()}</div>;
    }
    if (conversation?.type === "PROJECT_TEAM") {
      return <div className="header-avatar-group">🚀</div>;
    }
    if (conversation?.type === "GROUP") {
      return <div className="header-avatar-group">👥</div>;
    }
    return <div className="header-avatar-group">👤</div>;
  };

  // ─────────────────────────────────────────────────────────────────
  // WEBSOCKET CALLBACKS
  // ─────────────────────────────────────────────────────────────────

  const profilesRef = useRef(profiles);
  useEffect(() => { profilesRef.current = profiles; }, [profiles]);

  const onMessageReceived = useCallback((newMessage) => {
    if (newMessage.senderId === currentUserId) return;

    console.log("📩 Nouveau message reçu:", newMessage);

    setMessages(prev => {
      if (prev.some(m => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });

    if (newMessage.senderId && !profilesRef.current[newMessage.senderId]) {
      getProfileByUserId(newMessage.senderId)
        .then(profile => setProfiles(prev => ({ ...prev, [newMessage.senderId]: profile })))
        .catch(() => {});
    }
  }, [currentUserId]);

  const onStatusUpdate = useCallback((statusUpdate) => {
    console.log("📊 Status update reçu:", statusUpdate);
    setMessages(prev =>
      prev.map(msg =>
        msg.id === statusUpdate.messageId
          ? { ...msg, status: statusUpdate.status }
          : msg
      )
    );
  }, []);

  // S'abonner à la conversation
  useEffect(() => {
    if (isConnected && id) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      unsubscribeRef.current = subscribeToConversation(id, onMessageReceived, onStatusUpdate);
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isConnected, id, subscribeToConversation, onMessageReceived, onStatusUpdate]);

  // ─────────────────────────────────────────────────────────────────
  // CHARGEMENT INITIAL
  // ─────────────────────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    if (!id || loadAllCalledRef.current) return;
    loadAllCalledRef.current = true;
    
    setLoading(true);
    try {
      const [convRes, convsRes, msgRes] = await Promise.all([
        getConversation(id),
        getConversations(),
        getMessages(id),
      ]);

      const conv = convRes.data;
      setConversation(conv);
      setConversations(convsRes.data);
      setMessages(msgRes.data);

      const participantIds = conv.participantIds || [];
      const senderIds = [...new Set(msgRes.data.map(m => m.senderId))];
      const allIds = [...new Set([...participantIds, ...senderIds])];
      const profilesMap = await getMultipleProfiles(allIds);
      setProfiles(profilesMap);

      if (conv.type === "DIRECT") {
        const otherId = participantIds.find(pid => pid !== currentUserId);
        if (otherId && profilesMap[otherId]) {
          setOtherUser(profilesMap[otherId]);
        } else if (otherId) {
          setOtherUser({
            authUserId: otherId,
            id: otherId,
            firstName: null,
            lastName: null,
            email: null
          });
        }
      }
    } catch (err) {
      console.error("Erreur chargement conversation:", err);
      navigate("/conversations");
    } finally {
      setLoading(false);
    }
  }, [id, currentUserId, navigate]);

  useEffect(() => {
    loadAllCalledRef.current = false;
    loadAll();
  }, [loadAll]);

  // READ
  useEffect(() => {
    if (!loading && messages.length > 0 && !hasMarkedReadRef.current && conversation) {
      const timer = setTimeout(() => {
        markConversationAsRead(id)
          .then(() => {
            console.log("✅ Messages marqués READ");
            hasMarkedReadRef.current = true;
          })
          .catch(err => console.error("❌ markConversationAsRead:", err));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, messages.length, id, conversation]);

  // Reset refs
  useEffect(() => {
    loadAllCalledRef.current = false;
    hasMarkedReadRef.current = false;
    setOtherUser(null);
    setOtherUserEmail(null);
    setProjectDetails(null);
    setGroupMembers([]);
  }, [id]);

  // ─────────────────────────────────────────────────────────────────
  // ENVOI D'UN MESSAGE
  // ─────────────────────────────────────────────────────────────────

 // handleSendMessage  gére aussi les pièces jointes
  const handleSendMessage = async (content, attachmentUrls = []) => {
    if ((!content.trim() && attachmentUrls.length === 0) || sending) return;
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      conversationId: parseInt(id),
      senderId: currentUserId,
      content,
      status: "SENT",
      sentAt: new Date().toISOString(),
      isTemp: true,
      attachmentUrls: attachmentUrls  // ✅ URLs des fichiers uploadés
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await apiSendMessage({
        conversationId: parseInt(id),
        content,
        attachmentUrls: attachmentUrls
      });
      setMessages(prev => prev.map(msg => (msg.id === tempId ? response.data : msg)));
    } catch (err) {
      console.error("Erreur envoi message:", err);
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, isTemp: false, error: true } : msg));
    } finally {
      setSending(false);
    }
  };
  const refreshConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="messaging-container">
        <div className="messaging-sidebar">
          <div className="messaging-header">
            <h2>Messages</h2>
            <button className="new-conversation-btn" onClick={() => setShowNewConversationModal(true)}>+ Nouvelle</button>
          </div>
          <div className="conversations-loading"><div className="spinner" /></div>
        </div>
        <div className="messaging-main"><div className="loading-spinner"><div className="spinner" /></div></div>
        <NewConversationModal isOpen={showNewConversationModal} onClose={() => setShowNewConversationModal(false)} onSuccess={refreshConversations} />
      </div>
    );
  }

  return (
    <div className="messaging-container">
      <div className="messaging-sidebar">
        <div className="messaging-header">
          <h2>Messages</h2>
          <button className="new-conversation-btn" onClick={() => setShowNewConversationModal(true)}>+ Nouvelle</button>
        </div>
        <ConversationList conversations={conversations} currentConversationId={parseInt(id)} loading={false} onConversationClick={convId => navigate(`/conversations/${convId}`)} />
      </div>

      <div className="messaging-main">
        <div className={`conversation-header-whatsapp ${isHeaderClickable() ? "clickable" : ""}`} onClick={isHeaderClickable() ? handleHeaderClick : undefined} style={isHeaderClickable() ? { cursor: "pointer" } : {}}>
          <div className="header-back" onClick={(e) => { e.stopPropagation(); navigate("/conversations"); }}>←</div>
          <div className="header-avatar">{getHeaderAvatar()}</div>
          <div className="header-info">
            <h3>{getHeaderDisplayName()}</h3>
            <div className="header-subtitle">{getHeaderSubtitle()}</div>
          </div>
        </div>

        <MessageList messages={messages} currentUserId={currentUserId} profiles={profiles} />
        <MessageInput onSend={handleSendMessage} disabled={sending} />
      </div>

      <NewConversationModal isOpen={showNewConversationModal} onClose={() => setShowNewConversationModal(false)} onSuccess={refreshConversations} />
      
      {/* Modal des membres du groupe */}
      <GroupMembersModal
        isOpen={showGroupMembersModal}
        onClose={() => setShowGroupMembersModal(false)}
        groupName={getHeaderDisplayName()}
        members={groupMembers}
        currentUserId={currentUserId}
      />
    </div>
  );
}