import { useNavigate } from "react-router-dom";
import "./ForbiddenPage.css";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="forbidden-container">
      <div className="forbidden-card">
        <div className="forbidden-icon">🚫</div>
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        <p className="forbidden-hint">Cette section est réservée aux étudiants.</p>
        <div className="forbidden-buttons">
          <button className="btn-primary" onClick={() => navigate("/profile")}>
            Aller à mon profil
          </button>
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}