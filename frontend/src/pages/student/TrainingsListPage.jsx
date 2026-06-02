// src/pages/student/TrainingsListPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPublishedTrainings,
  getMyEnrollments,
  getTrainingReviews,
  enrollFreeTraining,
  addReview,
} from "../../services/trainingApi";
import "./StudentStyles.css";

function TrainingsListPage() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [enrolledTrainings, setEnrolledTrainings] = useState([]);
  const [reviewsData, setReviewsData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTrainings();
    fetchEnrolledTrainings();
  }, []);

  useEffect(() => {
    filterTrainings();
  }, [searchTerm, selectedType, trainings]);

  const fetchTrainings = async () => {
    try {
      const response = await getPublishedTrainings();
      setTrainings(response.data);
      setFilteredTrainings(response.data);

      for (const training of response.data) {
        await fetchReviewsForTraining(training.id);
      }
    } catch (error) {
      console.error("Erreur chargement formations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsForTraining = async (trainingId) => {
    try {
      const res = await getTrainingReviews(trainingId);
      const avg =
        res.data.length > 0
          ? res.data.reduce((sum, r) => sum + r.rating, 0) / res.data.length
          : 0;
      setReviewsData((prev) => ({
        ...prev,
        [trainingId]: {
          reviews: res.data,
          averageRating: avg,
          totalReviews: res.data.length,
        },
      }));
    } catch (err) {
      console.error("Erreur chargement avis:", err);
    }
  };

  const fetchEnrolledTrainings = async () => {
    try {
      const response = await getMyEnrollments();
      setEnrolledTrainings(response.data.map((t) => t.id));
    } catch (error) {
      console.error("Erreur chargement inscriptions:", error);
    }
  };

  const filterTrainings = () => {
    let filtered = [...trainings];
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedType !== "ALL") {
      filtered = filtered.filter((t) => t.type === selectedType);
    }
    setFilteredTrainings(filtered);
  };

  const handleEnroll = async (training) => {
    if (training.type === "PAID") {
      navigate(`/trainings/${training.id}`);
      return;
    }
    if (!window.confirm("Voulez-vous vous inscrire à cette formation ?")) return;
    try {
      await enrollFreeTraining(training.id);
      await fetchEnrolledTrainings();
      alert("✅ Inscription réussie ! Vous pouvez maintenant donner votre avis.");
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.message || err.message));
    }
  };

  const openReviewModal = (training) => {
    setSelectedTraining(training);
    setReviewForm({ rating: 5, comment: "" });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(selectedTraining.id, reviewForm);
      await fetchReviewsForTraining(selectedTraining.id);
      setShowReviewModal(false);
      alert("⭐ Merci pour votre avis !");
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const getStars = (rating) => {
    if (!rating || rating === 0) return "⭐ Nouveau";
    const fullStars = "⭐".repeat(Math.floor(rating));
    const emptyStars = "☆".repeat(5 - Math.floor(rating));
    return fullStars + emptyStars;
  };

  const getRatingDisplay = (rating) => {
    if (!rating || rating === 0) return "Pas encore de note";
    return `${rating.toFixed(1)} / 5`;
  };

  const isEnrolled = (trainingId) => enrolledTrainings.includes(trainingId);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des formations...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="hero-student">
        <h2>📚 Formations disponibles</h2>
        <p>Découvrez des formations de qualité créées par nos mentors experts</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Rechercher une formation par titre ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedType === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedType("ALL")}
          >
            Toutes
          </button>
          <button
            className={`filter-btn ${selectedType === "FREE" ? "active" : ""}`}
            onClick={() => setSelectedType("FREE")}
          >
            🎁 Gratuites
          </button>
          <button
            className={`filter-btn ${selectedType === "PAID" ? "active" : ""}`}
            onClick={() => setSelectedType("PAID")}
          >
            💰 Payantes
          </button>
        </div>
      </div>

      <div className="trainings-student-container">
        <div className="results-info">
          <span>{filteredTrainings.length} formation(s) trouvée(s)</span>
          {searchTerm && (
            <span className="search-term">Recherche : "{searchTerm}"</span>
          )}
        </div>

        {filteredTrainings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Aucune formation trouvée</h3>
            <p>Essayez de modifier votre recherche ou consultez toutes les formations</p>
            <button
              className="btn-primary"
              onClick={() => {
                setSearchTerm("");
                setSelectedType("ALL");
              }}
            >
              Voir toutes les formations
            </button>
          </div>
        ) : (
          <div className="trainings-student-grid">
            {filteredTrainings.map((training) => {
              const reviewInfo = reviewsData[training.id] || {
                averageRating: 0,
                totalReviews: 0,
              };
              const enrolled = isEnrolled(training.id);

              return (
                <div key={training.id} className="training-student-card">
                  <div
                    className="card-image"
                    onClick={() => navigate(`/trainings/${training.id}`)}
                  >
                    {training.thumbnailUrl ? (
                      <img src={training.thumbnailUrl} alt={training.title} />
                    ) : (
                      <div className="image-placeholder">🎓</div>
                    )}
                    <div className="card-badge">
                      {training.type === "FREE" ? "🎁 Gratuite" : "💰 Payante"}
                    </div>
                    {enrolled && <div className="enrolled-badge">✅ Inscrit</div>}
                  </div>
                  <div className="card-content">
                    <h3 onClick={() => navigate(`/trainings/${training.id}`)}>
                      {training.title}
                    </h3>
                    <p>{training.description?.substring(0, 100)}...</p>
                    <div className="card-meta">
                      <span>⏱️ {training.duration}h</span>
                      <span>👥 {training.enrolledCount || 0} inscrits</span>
                      <div className="rating">
                        <span className="stars">
                          {getStars(reviewInfo.averageRating)}
                        </span>
                        <span className="rating-text">
                          {getRatingDisplay(reviewInfo.averageRating)}
                        </span>
                        <span className="review-count">
                          ({reviewInfo.totalReviews} avis)
                        </span>
                      </div>
                    </div>
                    <div className="card-actions">
                      {!enrolled ? (
                        <button
                          className="btn-enroll"
                          onClick={() => handleEnroll(training)}
                        >
                          📝 S'inscrire
                        </button>
                      ) : (
                        <button
                          className="btn-review"
                          onClick={() => openReviewModal(training)}
                        >
                          ⭐ Donner mon avis
                        </button>
                      )}
                      <button
                        className="btn-detail"
                        onClick={() => navigate(`/trainings/${training.id}`)}
                      >
                        Voir détails →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal pour donner un avis */}
      {showReviewModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⭐ Donner mon avis</h3>
              <button
                className="close-modal"
                onClick={() => setShowReviewModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <h4>{selectedTraining?.title}</h4>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label>Votre note</label>
                  <div className="rating-select">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <label key={r} className="rating-option">
                        <input
                          type="radio"
                          name="rating"
                          value={r}
                          checked={reviewForm.rating === r}
                          onChange={() =>
                            setReviewForm({ ...reviewForm, rating: r })
                          }
                        />
                        <span>{r} ⭐</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Votre commentaire</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    rows="5"
                    placeholder="Partagez votre expérience avec cette formation..."
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? "Envoi..." : "Publier mon avis"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainingsListPage;