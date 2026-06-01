import { useNavigate } from "react-router-dom";
import "./Homepage.css";

function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <span className="logo-text">Project<span className="logo-highlight">Match</span></span>
          </div>
          <div className="nav-buttons">
            <button className="nav-btn login-btn" onClick={() => navigate("/login")}>
              Se connecter
            </button>
            <button className="nav-btn register-btn" onClick={() => navigate("/register")}>
              S'inscrire
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge">✨ La nouvelle façon de collaborer</span>
            </div>
            <h1 className="hero-title">
              Trouvez les talents qui
              <span className="gradient-text"> correspondent </span>
              à vos projets
            </h1>
            <p className="hero-description">
              Project Match connecte les étudiants passionnés et les mentors expérimentés
              pour créer des projets innovants. Rejoignez une communauté où les idées prennent vie.
            </p>
            
            

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => navigate("/register")}>
                Commencer maintenant
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="secondary-btn" onClick={() => navigate("/login")}>
                Se connecter
              </button>
            </div>
          </div>

          <div className="hero-image">
            <div className="image-container">
              <div className="floating-card card-1">
                <div className="card-icon">🎯</div>
                <div className="card-text">Trouvez votre mentor</div>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">💡</div>
                <div className="card-text">Projets innovants</div>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">🤝</div>
                <div className="card-text">Collaboration</div>
              </div>
              <div className="hero-illustration">
                <svg viewBox="0 0 500 500" fill="none">
                  <circle cx="250" cy="250" r="200" fill="url(#gradient)" opacity="0.1"/>
                  <path d="M150 250 L200 200 L300 200 L350 250 L300 300 L200 300 Z" fill="url(#gradient)" opacity="0.8"/>
                  <circle cx="250" cy="250" r="50" fill="white" opacity="0.9"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Pourquoi choisir <span className="gradient-text">Project Match</span> ?</h2>
            <p>Une plateforme conçue pour faciliter la collaboration et l'innovation</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Pour les Étudiants</h3>
              <p>Trouvez des mentors expérimentés qui vous guideront dans vos projets académiques et personnels.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Pour les Mentors</h3>
              <p>Partagez votre expertise et accompagnez la prochaine génération de talents innovants.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Projets Collaboratifs</h3>
              <p>Créez, gérez et développez des projets ambitieux avec des personnes partageant les mêmes idées.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>Comment ça <span className="gradient-text">marche</span> ?</h2>
            <p>Un processus simple en 3 étapes</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">📝</div>
              <h3>Créez votre profil</h3>
              <p>Inscrivez-vous et renseignez vos compétences, intérêts et objectifs.</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">🔍</div>
              <h3>Trouvez votre match</h3>
              <p>Notre algorithme vous suggère les meilleurs mentors ou étudiants.</p>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">💪</div>
              <h3>Collaborez</h3>
              <p>Lancez votre projet et bénéficiez d'un accompagnement personnalisé.</p>
            </div>
          </div>
        </div>
      </div>

      

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à commencer l'aventure ?</h2>
            <p>Rejoignez une communauté dynamique et donnez vie à vos projets</p>
            <button className="cta-btn" onClick={() => navigate("/register")}>
              Créer mon compte gratuitement
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          
          <div className="footer-bottom">
            <p>&copy; 2026 Project Match - Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;