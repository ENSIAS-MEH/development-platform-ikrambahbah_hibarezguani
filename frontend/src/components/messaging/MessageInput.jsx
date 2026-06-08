// src/components/messaging/MessageInput.jsx
import { useState, useRef } from "react";
import { uploadFile } from "../../services/messagingApi";
import "./Messaging.css";

export default function MessageInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && attachments.length === 0) || disabled || uploading) return;
    
    // Uploader les fichiers avant d'envoyer le message
    setUploading(true);
    const uploadedUrls = [];
    
    try {
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        setUploadProgress(prev => ({ ...prev, [attachment.id]: 'uploading' }));
        const url = await uploadFile(attachment.file);
        uploadedUrls.push(url);
        setUploadProgress(prev => ({ ...prev, [attachment.id]: 'done' }));
      }
      
      // Envoyer le message avec les URLs des fichiers uploadés
      onSend(message.trim(), uploadedUrls);
      
      // Nettoyer
      setMessage("");
      setAttachments([]);
      setUploadProgress({});
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'envoi des fichiers");
    } finally {
      setUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id) => {
    const attachment = attachments.find(a => a.id === id);
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachments(prev => prev.filter(a => a.id !== id));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.startsWith('video/')) return '🎥';
    if (type?.startsWith('audio/')) return '🎵';
    if (type?.includes('pdf')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="message-input-container">
      {/* Aperçu des pièces jointes */}
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((att) => (
            <div key={att.id} className="attachment-preview-item">
              {att.type?.startsWith('image/') ? (
                <img src={att.preview} alt={att.name} className="attachment-preview-img" />
              ) : (
                <div className="attachment-preview-icon">
                  {getFileIcon(att.type)}
                </div>
              )}
              <div className="attachment-preview-info">
                <span className="attachment-name">{att.name}</span>
                <span className="attachment-size">{formatFileSize(att.size)}</span>
              </div>
              {uploadProgress[att.id] === 'uploading' ? (
                <div className="attachment-uploading">
                  <div className="spinner-small"></div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="attachment-remove"
                  onClick={() => removeAttachment(att.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      <form className="message-input-form" onSubmit={handleSubmit}>
        <button 
          type="button" 
          className="attach-btn" 
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          📎
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
        />
        
        <textarea
          className="message-input"
          placeholder={disabled || uploading ? "Envoi en cours..." : "Écrivez votre message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || uploading}
          rows={1}
        />
        
        <button 
          type="submit" 
          className="message-send-btn" 
          disabled={disabled || uploading || (!message.trim() && attachments.length === 0)}
        >
          {uploading ? (
            <div className="spinner-small"></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}