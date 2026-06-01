import { useState } from "react";
import { sendJoinRequest } from "../../services/projectApi";

export default function JoinRequestModal({ isOpen, onClose, projectId, projectTitle, onSuccess }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await sendJoinRequest(projectId, message);
      alert("✅ Demande envoyée au propriétaire !");
      setMessage("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erreur lors de la demande";
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rejoindre : {projectTitle}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Message pour le propriétaire</label>
            <textarea
              placeholder="Dites au propriétaire pourquoi vous voulez rejoindre ce projet..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="5"
              disabled={loading}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer la demande"}
          </button>
        </div>
      </div>
    </div>
  );
}