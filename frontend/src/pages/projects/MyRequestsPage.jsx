// src/pages/projects/MyRequestsPage.jsx
import { useEffect, useState } from "react";
import { getMyRequests } from "../../services/projectApi";
import { getMultipleUsers } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "./Projects.css";
export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicantNames, setApplicantNames] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await getMyRequests();
      const data = res.data;
      setRequests(data);
      
      // Charger les noms des propriétaires (applicantId = propriétaire du projet)
      const uniqueUserIds = [...new Set(data.map(r => r.applicantId))];
      if (uniqueUserIds.length > 0) {
        const names = await getMultipleUsers(uniqueUserIds);
        setApplicantNames(names);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "#059669";
      case "REJECTED":
        return "#dc2626";
      default:
        return "#f59e0b";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "APPROVED":
        return "✅ Acceptée";
      case "REJECTED":
        return "❌ Refusée";
      default:
        return "⏳ En attente";
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mes demandes de participation</h1>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📬</div>
          <h3>Aucune demande</h3>
          <p>Vous n'avez pas encore envoyé de demande de participation.</p>
          <button className="btn-primary" onClick={() => navigate("/projects")}>
            Explorer des projets
          </button>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((req) => (
            <div key={req.id} className="request-item">
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <strong style={{ fontSize: 16, color: "#1a1c23" }}>
                    📁 Projet #{req.projectId}
                  </strong>
                  <span 
                    className="status-badge" 
                    style={{ 
                      background: getStatusColor(req.status) + "20", 
                      color: getStatusColor(req.status),
                      border: `1px solid ${getStatusColor(req.status)}40`
                    }}
                  >
                    {getStatusText(req.status)}
                  </span>
                </div>
                <div className="request-meta" style={{ marginBottom: 4 }}>
                  👑 Propriétaire : {applicantNames[req.applicantId] || `#${req.applicantId}`}
                </div>
                {req.message && (
                  <p className="request-message">
                    💬 {req.message}
                  </p>
                )}
                <div className="request-meta">
                  📅 Demandé le {new Date(req.requestedAt).toLocaleDateString()}
                  {req.reviewedAt && ` • Répondu le ${new Date(req.reviewedAt).toLocaleDateString()}`}
                </div>
              </div>
              <button 
                className="btn-secondary"
                onClick={() => navigate(`/projects/${req.projectId}`)}
                style={{ fontSize: 13, padding: "6px 12px" }}
              >
                Voir le projet
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}