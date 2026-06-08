import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Decode JWT payload without external library
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { userId, email, role }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        // Token still valid
        setToken(savedToken);
        setUser({
          userId: decoded.userId,
          email: decoded.sub,
          role: decoded.role,
        });
        // ✅ AJOUT : Stocker userId dans localStorage
        localStorage.setItem("userId", decoded.userId);
      } else {
        // Token expiré → nettoyer
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId"); // ✅ AJOUT
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return;

    localStorage.setItem("token", token);
    localStorage.setItem("role", decoded.role);
    localStorage.setItem("userId", decoded.userId); // ✅ AJOUT

    setToken(token);
    setUser({
      userId: decoded.userId,
      email: decoded.sub,
      role: decoded.role,
    });
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId"); // ✅ AJOUT
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}