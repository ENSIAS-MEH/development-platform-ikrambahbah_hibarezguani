import { useState } from "react";
import { createProject } from "../../services/projectApi";

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    maxMembers: 10, 
    tags: "" 
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      alert("❌ Le titre est obligatoire");
      return;
    }
    
    setLoading(true);
    try {
      await createProject({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(t => t),
      });
      alert("✅ Projet créé avec succès !");
      setForm({ title: "", description: "", maxMembers: 10, tags: "" });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Une erreur est survenue"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un nouveau projet</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              placeholder="Ex: Application mobile de mentoring"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Décrivez votre projet..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Nombre maximum de membres</label>
            <input
              type="number"
              min="2"
              max="50"
              value={form.maxMembers}
              onChange={(e) => setForm({ ...form, maxMembers: parseInt(e.target.value) })}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Tags (séparés par des virgules)</label>
            <input
              type="text"
              placeholder="Ex: React, Spring Boot, IA"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              disabled={loading}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? "Création..." : "Créer le projet"}
          </button>
        </div>
      </div>
    </div>
  );
}