// src/components/messaging/NewConversationModal.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createConversation, getConversations } from "../../services/messagingApi";
import { getAllStudents } from "../../services/authService";
import { getProfileByUserId } from "../../services/profileService";
import { getMyProjects, getProjectMembers } from "../../services/projectApi";

export default function NewConversationModal({ isOpen, onClose, onSuccess }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [conversationType, setConversationType] = useState("DIRECT");
  const [conversationName, setConversationName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfiles, setUserProfiles] = useState({});
  const [existingConversations, setExistingConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [creating, setCreating] = useState(false);
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const navigate = useNavigate();

  const loadExistingConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      setExistingConversations(res.data || []);
    } catch (err) {
      console.error("Erreur chargement conversations existantes:", err);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await getMyProjects();
      const userProjects = res.data || [];
      setProjects(userProjects);
    } catch (err) {
      console.error("Erreur chargement projets:", err);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const allStudents = await getAllStudents();
      const otherStudents = allStudents.filter(s => s.id !== currentUserId);
      setStudents(otherStudents);
      setFilteredStudents(otherStudents);

      const profilePromises = otherStudents.map(student =>
        getProfileByUserId(student.id)
          .then(profile => ({ id: student.id, profile }))
          .catch(() => null)
      );
      const results = await Promise.all(profilePromises);
      const profilesMap = {};
      results.forEach(r => {
        if (r) profilesMap[r.id] = r.profile;
      });
      setUserProfiles(profilesMap);
    } catch (err) {
      console.error("Erreur chargement étudiants:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // ✅ Charger le profil de l'utilisateur courant
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (currentUserId && !userProfiles[currentUserId]) {
        try {
          const profile = await getProfileByUserId(currentUserId);
          if (profile) {
            setUserProfiles(prev => ({ ...prev, [currentUserId]: profile }));
            console.log("✅ Profil utilisateur courant chargé:", profile);
          }
        } catch (err) {
          console.error("Erreur chargement profil utilisateur courant:", err);
        }
      }
    };
    
    if (isOpen) {
      loadCurrentUserProfile();
    }
  }, [isOpen, currentUserId, userProfiles]);

  // Charger les membres du projet sélectionné avec leurs profils
  const loadProjectMembers = useCallback(async (projectId) => {
    if (!projectId) return [];
    setLoadingMembers(true);
    try {
      const res = await getProjectMembers(projectId);
      const members = res.data || [];
      const memberIds = members.map(m => m.userId);
      
      // Charger les profils de TOUS les membres
      const profilePromises = memberIds.map(id =>
        getProfileByUserId(id)
          .then(profile => ({ id, profile }))
          .catch(() => null)
      );
      const results = await Promise.all(profilePromises);
      const profilesMap = {};
      results.forEach(r => {
        if (r) profilesMap[r.id] = r.profile;
      });
      
      setUserProfiles(prev => ({ ...prev, ...profilesMap }));
      
      return memberIds;
    } catch (err) {
      console.error("Erreur chargement membres du projet:", err);
      return [];
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
      loadExistingConversations();
      loadProjects();
    } else {
      setSelectedUsers([]);
      setConversationType("DIRECT");
      setConversationName("");
      setSearchTerm("");
      setSelectedProjectId("");
    }
  }, [isOpen, loadStudents, loadExistingConversations, loadProjects]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredStudents(
        students.filter(student => {
          const profile = userProfiles[student.id];
          const name = profile?.firstName && profile?.lastName
            ? `${profile.firstName} ${profile.lastName}`.toLowerCase()
            : student.email.toLowerCase();
          return name.includes(term) || student.email.toLowerCase().includes(term);
        })
      );
    }
  }, [searchTerm, students, userProfiles]);

  const toggleUser = (userId) => {
    if (conversationType === "DIRECT") {
      setSelectedUsers([userId]);
    } else if (conversationType === "GROUP") {
      setSelectedUsers(prev =>
        prev.includes(userId)
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  // Pour PROJECT_TEAM : sélectionner un projet
  const handleProjectSelect = async (projectId) => {
    setSelectedProjectId(projectId);
    const memberIds = await loadProjectMembers(projectId);
    // Exclure l'utilisateur courant des participants affichés
    setSelectedUsers(memberIds.filter(id => id !== currentUserId));
  };

  const findExistingDirectConversation = (otherUserId) => {
    return existingConversations.find(conv => {
      if (conv.type !== "DIRECT") return false;
      const participants = conv.participantIds || [];
      return (
        participants.includes(currentUserId) &&
        participants.includes(otherUserId) &&
        participants.length === 2
      );
    });
  };

  const findExistingProjectTeamConversation = (projectId) => {
    return existingConversations.find(conv => {
      return conv.type === "PROJECT_TEAM" && conv.projectId === projectId;
    });
  };

  // ✅ Vérifier si une conversation de groupe existe déjà avec les mêmes participants et le même nom
  const findExistingGroupConversation = (selectedUserIds, groupName) => {
    if (!groupName || groupName.trim() === "") return null;
    
    return existingConversations.find(conv => {
      if (conv.type !== "GROUP") return false;
      
      // Vérifier le nom (insensible à la casse)
      if (conv.name?.toLowerCase() !== groupName.trim().toLowerCase()) return false;
      
      // Vérifier que les participants sont exactement les mêmes
      const participants = conv.participantIds || [];
      const allParticipants = [...selectedUserIds, currentUserId];
      
      if (participants.length !== allParticipants.length) return false;
      
      // Trier et comparer les tableaux
      const sortedExisting = [...participants].sort((a, b) => a - b);
      const sortedNew = [...allParticipants].sort((a, b) => a - b);
      
      return JSON.stringify(sortedExisting) === JSON.stringify(sortedNew);
    });
  };

  const handleCreate = async () => {
    if (conversationType === "PROJECT_TEAM") {
      if (!selectedProjectId) {
        alert("Veuillez sélectionner un projet");
        return;
      }
      
      const existing = findExistingProjectTeamConversation(parseInt(selectedProjectId));
      if (existing) {
        onClose();
        navigate(`/conversations/${existing.id}`);
        return;
      }
    } else if (conversationType === "GROUP") {
      if (!conversationName.trim()) {
        alert("Veuillez saisir un nom pour la conversation de groupe");
        return;
      }
      if (selectedUsers.length === 0) {
        alert("Veuillez sélectionner au moins un participant");
        return;
      }
      
      // ✅ Vérifier si une conversation de groupe existe déjà
      const existing = findExistingGroupConversation(selectedUsers, conversationName.trim());
      if (existing) {
        onClose();
        navigate(`/conversations/${existing.id}`);
        return;
      }
    } else if (conversationType === "DIRECT") {
      if (selectedUsers.length === 0) {
        alert("Veuillez sélectionner un participant");
        return;
      }
      
      const existing = findExistingDirectConversation(selectedUsers[0]);
      if (existing) {
        onClose();
        navigate(`/conversations/${existing.id}`);
        return;
      }
    }

    setCreating(true);

    let participantIds = [...selectedUsers];
    if (!participantIds.includes(currentUserId)) {
      participantIds.push(currentUserId);
    }

    const data = {
      type: conversationType,
      participantIds: conversationType !== "PROJECT_TEAM" ? participantIds : null,
    };

    if (conversationType !== "DIRECT") {
      if (conversationType === "PROJECT_TEAM") {
        data.name = projects.find(p => p.id === parseInt(selectedProjectId))?.title || "Équipe projet";
        data.projectId = parseInt(selectedProjectId);
        data.participantIds = null;
      } else {
        data.name = conversationName.trim();
      }
    }

    try {
      const res = await createConversation(data);
      onClose();
      if (onSuccess) onSuccess();
      if (res.data?.id) {
        navigate(`/conversations/${res.data.id}`);
      }
    } catch (err) {
      console.error("Erreur création:", err);
      alert("❌ Erreur lors de la création de la conversation");
    } finally {
      setCreating(false);
    }
  };

  // ✅ Fonction pour obtenir le nom complet d'un utilisateur par son ID
  const getUserDisplayNameById = (userId) => {
    const profile = userProfiles[userId];
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile?.firstName) return profile.firstName;
    const student = students.find(s => s.id === userId);
    if (student?.email) return student.email.split('@')[0];
    return `Utilisateur ${userId}`;
  };

  const getUserDisplayName = (student) => {
    const profile = userProfiles[student.id];
    if (profile?.firstName && profile?.lastName) return `${profile.firstName} ${profile.lastName}`;
    if (profile?.firstName) return profile.firstName;
    return student.email.split("@")[0];
  };

  const getUserAvatar = (student) => {
    const profile = userProfiles[student.id];
    if (profile?.avatarUrl) {
      return <img src={profile.avatarUrl} alt="Avatar" className="user-avatar-small" />;
    }
    const initial = getUserDisplayName(student).charAt(0).toUpperCase();
    return <div className="user-avatar-placeholder-small">{initial}</div>;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nouvelle conversation</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Type */}
          <div className="form-group">
            <label>Type de conversation</label>
            <select
              value={conversationType}
              onChange={e => {
                setConversationType(e.target.value);
                setSelectedUsers([]);
                setSelectedProjectId("");
                setConversationName("");
              }}
            >
              <option value="DIRECT">👤 Directe (1-1)</option>
              <option value="GROUP">👥 Groupe</option>
              <option value="PROJECT_TEAM">📁 Équipe projet</option>
            </select>
          </div>

          {/* Pour PROJECT_TEAM : sélection du projet */}
          {conversationType === "PROJECT_TEAM" && (
            <div className="form-group">
              <label>Sélectionner un projet</label>
              <select
                value={selectedProjectId}
                onChange={e => handleProjectSelect(e.target.value)}
                disabled={loadingProjects}
              >
                <option value="">-- Choisir un projet --</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    📁 {project.title} ({project.memberCount} membres)
                  </option>
                ))}
              </select>
              {loadingProjects && <div className="users-loading">Chargement des projets...</div>}
              {projects.length === 0 && !loadingProjects && (
                <div className="no-users">Vous n'êtes membre d'aucun projet</div>
              )}
            </div>
          )}

          {/* Nom uniquement pour groupe */}
          {conversationType === "GROUP" && (
            <div className="form-group">
              <label>Nom de la conversation</label>
              <input
                type="text"
                placeholder="Ex: Équipe React"
                value={conversationName}
                onChange={e => setConversationName(e.target.value)}
              />
            </div>
          )}

          {/* Participants - seulement pour DIRECT et GROUP */}
          {conversationType !== "PROJECT_TEAM" && (
            <div className="form-group">
              <label>
                {conversationType === "DIRECT"
                  ? "Choisir un participant"
                  : "Sélectionner des participants"}
              </label>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Rechercher par nom ou email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              {loading ? (
                <div className="users-loading">Chargement...</div>
              ) : (
                <div className="users-list">
                  {filteredStudents.length === 0 ? (
                    <div className="no-users">Aucun utilisateur trouvé</div>
                  ) : (
                    filteredStudents.map(student => {
                      const isSelected = selectedUsers.includes(student.id);
                      const hasExisting =
                        conversationType === "DIRECT" &&
                        !!findExistingDirectConversation(student.id);

                      return (
                        <div
                          key={student.id}
                          className={`user-item ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleUser(student.id)}
                        >
                          <div className="user-item-avatar">{getUserAvatar(student)}</div>
                          <div className="user-item-info">
                            <div className="user-item-name">{getUserDisplayName(student)}</div>
                            <div className="user-item-email">
                              {hasExisting ? (
                                <span className="existing-conv-badge">💬 Conversation existante</span>
                              ) : (
                                student.email
                              )}
                            </div>
                          </div>
                          {isSelected && <div className="user-item-check">✓</div>}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tags sélectionnés (seulement pour groupe) */}
          {conversationType === "GROUP" && selectedUsers.length > 0 && (
            <div className="selected-users">
              <label>Sélectionnés ({selectedUsers.length}) :</label>
              <div className="selected-users-tags">
                {selectedUsers.map(userId => {
                  const student = students.find(s => s.id === userId);
                  if (!student) return null;
                  return (
                    <span key={userId} className="selected-tag">
                      {getUserDisplayName(student)}
                      <button onClick={() => toggleUser(userId)}>×</button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ✅ Info pour PROJECT_TEAM - avec noms complets et indication (moi) */}
          {conversationType === "PROJECT_TEAM" && selectedProjectId && (
            <div className="selected-users">
              <label>Participants (membres du projet) :</label>
              <div className="selected-users-tags">
                {loadingMembers ? (
                  <span>Chargement des membres...</span>
                ) : (
                  <>
                    {[currentUserId, ...selectedUsers.filter(id => id !== currentUserId)].map(userId => {
                      const displayName = getUserDisplayNameById(userId);
                      const isCurrentUser = userId === currentUserId;
                      return (
                        <span 
                          key={userId} 
                          className="selected-tag" 
                          style={isCurrentUser ? { background: "#e8f3ff", fontWeight: "bold" } : {}}
                        >
                          {displayName} {isCurrentUser && "(moi)"}
                        </span>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating || (conversationType === "PROJECT_TEAM" ? !selectedProjectId : selectedUsers.length === 0)}
          >
            {creating
              ? "Création..."
              : conversationType === "DIRECT" &&
                selectedUsers.length === 1 &&
                findExistingDirectConversation(selectedUsers[0])
              ? "Ouvrir la conversation"
              : conversationType === "GROUP" && conversationName.trim() && selectedUsers.length > 0
              ? findExistingGroupConversation(selectedUsers, conversationName.trim())
                ? "Ouvrir la conversation"
                : "Créer le groupe"
              : conversationType === "PROJECT_TEAM" && selectedProjectId
              ? findExistingProjectTeamConversation(parseInt(selectedProjectId))
                ? "Ouvrir la conversation"
                : "Créer l'équipe projet"
              : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}