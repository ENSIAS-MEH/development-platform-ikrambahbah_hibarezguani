import { useState, useEffect } from "react";
import axios from "axios";
import "./AuthStyles.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Récupérer le token depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setMessageType("error");
      setMessage("Lien invalide. Faites une nouvelle demande.");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Les mots de passe ne correspondent pas ❌");
      return;
    }

    if (newPassword.length < 6) {
      setMessageType("error");
      setMessage("Le mot de passe doit avoir au moins 6 caractères");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post("http://localhost:8084/api/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccess(true);
      setMessageType("success");
      setMessage("Mot de passe réinitialisé avec succès ! ✅");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data || "Lien expiré ou invalide. Faites une nouvelle demande.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon">🔒</div>
        <h2>Nouveau mot de passe</h2>
        <p>Choisissez un nouveau mot de passe sécurisé</p>
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Nouveau mot de passe</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Indicateur de force */}
          {newPassword && (
            <div className="password-strength">
              <div className={`strength-bar ${
                newPassword.length >= 12 ? "strong" :
                newPassword.length >= 8 ? "medium" : "weak"
              }`}></div>
              <span>{
                newPassword.length >= 12 ? "🟢 Fort" :
                newPassword.length >= 8 ? "🟡 Moyen" : "🔴 Faible"
              }</span>
            </div>
          )}

          {message && (
            <div className={`auth-message ${messageType}`}>{message}</div>
          )}

          <button type="submit" className="auth-button" disabled={isLoading || !token}>
            {isLoading ? <div className="spinner"></div> : "Réinitialiser le mot de passe"}
          </button>
        </form>
      ) : (
        <div className="auth-form">
          <div className="auth-message success">
            ✅ {message}<br />Redirection vers la connexion...
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;