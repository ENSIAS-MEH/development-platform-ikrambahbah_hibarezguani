// src/pages/ManageEducationPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, addEducation, deleteEducation } from "../services/profileService";
import "./ProfileStyles.css";

function ManageEducationPage() {
  const navigate = useNavigate();
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setEducations(profile.educations || []);
    } catch (error) {
      console.error("Error loading educations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.institution || !formData.degree || !formData.startDate) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const formattedStartDate = formData.startDate + "-01";
      let formattedEndDate = null;
      
      if (formData.endDate) {
        formattedEndDate = formData.endDate + "-01";
      }
      
      const dataToSend = {
        institution: formData.institution,
        degree: formData.degree,
        fieldOfStudy: formData.fieldOfStudy || "",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };
      
      await addEducation(dataToSend);
      await loadProfile();
      setShowModal(false);
      setFormData({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
      });
      alert("Formation ajoutée avec succès !");
    } catch (error) {
      console.error("Error saving education:", error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette formation ?")) {
      try {
        await deleteEducation(id);
        await loadProfile();
        alert("Formation supprimée avec succès !");
      } catch (error) {
        console.error("Error deleting education:", error);
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
            <h2 className="section-title">Formations</h2>
            <button className="add-button" onClick={() => setShowModal(true)}>
              + Ajouter
            </button>
          </div>

          {educations.length === 0 ? (
            <p>Aucune formation ajoutée</p>
          ) : (
            educations.map((edu) => (
              <div key={edu.id} className="education-item">
                <div className="education-header">
                  <div>
                    <h3 className="education-degree">{edu.degree}</h3>
                    <div className="education-institution">{edu.institution}</div>
                    <div className="education-date">
                      {edu.startDate ? edu.startDate.substring(0, 7) : ""} - {edu.endDate ? edu.endDate.substring(0, 7) : "Présent"}
                    </div>
                    {edu.fieldOfStudy && (
                      <div className="education-field">Domaine: {edu.fieldOfStudy}</div>
                    )}
                  </div>
                  <button className="delete-item" onClick={() => handleDelete(edu.id)}>
                    🗑️ Supprimer
                  </button>
                </div>
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
              <h3>Ajouter une formation</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Établissement *</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    required
                    placeholder="Ex: Université Paris-Saclay"
                  />
                </div>

                <div className="form-group">
                  <label>Diplôme *</label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    required
                    placeholder="Ex: Master en Informatique"
                  />
                </div>

                <div className="form-group">
                  <label>Domaine d'étude</label>
                  <input
                    type="text"
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                    placeholder="Ex: Intelligence Artificielle"
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
                  <label>Date de fin</label>
                  <input
                    type="month"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                  <small style={{color: '#6b7280'}}>Laissez vide si en cours</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageEducationPage;