import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "./AuthStyles.css";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("Les mots de passe ne correspondent pas ❌");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await register({
        email,
        password,
        role
      });

      setMessageType("success");
      setMessage("Inscription réussie ✅ Redirection vers la connexion...");
      
      setTimeout(() => {
        navigate("/login"); // Redirection vers la page de connexion
      }, 2000);

    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Erreur lors de l'inscription ❌");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z" fill="currentColor"/>
          </svg>
        </div>
        <h2>Créer un compte</h2>
        <p>Rejoignez notre communauté</p>
      </div>

      <form onSubmit={handleRegister} className="auth-form">
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

        <div className="input-group">
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
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

        <div className="input-group">
          <label>Rôle</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="STUDENT">🎓 Étudiant</option>
            <option value="MENTOR">⭐ Mentor</option>
          </select>
        </div>

        {message && (
          <div className={`auth-message ${messageType}`}>
            {message}
          </div>
        )}

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>
    </div>
  );
}

export default Register;