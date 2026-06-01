// src/pages/ManageSkillsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, addSkill, deleteSkill } from "../services/profileService";
import "./ProfileStyles.css";

function ManageSkillsPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", level: "BEGINNER" });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setSkills(profile.skills || []);
    } catch (error) {
      console.error("Error loading skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await addSkill(newSkill);
      await loadProfile();
      setShowModal(false);
      setNewSkill({ name: "", level: "BEGINNER" });
    } catch (error) {
      console.error("Error adding skill:", error);
      alert("Erreur lors de l'ajout de la compétence");
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (window.confirm("Supprimer cette compétence ?")) {
      try {
        await deleteSkill(skillId);
        await loadProfile();
      } catch (error) {
        console.error("Error deleting skill:", error);
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
            <h2 className="section-title">Gérer les compétences</h2>
            <button className="add-button" onClick={() => setShowModal(true)}>
              + Ajouter
            </button>
          </div>

          <div className="skills-list">
            {skills.length === 0 ? (
              <p>Aucune compétence ajoutée</p>
            ) : (
              skills.map((skill) => (
                <div key={skill.id} className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level">{skill.level}</span>
                  </div>
                  <button
                    className="delete-skill"
                    onClick={() => handleDeleteSkill(skill.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              className="cancel-btn"
              onClick={() => navigate("/profile")}
            >
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
              <h3>Ajouter une compétence</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSkill}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom de la compétence</label>
                  <input
                    type="text"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    required
                    placeholder="Ex: React, Java, Python..."
                  />
                </div>
                <div className="form-group">
                  <label>Niveau</label>
                  <select
                    value={newSkill.level}
                    onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                  >
                    <option value="BEGINNER">Débutant</option>
                    <option value="INTERMEDIATE">Intermédiaire</option>
                    <option value="ADVANCED">Avancé</option>
                    <option value="EXPERT">Expert</option>
                  </select>
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

export default ManageSkillsPage;