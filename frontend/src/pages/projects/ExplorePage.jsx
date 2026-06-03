// src/pages/projects/ExplorePage.jsx
import { useEffect, useState } from "react";
import { getPublishedProjects } from "../../services/projectApi";
import { getMultipleUsers } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import JoinRequestModal from "../../components/projects/JoinRequestModal";
import "./Projects.css";

export default function ExplorePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [ownerNames, setOwnerNames] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadProjects = async (pageNum, reset = false) => {
    try {
      const res = await getPublishedProjects(pageNum, 12);
      const content = res.data.content;
      setHasMore(!res.data.last);
      
      if (reset) {
        setProjects(content);
        // Charger les noms des propriétaires
        const uniqueOwnerIds = [...new Set(content.map(p => p.ownerId))];
        const names = await getMultipleUsers(uniqueOwnerIds);
        setOwnerNames(names);
      } else {
        setProjects(prev => [...prev, ...content]);
        // Charger les noms des nouveaux propriétaires
        const newOwnerIds = [...new Set(content.map(p => p.ownerId))];
        const existingIds = Object.keys(ownerNames);
        const idsToLoad = newOwnerIds.filter(id => !existingIds.includes(String(id)));
        if (idsToLoad.length > 0) {
          const names = await getMultipleUsers(idsToLoad);
          setOwnerNames(prev => ({ ...prev, ...names }));
        }
      }
    } catch (err) {
      console.error("Erreur chargement projets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(0, true);
  }, []);

  const handleJoinClick = (project, e) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowJoinModal(true);
  };

  const handleCreateSuccess = () => {
    setPage(0);
    loadProjects(0, true);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProjects(nextPage, false);
  };

  if (loading && projects.length === 0) {
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
        <h1>Explorer les projets</h1>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Aucun projet publié</h3>
          <p>Soyez le premier à créer un projet !</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Créer un projet
          </button>
        </div>
      ) : (
        <>
          <div className="projects-grid">
            {projects.map((project) => {
              const isOwner = user?.userId === project.ownerId;
              const canJoin = project.status === "PUBLISHED" && !isOwner;
              const ownerName = ownerNames[project.ownerId] || `#${project.ownerId}`;
              
              return (
                <div 
                  key={project.id} 
                  className="project-card"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description?.substring(0, 120)}...</p>
                  <div className="project-meta">
                    <span>👑 {ownerName}</span>
                    <span>👥 {project.memberCount}/{project.maxMembers}</span>
                    <span>🏷️ {project.tags?.slice(0, 3).join(", ")}</span>
                  </div>
                  <div className="card-footer">
                    <div className={`status-badge ${project.status.toLowerCase()}`}>
                      {project.status === "PUBLISHED" ? "📢 Publié" : 
                       project.status === "DRAFT" ? "📝 Brouillon" : "📦 Archivé"}
                    </div>
                    {canJoin && (
                      <button 
                        className="btn-outline"
                        onClick={(e) => handleJoinClick(project, e)}
                      >
                        🤝 Rejoindre
                      </button>
                    )}
                    {isOwner && (
                      <span className="owner-badge">👑 Votre projet</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button className="btn-secondary" onClick={loadMore}>
                Charger plus
              </button>
            </div>
          )}
        </>
      )}

      <CreateProjectModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedProject && (
        <JoinRequestModal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
        />
      )}
    </div>
  );
}