// src/pages/student/TrainingDetailPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../services/authService";
import PaymentModal from "./PaymentModal";

function TrainingDetailPage() {
  const { trainingId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [training, setTraining] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [activeTab, setActiveTab] = useState("overview");
  const [resources, setResources] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);


  useEffect(() => {
    fetchProfile();
    fetchTraining();
    checkEnrollment();
    fetchReviews();
    fetchResources();
  }, [trainingId]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get(`/api/profiles/me`);
      setProfile(response.data);
    } catch (error) {
      console.error("Profile error:", error);
    }
  };

  const fetchTraining = async () => {
    try {
      const res = await apiClient.get(`/api/trainings/${trainingId}`);
      setTraining(res.data);
    } catch (err) {
      console.error("Error fetching training:", err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await apiClient.get(`/api/trainings/${trainingId}/resources`);
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setResources([]);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await apiClient.get(`/api/trainings/my-enrollments`);
      setIsEnrolled(res.data.some((e) => e.id === parseInt(trainingId)));
    } catch (err) {
      console.error("Error checking enrollment:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await apiClient.get(`/api/trainings/${trainingId}/reviews`);
      setReviews(res.data);
      if (res.data.length > 0) {
        const avg = res.data.reduce((sum, r) => sum + r.rating, 0) / res.data.length;
        setStats({ averageRating: avg, totalReviews: res.data.length });
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!training) return;
    if (isEnrolled) return;

    if (training.type === "PAID") {
      setShowPaymentModal(true);
      return;
    }

    try {
      await apiClient.post(`/api/trainings/${trainingId}/enroll`, {});
      setIsEnrolled(true);
      alert("✅ Inscription réussie ! Vous pouvez maintenant accéder aux ressources.");
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  const handlePaymentSuccess = (transactionId) => {
    setShowPaymentModal(false);
    setIsEnrolled(true);
    setActiveTab("resources");
    alert(`✅ Paiement confirmé ! Transaction : ${transactionId}\nVous avez maintenant accès à la formation.`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post(`/api/trainings/${trainingId}/reviews`, reviewForm);
      await fetchReviews();
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      alert("⭐ Merci pour votre avis !");
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getStars = (rating) => {
    const fullStars = "⭐".repeat(Math.floor(rating));
    const halfStar = rating % 1 >= 0.5 ? "½" : "";
    const emptyStars = "☆".repeat(5 - Math.ceil(rating));
    return fullStars + halfStar + emptyStars;
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "VIDEO": return "🎥";
      case "PDF": return "📄";
      case "LINK": return "🔗";
      case "EXERCISE": return "💻";
      default: return "📁";
    }
  };

  const getResourceTypeLabel = (type) => {
    switch (type) {
      case "VIDEO": return "Vidéo";
      case "PDF": return "PDF";
      case "LINK": return "Lien externe";
      case "EXERCISE": return "Exercice";
      default: return "Ressource";
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de la formation...</p>
      </div>
    );

  if (!training)
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>Formation non trouvée</h3>
        <button className="btn-primary" onClick={() => navigate("/trainings")}>
          Retour aux formations
        </button>
      </div>
    );

  const isPaid = training.type === "PAID";

  return (
    <div className="training-detail-page">
      {showPaymentModal && (
        <PaymentModal
          training={training}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Le reste du JSX reste identique - inchangé */}
      <header className="detail-header">
        <div className="detail-header-content">
          <button className="back-btn" onClick={() => navigate("/trainings")}>
            ← Retour aux formations
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-hero-content">
          <div className="training-badge">
            <span className={`type-badge ${isPaid ? "paid" : "free"}`}>
              {isPaid ? "💰 Payante" : "🎁 Gratuite"}
            </span>
            <span className={`status-badge ${training.status === "PUBLISHED" ? "published" : "draft"}`}>
              {training.status === "PUBLISHED" ? "✓ Publiée" : "📝 Brouillon"}
            </span>
          </div>
          <h1>{training.title}</h1>
          <p className="description">{training.description}</p>
          <div className="stats-row">
            <span>⏱️ {training.duration} heures</span>
            <span>👥 {training.enrolledCount || 0} étudiants inscrits</span>
            <span>
              ⭐ {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "Nouveau"} ({stats.totalReviews} avis)
            </span>
            {isPaid && training.price && (
              <span style={{ fontWeight: "700", fontSize: "18px" }}>
                💳 {training.price.toFixed(2)} MAD
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="detail-tabs">
        <button className={`tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
          📋 Aperçu
        </button>
        <button className={`tab ${activeTab === "resources" ? "active" : ""}`} onClick={() => setActiveTab("resources")}>
          📁 Ressources {resources.length > 0 && `(${resources.length})`}
        </button>
        <button className={`tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
          ⭐ Avis ({stats.totalReviews})
        </button>
      </div>

      {/* Contenu - le reste reste identique à l'original */}
      <div className="detail-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="card">
              <h2>À propos de cette formation</h2>
              <p>{training.description}</p>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-icon">⏱️</span>
                  <div>
                    <strong>Durée totale</strong>
                    <p>{training.duration} heures</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">👥</span>
                  <div>
                    <strong>Participants</strong>
                    <p>{training.enrolledCount || 0} étudiants inscrits</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">📋</span>
                  <div>
                    <strong>Type</strong>
                    <p>{isPaid ? "Payante" : "Gratuite"}</p>
                  </div>
                </div>
                {isPaid && (
                  <div className="info-item">
                    <span className="info-icon">💳</span>
                    <div>
                      <strong>Prix</strong>
                      <p>{training.price?.toFixed(2)} MAD</p>
                    </div>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-icon">📚</span>
                  <div>
                    <strong>Ressources</strong>
                    <p>{resources.length} ressources disponibles</p>
                  </div>
                </div>
              </div>
              {!isEnrolled ? (
                <button className="btn-enroll-large" onClick={handleEnroll}>
                  {isPaid ? `💳 S'inscrire — ${training.price?.toFixed(2)} MAD` : "📝 S'inscrire gratuitement"}
                </button>
              ) : (
                <div className="enrolled-message">
                  <span>✅ Vous êtes inscrit à cette formation</span>
                  <button onClick={() => setActiveTab("resources")}>📁 Accéder aux ressources</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab - inchangé */}
        {activeTab === "resources" && (
          <div className="resources-section">
            <div className="card">
              <h2>📁 Contenu de la formation</h2>
              {!isEnrolled ? (
                <div className="locked-content">
                  <div className="lock-icon">🔒</div>
                  <h3>Ressources verrouillées</h3>
                  <p>
                    {isPaid
                      ? "Achetez cette formation pour accéder à toutes les ressources."
                      : "Inscrivez-vous à cette formation pour accéder à toutes les ressources pédagogiques."}
                  </p>
                  <button className="btn-enroll" onClick={handleEnroll}>
                    {isPaid ? `💳 Acheter — ${training.price?.toFixed(2)} MAD` : "S'inscrire maintenant"}
                  </button>
                </div>
              ) : resources.length === 0 ? (
                <div className="empty-resources">
                  <div className="empty-icon">📭</div>
                  <p>Aucune ressource n'a encore été ajoutée à cette formation.</p>
                </div>
              ) : (
                <div className="resources-list">
                  {resources.map((resource, index) => (
                    <div key={resource.id} className="resource-item">
                      <div className="resource-number">{index + 1}</div>
                      <div className="resource-icon">{getResourceIcon(resource.type)}</div>
                      <div className="resource-info">
                        <h4>{resource.title}</h4>
                        <span className="resource-type">{getResourceTypeLabel(resource.type)}</span>
                      </div>
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                          Voir →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab - inchangé */}
        {activeTab === "reviews" && (
          <div className="reviews-section">
            <div className="card">
              <div className="reviews-header">
                <div>
                  <h2>⭐ Avis des étudiants</h2>
                  {stats.totalReviews > 0 && (
                    <div className="rating-summary">
                      <span className="big-rating">{stats.averageRating.toFixed(1)}</span>
                      <span className="stars-large">{getStars(stats.averageRating)}</span>
                      <span className="review-count">sur la base de {stats.totalReviews} avis</span>
                    </div>
                  )}
                </div>
                {isEnrolled && !showReviewForm && (
                  <button className="btn-write-review" onClick={() => setShowReviewForm(true)}>
                    ✍️ Donner mon avis
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className="review-form-card">
                  <h3>Partagez votre expérience</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="rating-select">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <label key={r} className={`rating-option ${reviewForm.rating === r ? "selected" : ""}`}>
                          <input
                            type="radio"
                            name="rating"
                            value={r}
                            checked={reviewForm.rating === r}
                            onChange={() => setReviewForm({ ...reviewForm, rating: r })}
                          />
                          {r} ⭐
                        </label>
                      ))}
                    </div>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows="4"
                      placeholder="Qu'avez-vous pensé de cette formation ?"
                      required
                    />
                    <div className="form-actions">
                      <button type="button" className="btn-cancel" onClick={() => setShowReviewForm(false)}>
                        Annuler
                      </button>
                      <button type="submit" className="btn-submit" disabled={submitting}>
                        {submitting ? "Envoi..." : "Publier mon avis"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="no-reviews">
                  <div className="empty-icon">📝</div>
                  <p>Soyez le premier à donner votre avis sur cette formation !</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-author">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userFullName} />
                        ) : (
                          <div className="author-avatar">{review.userFullName?.charAt(0) || "U"}</div>
                        )}
                        <div className="author-info">
                          <strong>{review.userFullName}</strong>
                          <span>{review.formattedDate || new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="review-rating">{getStars(review.rating)}</div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

       {/* Styles*/}
      <style jsx>{`
        .training-detail-page { min-height: 100vh; background: #f7f9fc; }
        .detail-header { background: white; border-bottom: 1px solid #e2e8f0; padding: 12px 32px; position: sticky; top: 0; z-index: 100; }
        .detail-header-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .back-btn { background: none; border: none; font-size: 14px; color: #667eea; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .back-btn:hover { text-decoration: underline; }
        .student-profile { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 36px; height: 36px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .detail-hero { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 48px 32px; }
        .detail-hero-content { max-width: 1200px; margin: 0 auto; }
        .training-badge { display: flex; gap: 12px; margin-bottom: 20px; }
        .type-badge, .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .type-badge.free { background: #d1fae5; color: #065f46; }
        .type-badge.paid { background: #fed7aa; color: #9a3412; }
        .status-badge.published { background: rgba(255,255,255,0.2); color: white; }
        .detail-hero h1 { font-size: 32px; margin-bottom: 16px; }
        .detail-hero .description { font-size: 16px; opacity: 0.9; margin-bottom: 24px; max-width: 800px; line-height: 1.6; }
        .stats-row { display: flex; gap: 24px; font-size: 14px; opacity: 0.9; flex-wrap: wrap; }
        .detail-tabs { max-width: 1200px; margin: 0 auto; padding: 0 32px; display: flex; gap: 32px; border-bottom: 1px solid #e2e8f0; background: white; }
        .tab { padding: 16px 0; background: none; border: none; font-size: 15px; font-weight: 500; color: #64748b; cursor: pointer; transition: color 0.2s; }
        .tab:hover { color: #667eea; }
        .tab.active { color: #667eea; border-bottom: 2px solid #667eea; }
        .detail-content { max-width: 1200px; margin: 0 auto; padding: 32px; }
        .card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .card h2 { font-size: 20px; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin: 24px 0; padding: 24px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .info-item { display: flex; align-items: center; gap: 12px; }
        .info-icon { font-size: 28px; }
        .info-item strong { display: block; font-size: 13px; color: #64748b; }
        .info-item p { font-size: 16px; font-weight: 600; color: #1e293b; }
        .btn-enroll-large { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 24px; }
        .enrolled-message { margin-top: 24px; padding: 16px; background: #d1fae5; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .enrolled-message span { color: #065f46; font-weight: 500; }
        .enrolled-message button { padding: 8px 20px; background: #065f46; color: white; border: none; border-radius: 30px; cursor: pointer; }
        .locked-content { text-align: center; padding: 48px; }
        .lock-icon { font-size: 64px; margin-bottom: 16px; }
        .btn-enroll { padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 16px; }
        .resources-list { display: flex; flex-direction: column; gap: 12px; }
        .resource-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 16px; transition: all 0.2s; }
        .resource-item:hover { background: #f1f5f9; }
        .resource-number { width: 32px; height: 32px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .resource-icon { font-size: 28px; }
        .resource-info { flex: 1; }
        .resource-info h4 { font-size: 16px; margin-bottom: 4px; }
        .resource-type { font-size: 11px; color: #64748b; }
        .resource-link { padding: 6px 16px; background: #667eea; color: white; text-decoration: none; border-radius: 30px; font-size: 13px; }
        .reviews-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; margin-bottom: 24px; }
        .rating-summary { display: flex; align-items: center; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
        .big-rating { font-size: 32px; font-weight: 700; color: #f5b042; }
        .stars-large { font-size: 18px; letter-spacing: 2px; }
        .btn-write-review { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 30px; cursor: pointer; }
        .review-form-card { background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px; }
        .rating-select { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .rating-option { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: white; border-radius: 30px; cursor: pointer; border: 1px solid #e2e8f0; }
        .rating-option.selected { background: #667eea; color: white; border-color: #667eea; }
        .review-form-card textarea { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; }
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .btn-cancel { padding: 8px 20px; background: #f1f5f9; color: #64748b; border: none; border-radius: 30px; cursor: pointer; }
        .btn-submit { padding: 8px 20px; background: #667eea; color: white; border: none; border-radius: 30px; cursor: pointer; }
        .reviews-list { display: flex; flex-direction: column; gap: 24px; }
        .review-item { padding-bottom: 24px; border-bottom: 1px solid #e2e8f0; }
        .review-author { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .author-avatar { width: 44px; height: 44px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
        .author-info strong { display: block; font-size: 14px; }
        .author-info span { font-size: 11px; color: #94a3b8; }
        .review-rating { font-size: 14px; margin-bottom: 8px; }
        .review-comment { color: #475569; line-height: 1.5; }
        .empty-resources, .no-reviews { text-align: center; padding: 48px; color: #64748b; }
      `}</style>
    </div>
  );
}

export default TrainingDetailPage;