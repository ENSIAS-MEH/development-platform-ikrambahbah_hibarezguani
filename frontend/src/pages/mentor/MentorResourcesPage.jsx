// src/pages/mentor/MentorResourcesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  getTrainingById, 
  getTrainingResources, 
  addResource, 
  deleteResource 
} from "../../services/trainingApi";

function MentorResourcesPage() {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", url: "", type: "VIDEO" });

  useEffect(() => {
    if (!trainingId) {
      console.error("trainingId est undefined");
      navigate("/mentor/trainings");
      return;
    }
    
    fetchTraining();
    fetchResources();
  }, [trainingId]);

  const fetchTraining = async () => {
    try {
      console.log("Fetching training with ID:", trainingId);
      const res = await getTrainingById(trainingId);
      setTraining(res.data);
    } catch (err) {
      console.error("Error fetching training:", err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        setTraining(null);
      }
    }
  };

  const fetchResources = async () => {
    try {
      console.log("Fetching resources for training ID:", trainingId);
      const res = await getTrainingResources(trainingId);
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addResource(trainingId, formData);
      alert("✅ Ressource ajoutée");
      await fetchResources();
      setShowModal(false);
      setFormData({ title: "", url: "", type: "VIDEO" });
    } catch (err) {
      console.error("Error adding resource:", err);
      alert("Erreur lors de l'ajout: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm("Supprimer cette ressource ?")) return;
    try {
      await deleteResource(resourceId);
      alert("🗑️ Ressource supprimée");
      await fetchResources();
    } catch (err) {
      console.error("Error deleting resource:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const getTypeIcon = (type) => {
    const icons = { VIDEO: "🎥", PDF: "📄", LINK: "🔗", EXERCISE: "💻" };
    return icons[type] || "📁";
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Chargement...</div>;
  if (!training) return <div style={{ textAlign: "center", padding: "50px" }}>Formation non trouvée</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
        <button 
          onClick={() => navigate("/mentor/trainings")} 
          style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#667eea" }}
        >
          ← Retour
        </button>
        <h1>{training?.title}</h1>
      </div>

      <div style={{ background: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>📁 Ressources pédagogiques</h2>
          <button 
            onClick={() => setShowModal(true)} 
            style={{ padding: "8px 20px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "30px", cursor: "pointer", margin: "20px" }}
          >
            + Ajouter
          </button>
        </div>

        {resources.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            Aucune ressource pour le moment.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {resources.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "15px", padding: "15px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                <div style={{ width: "32px", height: "32px", background: "#667eea", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: "28px" }}>{getTypeIcon(r.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{r.title}</div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: "#667eea", fontSize: "12px", textDecoration: "none" }}>
                      Voir la ressource →
                    </a>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(r.id)} 
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#dc2626", padding: "5px 10px" }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout de ressource (identique à votre code actuel) */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: "20px", width: "90%", maxWidth: "450px" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
              <h3>Ajouter une ressource</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: "20px" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Titre *</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }} 
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>URL / Lien</label>
                  <input 
                    type="url" 
                    value={formData.url} 
                    onChange={e => setFormData({...formData, url: e.target.value})} 
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }} 
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})} 
                    style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}
                  >
                    <option value="VIDEO">🎥 Vidéo</option>
                    <option value="PDF">📄 PDF</option>
                    <option value="LINK">🔗 Lien</option>
                    <option value="EXERCISE">💻 Exercice</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: "15px 20px", borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 20px", background: "white", border: "1px solid #ddd", borderRadius: "30px", cursor: "pointer" }}>Annuler</button>
                <button type="submit" style={{ padding: "8px 20px", background: "linear-gradient(135deg,#667eea,#764ba2)", color: "white", border: "none", borderRadius: "30px", cursor: "pointer" }}>Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorResourcesPage;