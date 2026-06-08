// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProfile, getProfileByUserId, deleteSkill, deleteExperience, deleteEducation } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import { getConversations, createConversation } from "../services/messagingApi";
import MentorProfileModal from "../components/MentorProfileModal";
import "./ProfileStyles.css";

function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [sending, setSending] = useState(false);
  const [showMentorProfileModal, setShowMentorProfileModal] = useState(false);

  // ✅ Déterminer si on affiche son propre profil ou celui d'un autre
  const isOwnProfile = !userId || parseInt(userId) === user?.userId;
  const targetUserId = isOwnProfile ? user?.userId : parseInt(userId);
  const currentUserId = user?.userId;
  const isMentor = user?.role === "MENTOR";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [targetUserId, navigate]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (isOwnProfile) {
        data = await getProfile();
      } else {
        data = await getProfileByUserId(targetUserId);
      }
      setProfile(data);
    } catch (err) {
      console.error("Error loading profile:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("Profil non trouvé");
        setProfile(null);
      } else {
        setError("Impossible de charger le profil");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fonction pour trouver ou créer une conversation
  const findOrCreateConversation = async (targetUserId) => {
    try {
      const conversationsRes = await getConversations();
      const conversations = conversationsRes.data || [];
      const existingConversation = conversations.find(conv => {
        if (conv.type !== "DIRECT") return false;
        const participants = conv.participantIds || [];
        return participants.includes(currentUserId) && participants.includes(targetUserId);
      });
      if (existingConversation) {
        return existingConversation.id;
      }
      const newConvRes = await createConversation({
        type: "DIRECT",
        participantIds: [currentUserId, targetUserId]
      });
      return newConvRes.data.id;
    } catch (err) {
      console.error("Erreur lors de la recherche/création de conversation:", err);
      return null;
    }
  };

  const handleMessageClick = async () => {
    if (sending) return;
    setSending(true);
    const targetId = profile.authUserId;
    const conversationId = await findOrCreateConversation(targetId);
    if (conversationId) {
      navigate(`/conversations/${conversationId}`);
    } else {
      alert("Impossible d'ouvrir la conversation");
    }
    setSending(false);
  };

  const handleEditProfile = () => {
    if (isMentor) {
      setShowMentorProfileModal(true);
    } else {
      navigate("/profile/edit");
    }
  };

  // ✅ Actions de suppression (uniquement pour son propre profil)
  const handleDeleteSkill = async (skillId) => {
    if (!isOwnProfile) return;
    if (window.confirm("Supprimer cette compétence ?")) {
      try {
        await deleteSkill(skillId);
        await loadProfile();
      } catch (error) {
        console.error("Error deleting skill:", error);
      }
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    if (!isOwnProfile) return;
    if (window.confirm("Supprimer cette expérience ?")) {
      try {
        await deleteExperience(experienceId);
        await loadProfile();
      } catch (error) {
        console.error("Error deleting experience:", error);
      }
    }
  };

  const handleDeleteEducation = async (educationId) => {
    if (!isOwnProfile) return;
    if (window.confirm("Supprimer cette formation ?")) {
      try {
        await deleteEducation(educationId);
        await loadProfile();
      } catch (error) {
        console.error("Error deleting education:", error);
      }
    }
  };

  if (loading) {
    return <div className="profile-loading">Chargement...</div>;
  }

  if (error || !profile) {
    return (
      <div className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-section" style={{ textAlign: "center" }}>
            <p>{error || "Profil non trouvé"}</p>
            <button className="edit-button" onClick={() => navigate("/conversations")} style={{ marginTop: "20px" }}>
              Retour aux messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profile-page">
        <div className="profile-wrapper">
          {/* Carte de profil principale */}
          <div className="profile-card">
            <div className="profile-banner"></div>
            <div className="profile-avatar-container">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {profile.firstName} {profile.lastName}
              </h1>
              {isOwnProfile ? (
                <button className="edit-button" onClick={handleEditProfile}>
                  Modifier le profil
                </button>
              ) : (
                <button className="message-button" onClick={handleMessageClick} disabled={sending}>
                  <span>💬</span> {sending ? "Chargement..." : "Envoyer un message"}
                </button>
              )}
            </div>
          </div>

          {/* Onglets (inchangés) */}
          <div className="profile-tabs">
            <button className={`tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>À propos</button>
            <button className={`tab ${activeTab === "skills" ? "active" : ""}`} onClick={() => setActiveTab("skills")}>Compétences</button>
            <button className={`tab ${activeTab === "experience" ? "active" : ""}`} onClick={() => setActiveTab("experience")}>Expériences</button>
            <button className={`tab ${activeTab === "education" ? "active" : ""}`} onClick={() => setActiveTab("education")}>Formations</button>
          </div>

          {/* Contenu des onglets (inchangé) */}
          {activeTab === "about" && (
            <div className="profile-card">
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">À propos</h2>
                  {isOwnProfile && <button className="add-button" onClick={handleEditProfile}>Modifier</button>}
                </div>
                <div className="about-section"><h3>Bio</h3><p>{profile.bio || "Aucune bio renseignée"}</p></div>
                <div className="about-section">
                  <h3>Liens</h3>
                  <div className="links-list">
                    {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="about-link">🔗 LinkedIn</a>}
                    {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="about-link">💻 GitHub</a>}
                    {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="about-link">🌐 Site web</a>}
                    {!profile.linkedinUrl && !profile.githubUrl && !profile.websiteUrl && <p>Aucun lien renseigné</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="profile-card">
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">Compétences</h2>
                  {isOwnProfile && <button className="add-button" onClick={() => navigate("/profile/skills")}>+ Gérer</button>}
                </div>
                <div className="skills-list">
                  {profile.skills?.length === 0 ? <p>Aucune compétence ajoutée</p> : profile.skills?.map((skill) => (
                    <div key={skill.id} className="skill-item">
                      <div className="skill-info"><span className="skill-name">{skill.name}</span><span className="skill-level">{skill.level}</span></div>
                      {isOwnProfile && <button className="delete-skill" onClick={() => handleDeleteSkill(skill.id)}>✕</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="profile-card">
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">Expériences professionnelles</h2>
                  {isOwnProfile && <button className="add-button" onClick={() => navigate("/profile/experience")}>+ Ajouter</button>}
                </div>
                {profile.experiences?.length === 0 ? <p>Aucune expérience ajoutée</p> : profile.experiences?.map((exp) => (
                  <div key={exp.id} className="experience-item">
                    <div className="experience-header">
                      <div><h3 className="experience-title">{exp.title}</h3><div className="experience-company">{exp.company}</div><div className="experience-date">{exp.startDate} - {exp.current ? "Présent" : exp.endDate}</div></div>
                      {isOwnProfile && <button className="delete-item" onClick={() => handleDeleteExperience(exp.id)}>Supprimer</button>}
                    </div>
                    <p className="experience-description">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "education" && (
            <div className="profile-card">
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">Formations</h2>
                  {isOwnProfile && <button className="add-button" onClick={() => navigate("/profile/education")}>+ Ajouter</button>}
                </div>
                {profile.educations?.length === 0 ? <p>Aucune formation ajoutée</p> : profile.educations?.map((edu) => (
                  <div key={edu.id} className="education-item">
                    <div className="education-header">
                      <div><h3 className="education-degree">{edu.degree}</h3><div className="education-institution">{edu.institution}</div><div className="education-date">{edu.startDate} - {edu.endDate || "Présent"}</div>{edu.fieldOfStudy && <div className="education-field">Domaine: {edu.fieldOfStudy}</div>}</div>
                      {isOwnProfile && <button className="delete-item" onClick={() => handleDeleteEducation(edu.id)}>Supprimer</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de modification de profil pour mentor */}
      {showMentorProfileModal && (
        <MentorProfileModal
          isOpen={showMentorProfileModal}
          onClose={() => setShowMentorProfileModal(false)}
          onProfileUpdated={() => {
            loadProfile(); // Recharge le profil après modification
          }}
        />
      )}
    </>
  );
}

export default ProfilePage;