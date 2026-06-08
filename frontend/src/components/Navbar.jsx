import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getProfile } from "../services/profileService";
import "./Navbar.css";
import MentorProfileModal from "../components/MentorProfileModal";

export default function Navbar() {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showMentorProfileModal, setShowMentorProfileModal] = useState(false);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Charger le profil pour avoir le nom complet et la photo
  useEffect(() => {
    if (isAuthenticated) {
      const loadProfile = async () => {
        try {
          const data = await getProfile();
          setProfile(data);
        } catch (error) {
          console.error("Erreur chargement profil:", error);
        }
      };
      loadProfile();
    }
  }, [isAuthenticated]);

  // Correction : rediriger vers Homepage avec rechargement forcé
  const handleLogout = () => {
    logoutUser();
    window.location.href = "/";
  };

  // Récupérer les initiales pour l'avatar
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile?.firstName) {
      return profile.firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Récupérer le nom à afficher
  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile?.firstName) {
      return profile.firstName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Utilisateur";
  };

  // ✅ Vérifier si l'utilisateur est un étudiant (STUDENT)
  const isStudent = user?.role === "STUDENT";
  // ✅ Vérifier si l'utilisateur est un mentor (MENTOR)
  const isMentor = user?.role === "MENTOR";

  return (
    <>
    <nav className="navbar-modern">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">Project<span className="logo-highlight">Match</span></span>
        </Link>

        {isAuthenticated ? (
          <>
            <div className="nav-links">
              {/* ========== LIENS PROJETS (ÉTUDIANT) ========== */}
              {isStudent && (
                <>
                  <Link to="/projects" className="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-5v-7H9v7H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Explorer
                  </Link>
                  <Link to="/my-projects" className="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 7h-4.18A3 3 0 0 0 16 5.18V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.18A3 3 0 0 0 8.18 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Mes projets
                  </Link>
                  <Link to="/my-requests" className="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Demandes
                  </Link>
                </>
              )}

              {/* ========== LIENS FORMATIONS (ÉTUDIANT) ========== */}
              {isStudent && (
                <>
                  <Link to="/trainings" className="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3v1m0 16v1M5.5 7l.9.9M17.5 7l-.9.9M4 12h1m14 0h1M7 17l.9-.9M17 17l-.9-.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Formations
                  </Link>
                  <Link to="/my-learnings" className="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 6.5v3M9 10.5L7 12l2 1.5M15 10.5l2 1.5-2 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M2 12h2M20 12h2M4 5L6 7M18 5l2 2M6 19L4 21M20 19l2 2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Mes formations
                  </Link>
                </>
              )}

              {/* ========== LIENS FORMATIONS (MENTOR) ========== */}
              {isMentor && (
                <Link to="/mentor/trainings" className="nav-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v1m0 16v1M5.5 7l.9.9M17.5 7l-.9.9M4 12h1m14 0h1M7 17l.9-.9M17 17l-.9-.9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 9v3l2 2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Gérer les formations
                </Link>
              )}

              {/* ========== LIEN MESSAGES (TOUS CONNECTÉS) ========== */}
              <Link to="/conversations" className="nav-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                Messages
              </Link>
            </div>

            {/* Menu utilisateur (toujours visible) */}
            <div className="user-menu-container">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="user-avatar-img" />
                ) : (
                  <div className="user-avatar">
                    {getInitials()}
                  </div>
                )}
                <span className="user-name">{getDisplayName()}</span>
                <svg 
                  className={`dropdown-arrow ${showDropdown ? "open" : ""}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </button>
                           
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="dropdown-avatar" />
                    ) : (
                      <div className="dropdown-avatar-placeholder">
                        {getInitials()}
                      </div>
                    )}
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{getDisplayName()}</div>
                      <div className="dropdown-user-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Voir mon profil
                  </Link>
                {isMentor ? (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setShowDropdown(false);
                      setShowMentorProfileModal(true);
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34M18 2l4 4M14 10l8-8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Modifier le profil
                  </button>
                ) : (
                  <Link to="/profile/edit" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34M18 2l4 4M14 10l8-8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Modifier le profil
                  </Link>
                )}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l4-4-4-4M12 13V3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="nav-buttons">
            <Link to="/login" className="nav-btn-login">Connexion</Link>
            <Link to="/register" className="nav-btn-register">Inscription</Link>
          </div>
        )}
      </div>
      </nav>

       {showMentorProfileModal && (
      <MentorProfileModal
        isOpen={showMentorProfileModal}
        onClose={() => setShowMentorProfileModal(false)}
        onProfileUpdated={() => {
              // Recharger le profil dans la navbar après modification
              window.location.reload(); // ou mieux : refetch le profil
            }}
          />
        )}
      </>
    );
}