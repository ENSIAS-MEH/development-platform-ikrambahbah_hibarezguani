import { useState } from "react";
import axios from "axios";
import "./AuthStyles.css";

const API_GATEWAY = "http://localhost:8080";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API_GATEWAY}/api/auth/forgot-password`, { email });
      setSent(true);
      setMessageType("success");
      setMessage("Un email de réinitialisation a été envoyé si ce compte existe ✅");
    } catch (error) {
      setMessageType("error");
      setMessage("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon">🔑</div>
        <h2>Mot de passe oublié</h2>
        <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className={`auth-message ${messageType}`}>{message}</div>
          )}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : "Envoyer le lien"}
          </button>
        </form>
      ) : (
        <div className="auth-form">
          <div className="auth-message success">
            📧 Email envoyé ! Vérifiez votre boîte mail (et les spams).
            <br /><br />
            Le lien expire dans <strong>15 minutes</strong>.
          </div>
          <button className="auth-button" onClick={() => window.location.href = "/login"}>
            Retour à la connexion
          </button>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="/login" className="forgot-link">← Retour à la connexion</a>
      </div>
    </div>
  );
}

export default ForgotPassword;