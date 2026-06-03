import { useEffect, useState } from "react";
import { getJoinRequests, approveRequest, rejectRequest } from "../../services/projectApi";
import { getMultipleUsers } from "../../services/authService";

export default function JoinRequestsList({ projectId, onRequestChange }) {
  const [requests, setRequests] = useState([]);
  const [applicantNames, setApplicantNames] = useState({});

  useEffect(() => {
    loadRequests();
  }, [projectId]);

  const loadRequests = async () => {
    const res = await getJoinRequests(projectId);
    const data = res.data;
    setRequests(data);
    
    // Charger les noms des demandeurs
    const uniqueIds = [...new Set(data.map(r => r.applicantId))];
    if (uniqueIds.length > 0) {
      const names = await getMultipleUsers(uniqueIds);
      setApplicantNames(names);
    }
  };

  const handleApprove = async (requestId) => {
    await approveRequest(projectId, requestId);
    await loadRequests();
    if (onRequestChange) onRequestChange();
  };

  const handleReject = async (requestId) => {
    await rejectRequest(projectId, requestId);
    await loadRequests();
    if (onRequestChange) onRequestChange();
  };

  const pendingRequests = requests.filter(r => r.status === "PENDING");

  if (pendingRequests.length === 0) {
    return (
      <div className="empty-state-small">
        📭 Aucune demande en attente
      </div>
    );
  }

  return (
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
            >
              ✅ Approuver
            </button>
            <button 
              className="btn-reject"
              onClick={() => handleReject(req.id)}
            >
              ❌ Rejeter
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}