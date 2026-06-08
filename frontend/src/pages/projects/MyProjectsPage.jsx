import { useEffect, useState } from "react";
import { getMyProjects, publishProject, archiveProject } from "../../services/projectApi";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import "./Projects.css";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await getMyProjects();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (projectId, e) => {
    e.stopPropagation();
    setActionLoading(projectId);
    try {
      await publishProject(projectId);
      alert("✅ Projet publié ! Il est maintenant visible par tous.");
      await loadProjects();
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Impossible de publier"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm("Archiver ce projet ? Il ne sera plus visible publiquement.")) return;
    setActionLoading(projectId);
    try {
      await archiveProject(projectId);
      alert("📦 Projet archivé");
      await loadProjects();
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Impossible d'archiver"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSuccess = () => {
    loadProjects();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mes projets</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nouveau projet
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>Aucun projet</h3>
          <p>Vous n'avez pas encore créé de projet.</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Créer mon premier projet
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <h3>{project.title}</h3>
              <p>{project.description?.substring(0, 100)}...</p>
              <div className="project-meta">
                <span>👥 {project.memberCount}/{project.maxMembers}</span>
                <span>🏷️ {project.tags?.slice(0, 3).join(", ")}</span>
              </div>
              <div className="card-footer">
                <div className={`status-badge ${project.status.toLowerCase()}`}>
                  {project.status === "PUBLISHED" ? "📢 Publié" : 
                   project.status === "DRAFT" ? "📝 Brouillon" : "📦 Archivé"}
                </div>
                <div className="project-actions">
                  {project.status === "DRAFT" && (
                    <button 
                      className="btn-outline"
                      onClick={(e) => handlePublish(project.id, e)}
                      disabled={actionLoading === project.id}
                    >
                      {actionLoading === project.id ? "..." : "🚀 Publier"}
                    </button>
                  )}
                  {project.status === "PUBLISHED" && (
                    <button 
                      className="btn-outline archive"
                      onClick={(e) => handleArchive(project.id, e)}
                      disabled={actionLoading === project.id}
                    >
                      {actionLoading === project.id ? "..." : "📦 Archiver"}
                    </button>
                  )}
                  {project.status === "ARCHIVED" && (
                    <span className="archived-label">Archivé</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création réutilisable */}
      <CreateProjectModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}