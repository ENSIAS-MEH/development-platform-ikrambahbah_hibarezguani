// src/components/MentorProfileModal.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const PROFILE_API = "http://localhost:8082/api/profiles";

const MentorProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    avatarUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    websiteUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${PROFILE_API}/me`, { headers: getAuthHeader() });
      setProfile(response.data);
      setProfileForm({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        bio: response.data.bio || "",
        avatarUrl: response.data.avatarUrl || "",
        linkedinUrl: response.data.linkedinUrl || "",
        githubUrl: response.data.githubUrl || "",
        websiteUrl: response.data.websiteUrl || "",
      });
    } catch (error) {
      setProfile(null);
    }
  };

  const createProfile = async () => {
    const userId = localStorage.getItem("userId");
    const response = await axios.post(
      `${PROFILE_API}/me`,
      {
        authUserId: parseInt(userId),
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
      },
      { headers: getAuthHeader() }
    );
    return response.data;
  };

  const updateProfile = async () => {
    const response = await axios.put(`${PROFILE_API}/me`, profileForm, {
      headers: getAuthHeader(),
    });
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!profile) await createProfile();
      await updateProfile();
      await fetchProfile();
      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch (error) {
      alert("Erreur: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,  // supérieur à la navbar (1000)
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "white",
          borderRadius: "24px",
          width: "90%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #f0fdf4",
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" }}>
                {profile ? "👤 Mon profil professionnel" : "✨ Créer mon profil"}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b" }}>
                {profile
                  ? "Modifiez vos informations publiques"
                  : "Complétez votre profil pour apparaître comme mentor"}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#94a3b8",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            {/* Aperçu avatar */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                  fontWeight: "600",
                  color: "white",
                  boxShadow: "0 8px 20px rgba(102,126,234,0.3)",
                }}
              >
                {profileForm.firstName?.[0] || "?"}
                {profileForm.lastName?.[0] || "?"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Prénom
                </label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  Nom
                </label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Bio professionnelle
              </label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows="4"
                placeholder="Décrivez votre expérience, vos domaines d'expertise..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                URL de l'avatar
              </label>
              <input
                type="url"
                value={profileForm.avatarUrl}
                onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                placeholder="https://..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <span>🔗</span> LinkedIn
                </label>
                <input
                  type="url"
                  value={profileForm.linkedinUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                  placeholder="linkedin.com/in/..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                    marginBottom: "6px",
                  }}
                >
                  <span>🐙</span> GitHub
                </label>
                <input
                  type="url"
                  value={profileForm.githubUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                  placeholder="github.com/..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                <span>🌐</span> Site web
              </label>
              <input
                type="url"
                value={profileForm.websiteUrl}
                onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                placeholder="https://..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                }}
              />
            </div>

            {!profile && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#fef3c7",
                  borderRadius: "12px",
                  fontSize: "13px",
                  color: "#92400e",
                }}
              >
                ⚠️ Après création, vous pourrez modifier votre profil à tout moment.
              </div>
            )}
          </div>

          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 24px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "40px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 28px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "40px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Enregistrement..."
                : profile
                ? "💾 Enregistrer les modifications"
                : "✨ Créer mon profil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorProfileModal;