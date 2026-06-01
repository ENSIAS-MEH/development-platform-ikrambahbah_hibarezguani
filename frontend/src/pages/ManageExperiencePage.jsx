// src/pages/ManageExperiencePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, addExperience, updateExperience, deleteExperience } from "../services/profileService";
import "./ProfileStyles.css";

function ManageExperiencePage() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    startDate: "",
    endDate: "",
    current: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setExperiences(profile.experiences || []);
    } catch (error) {
      console.error("Error loading experiences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (experience = null) => {
    if (experience) {
      setEditingId(experience.id);
      setFormData({
        title: experience.title || "",
        company: experience.company || "",
        description: experience.description || "",
        startDate: experience.startDate || "",
        endDate: experience.endDate || "",
        current: experience.current || false,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        company: "",
        description: "",
        startDate: "",
        endDate: "",
        current: false,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.startDate) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const formattedStartDate = formData.startDate + "-01";
      let formattedEndDate = null;
      
      if (!formData.current && formData.endDate) {
        formattedEndDate = formData.endDate + "-01";
      }
      
      const dataToSend = {
        title: formData.title,
        company: formData.company,
        description: formData.description || "",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        current: formData.current
      };
      
      if (editingId) {
        await updateExperience(editingId, dataToSend);
      } else {
        await addExperience(dataToSend);
      }
      
      await loadProfile();
      setShowModal(false);
      alert(editingId ? "Expérience modifiée avec succès !" : "Expérience ajoutée avec succès !");
    } catch (error) {
      console.error("Error saving experience:", error);
      alert("Erreur: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette expérience ?")) {
      try {
        await deleteExperience(id);
        await loadProfile();
        alert("Expérience supprimée avec succès !");
      } catch (error) {
        console.error("Error deleting experience:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">Chargement...</div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">Expériences professionnelles</h2>
            <button className="add-button" onClick={() => handleOpenModal()}>
              + Ajouter
            </button>
          </div>

          {experiences.length === 0 ? (
            <p>Aucune expérience ajoutée</p>
          ) : (
            experiences.map((exp) => (
              <div key={exp.id} className="experience-item">
                <div className="experience-header">
                  <div>
                    <h3 className="experience-title">{exp.title}</h3>
                    <div className="experience-company">{exp.company}</div>
                    <div className="experience-date">
                      {exp.startDate ? exp.startDate.substring(0, 7) : ""} - {exp.current ? "Présent" : (exp.endDate ? exp.endDate.substring(0, 7) : "")}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="edit-item" onClick={() => handleOpenModal(exp)}>
                      ✏️ Modifier
                    </button>
                    <button className="delete-item" onClick={() => handleDelete(exp.id)}>
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
                <p className="experience-description">{exp.description}</p>
              </div>
            ))
          )}

          <div style={{ marginTop: "20px" }}>
            <button className="cancel-btn" onClick={() => navigate("/profile")}>
              Retour
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Modifier l'expérience" : "Ajouter une expérience"}</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Titre du poste *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Ex: Développeur Full Stack"
                  />
                </div>

                <div className="form-group">
                  <label>Entreprise *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    placeholder="Ex: Google, Microsoft..."
                  />
                </div>

                <div className="form-group">
                  <label>Date de début *</label>
                  <input
                    type="month"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.current}
                      onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                    />
                    Poste actuel
                  </label>
                </div>

                {!formData.current && (
                  <div className="form-group">
                    <label>Date de fin</label>
                    <input
                      type="month"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    placeholder="Décrivez vos missions et responsabilités..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageExperiencePage;