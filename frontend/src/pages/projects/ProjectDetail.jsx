// src/pages/projects/ProjectDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  getProject, 
  sendJoinRequest, 
  getJoinRequests, 
  approveRequest, 
  rejectRequest,
  getMembers,
  removeMember
} from "../../services/projectApi";
import { getUserInfo, getMultipleUsers } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "./Projects.css";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [ownerName, setOwnerName] = useState(null);
  const [memberNames, setMemberNames] = useState({});
  const [applicantNames, setApplicantNames] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const projectRes = await getProject(id);
      setProject(projectRes.data);
      
      // Charger le nom du propriétaire
      if (projectRes.data.ownerId) {
        try {
          const userRes = await getUserInfo(projectRes.data.ownerId);
          const email = userRes.data.email;
          const name = email.split('@')[0];
          setOwnerName(name);
        } catch (err) {
          setOwnerName(`#${projectRes.data.ownerId}`);
        }
      }
      
      // Charger les membres
      const membersRes = await getMembers(id);
      setMembers(membersRes.data);
      
      // Charger les noms des membres
      const memberIds = membersRes.data.map(m => m.userId);
      if (memberIds.length > 0) {
        const names = await getMultipleUsers(memberIds);
        setMemberNames(names);
      }
      
      // Si l'utilisateur est propriétaire, charger les demandes
      if (user?.userId === projectRes.data.ownerId) {
        const requestsRes = await getJoinRequests(id);
        setRequests(requestsRes.data);
        
        // Charger les noms des demandeurs
        const applicantIds = requestsRes.data.map(r => r.applicantId);
        if (applicantIds.length > 0) {
          const names = await getMultipleUsers(applicantIds);
          setApplicantNames(names);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    try {
      await sendJoinRequest(id, message);
      alert("✅ Demande envoyée au propriétaire !");
      setMessage("");
    } catch (err) {
      alert(`❌ ${err.response?.data?.error || "Erreur"}`);
    }
  };

  const handleApprove = async (requestId) => {
    setActionLoading(requestId);
    try {
      await approveRequest(id, requestId);
      alert("✅ Demande approuvée ! L'utilisateur est maintenant membre.");
      await loadAllData();
    } catch (err) {
      alert(`❌ ${err.response?.data?.error || "Erreur"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(requestId);
    try {
      await rejectRequest(id, requestId);
      alert("❌ Demande rejetée");
      await loadAllData();
    } catch (err) {
      alert(`❌ ${err.response?.data?.error || "Erreur"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Retirer ce membre du projet ?")) return;
    setActionLoading(userId);
    try {
      await removeMember(id, userId);
      alert("✅ Membre retiré");
      await loadAllData();
    } catch (err) {
      alert(`❌ ${err.response?.data?.error || "Erreur"}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>Projet non trouvé</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.userId === project.ownerId;
  const isMember = members.some(m => m.userId === user?.userId);
  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const approvedRequests = requests.filter(r => r.status === "APPROVED");

  return (
    <div className="page-container">
      <div className="detail-card">
        {/* En-tête */}
        <div className="detail-header">
          <h1>{project.title}</h1>
          <div className="detail-meta">
            <span>👑 Propriétaire : {ownerName || `#${project.ownerId}`}</span>
            <span>👥 {project.memberCount}/{project.maxMembers} membres</span>
            <span>📅 Créé le {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className={`status-badge ${project.status.toLowerCase()}`}>
            {project.status === "PUBLISHED" ? "📢 Publié" : 
             project.status === "DRAFT" ? "📝 Brouillon" : "📦 Archivé"}
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <button 
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            📄 Détails
          </button>
          <button 
            className={`tab-btn ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            👥 Membres ({members.length})
          </button>
          {isOwner && (
            <button 
              className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              📋 Demandes ({pendingRequests.length})
            </button>
          )}
        </div>

        {/* Tab Détails */}
        {activeTab === "details" && (
          <>
            <div className="detail-section">
              <h2>Description</h2>
              <div className="detail-description">
                {project.description || "Aucune description fournie."}
              </div>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="detail-section">
                <h2>Tags</h2>
                <div className="tags-list">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {!isOwner && !isMember && project.status === "PUBLISHED" && (
              <div className="detail-section">
                <h2>Rejoindre le projet</h2>
                <div className="join-form">
                  <textarea
                    placeholder="Dites au propriétaire pourquoi vous voulez rejoindre ce projet..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                  />
                  <button className="btn-primary" onClick={handleJoinRequest}>
                    Envoyer la demande
                  </button>
                </div>
              </div>
            )}

            {isMember && (
              <div className="detail-section">
                <div className="info-message">
                  ✅ Vous êtes membre de ce projet
                </div>
              </div>
            )}

            {!isOwner && project.status !== "PUBLISHED" && (
              <div className="detail-section">
                <div className="info-message warning">
                  🔒 Ce projet n'accepte pas de demandes pour le moment.
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab Membres */}
        {activeTab === "members" && (
          <div className="detail-section">
            <h2>Membres du projet</h2>
            <div className="members-list">
              {members.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <div className="member-avatar">
                      {(memberNames[member.userId] || `#${member.userId}`).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="member-name">{memberNames[member.userId] || `#${member.userId}`}</div>
                      <div className="member-role">{member.role === "OWNER" ? "👑 Propriétaire" : "👤 Membre"}</div>
                    </div>
                  </div>
                  {isOwner && member.role !== "OWNER" && (
                    <button 
                      className="btn-danger-small"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={actionLoading === member.userId}
                    >
                      {actionLoading === member.userId ? "..." : "Retirer"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Demandes (propriétaire uniquement) */}
        {activeTab === "requests" && isOwner && (
          <div className="detail-section">
            <h2>Demandes en attente</h2>
            
            {pendingRequests.length === 0 ? (
              <div className="empty-state-small">
                📭 Aucune demande en attente
              </div>
            ) : (
              <div className="requests-list">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="request-item">
                    <div className="request-info">
                      <div className="request-user">
                        👤 {applicantNames[req.applicantId] || `#${req.applicantId}`}
                      </div>
                      {req.message && (
                        <div className="request-message">💬 "{req.message}"</div>
                      )}
                      <div className="request-date">
                        Demandé le {new Date(req.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="request-buttons">
                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading === req.id}
                      >
                        {actionLoading === req.id ? "..." : "✅ Approuver"}
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(req.id)}
                        disabled={actionLoading === req.id}
                      >
                        ❌ Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {approvedRequests.length > 0 && (
              <>
                <h3 style={{ marginTop: 24, marginBottom: 16 }}>Demandes traitées</h3>
                <div className="requests-list">
                  {approvedRequests.map((req) => (
                    <div key={req.id} className="request-item resolved">
                      <div className="request-info">
                        <div className="request-user">
                          👤 {applicantNames[req.applicantId] || `#${req.applicantId}`}
                        </div>
                        <div className="request-status-badge approved">
                          {req.status === "APPROVED" ? "✅ Acceptée" : "❌ Refusée"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}