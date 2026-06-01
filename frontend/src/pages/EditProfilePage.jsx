// src/pages/EditProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, createProfile } from "../services/profileService";
import "./ProfileStyles.css";

function EditProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileExists, setProfileExists] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    avatarUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        setProfileExists(true);
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          bio: profile.bio || "",
          avatarUrl: profile.avatarUrl || "",
          linkedinUrl: profile.linkedinUrl || "",
          githubUrl: profile.githubUrl || "",
          websiteUrl: profile.websiteUrl || "",
        });
      } catch (error) {
        if (error.response?.status === 404) {
          setProfileExists(false);
          console.log("Aucun profil trouvé, il sera créé à l'enregistrement");
        } else {
          console.error("Error loading profile:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (!profileExists) {
        // Créer le profil d'abord
        await createProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      }
      
      // Mettre à jour le profil complet
      await updateProfile(formData);
      navigate("/profile");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Erreur lors de l'enregistrement du profil");
    } finally {
      setSubmitting(false);
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
        <form onSubmit={handleSubmit}>
          <div className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Modifier le profil</h2>
            </div>

            <div className="form-group">
              <label>Prénom *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Décrivez-vous professionnellement..."
              />
            </div>

            <div className="form-group">
              <label>URL de l'avatar</label>
              <input
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="form-group">
              <label>Site Web</label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="modal-footer" style={{ padding: "20px 0 0 0" }}>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/profile")}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;