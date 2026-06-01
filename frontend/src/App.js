// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ExplorePage from "./pages/projects/ExplorePage";
import ProjectDetail from "./pages/projects/ProjectDetail";
import MyProjectsPage from "./pages/projects/MyProjectsPage";
import MyRequestsPage from "./pages/projects/MyRequestsPage";

// Importer les pages du Profile Service
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ManageSkillsPage from "./pages/ManageSkillsPage";
import ManageExperiencePage from "./pages/ManageExperiencePage";
import ManageEducationPage from "./pages/ManageEducationPage";

// Importer la page 403 (accès refusé)
import ForbiddenPage from "./pages/ForbiddenPage";

import "./App.css";

import ConversationsPage from "./pages/messaging/ConversationsPage";
import ConversationDetail from "./pages/messaging/ConversationDetail";

// Route privée pour les étudiants uniquement
function StudentRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== "STUDENT") {
    return <Navigate to="/forbidden" replace />;
  }
  
  return children;
}

// Route privée standard (tous les utilisateurs connectés)
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Route publique
function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  
  if (isAuthenticated && user?.role === "STUDENT") {
    return <Navigate to="/projects" replace />;
  }
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/projects" replace />;
}

function AppRoutes() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/forbidden" element={<ForbiddenPage />} />
        
        {/* Pages Project Service */}
        <Route path="/projects" element={<StudentRoute><ExplorePage /></StudentRoute>} />
        <Route path="/projects/:id" element={<StudentRoute><ProjectDetail /></StudentRoute>} />
        <Route path="/my-projects" element={<StudentRoute><MyProjectsPage /></StudentRoute>} />
        <Route path="/my-requests" element={<StudentRoute><MyRequestsPage /></StudentRoute>} />
        
        {/* Pages Profile Service */}
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/profile/edit" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
        <Route path="/profile/skills" element={<PrivateRoute><ManageSkillsPage /></PrivateRoute>} />
        <Route path="/profile/experience" element={<PrivateRoute><ManageExperiencePage /></PrivateRoute>} />
        <Route path="/profile/education" element={<PrivateRoute><ManageEducationPage /></PrivateRoute>} />
        
        <Route path="/profile/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        {/* CONVERSATIONS */}
        <Route path="/conversations" element={<PrivateRoute><ConversationsPage /></PrivateRoute>} />
        <Route path="/conversations/:id" element={<PrivateRoute><ConversationDetail /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </WebSocketProvider>
    </AuthProvider>
  );
}


export default App;