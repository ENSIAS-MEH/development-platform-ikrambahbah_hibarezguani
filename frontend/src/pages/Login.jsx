import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "./AuthStyles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate(); // conservez si besoin mais on ne l'utilise plus pour la redirection

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await login({ email, password });

      // loginUser() decode le JWT et stocke userId + email + role dans le contexte global
      loginUser(response.data.token);

      setMessageType("success");
      setMessage("Connexion réussie ✅ Redirection en cours...");

      // ✅ Plus de navigate manuel : la redirection se fait via PublicRoute dans App.js
      // Le setTimeout n'est pas nécessaire ; on laisse le temps au contexte de se mettre à jour.
      // Pour un meilleur UX, on peut garder le message puis la redirection sera automatique.
      // Le navigate est supprimé.

    } catch (error) {
      setMessageType("error");
      setMessage(
        error.response?.data?.message || "Email ou mot de passe incorrect ❌"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2>Bienvenue</h2>
        <p>Connectez-vous à votre compte</p>
      </div>

      <form onSubmit={handleLogin} className="auth-form">
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
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="auth-options">
          <label className="checkbox-label">
            <input type="checkbox" /> Se souvenir de moi
          </label>
          <a href="/forgot-password" className="forgot-link">
            Mot de passe oublié ?
          </a>
        </div>

        {message && (
          <div className={`auth-message ${messageType}`}>{message}</div>
        )}

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? <div className="spinner"></div> : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default Login;