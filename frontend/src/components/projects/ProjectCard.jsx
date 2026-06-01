import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo } from "../../services/userApi";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const [ownerName, setOwnerName] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(true);

  useEffect(() => {
    if (project.ownerId) {
      getUserInfo(project.ownerId)
        .then(res => {
          const email = res.data.email;
          const name = email.split('@')[0];
          setOwnerName(name);
        })
        .catch(() => {
          setOwnerName(`#${project.ownerId}`);
        })
        .finally(() => setLoadingOwner(false));
    }
  }, [project.ownerId]);

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <h3>{project.title}</h3>
      <p>{project.description?.substring(0, 100)}...</p>
      <div className="project-meta">
        <span>👑 {loadingOwner ? "..." : ownerName}</span>
        <span>👥 {project.memberCount}/{project.maxMembers}</span>
        <span>🏷️ {project.tags?.slice(0, 3).join(", ")}</span>
      </div>
      <div className={`status-badge ${project.status.toLowerCase()}`}>
        {project.status === "PUBLISHED" ? "📢 Publié" : 
         project.status === "DRAFT" ? "📝 Brouillon" : "📦 Archivé"}
      </div>
    </div>
  );
}