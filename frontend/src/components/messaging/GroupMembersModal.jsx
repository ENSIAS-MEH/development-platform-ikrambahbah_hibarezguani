// src/components/messaging/GroupMembersModal.jsx
import { useNavigate } from "react-router-dom";

export default function GroupMembersModal({ isOpen, onClose, groupName, members, currentUserId }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleMemberClick = (memberId) => {
    if (memberId !== currentUserId) {
      onClose();
      navigate(`/profile/${memberId}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <span className="modal-header-icon">👥</span>
            {groupName || "Membres du groupe"}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="group-members-stats">
            {members.length} membre{members.length > 1 ? 's' : ''}
          </div>
          
          <div className="group-members-list">
            {members.map((member) => (
              <div 
                key={member.id} 
                className={`group-member-item ${member.isCurrentUser ? 'current-user' : ''} ${member.id !== currentUserId ? 'clickable' : ''}`}
                onClick={() => handleMemberClick(member.id)}
              >
                <div className="group-member-avatar">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt="Avatar" className="group-member-avatar-img" />
                  ) : (
                    <div className="group-member-avatar-placeholder">
                      {member.avatarInitial}
                    </div>
                  )}
                </div>
                <div className="group-member-info">
                  <div className="group-member-name">
                    {member.displayName}
                    {member.isCurrentUser && <span className="current-user-badge"> (moi)</span>}
                  </div>
                  {member.email && (
                    <div className="group-member-email">{member.email}</div>
                  )}
                </div>
                {member.id !== currentUserId && (
                  <div className="group-member-action">
                    <span className="message-icon">💬</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}