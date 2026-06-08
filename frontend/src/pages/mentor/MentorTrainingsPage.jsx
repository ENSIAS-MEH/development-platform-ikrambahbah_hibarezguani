// src/pages/mentor/MentorTrainingsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  publishTraining,
  getTrainingReviews,
} from "../../services/trainingApi";

function MentorTrainingsPage() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [reviewsData, setReviewsData] = useState({});
  const [selectedTrainingReviews, setSelectedTrainingReviews] = useState([]);
  const [selectedTrainingTitle, setSelectedTrainingTitle] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "FREE",
    duration: "",
    maxStudents: "",
    thumbnailUrl: "",
    price: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "MENTOR") {
      navigate("/profile");
      return;
    }
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await getMyTrainings();
      setTrainings(res.data);
      for (const training of res.data) {
        await fetchReviewsForTraining(training.id);
      }
    } catch (err) {
      console.error("Erreur chargement formations:", err);
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
      setReviewsData((prev) => ({
        ...prev,
        [trainingId]: { reviews: [], averageRating: 0, totalReviews: 0 },
      }));
    }
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  };

  const getStars = (rating) => {
    if (!rating || rating === 0) return "⭐ Nouveau";
    return "⭐".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  };

  const openReviewsModal = (training) => {
    const reviewInfo = reviewsData[training.id] || {
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
    };
    setSelectedTrainingReviews(reviewInfo.reviews);
    setSelectedTrainingTitle(training.title);
    setShowReviewsModal(true);
  };

  const openCreateModal = () => {
    setEditingTraining(null);
    setFormData({
      title: "",
      description: "",
      type: "FREE",
      duration: "",
      maxStudents: "",
      thumbnailUrl: "",
      price: "",
    });
    setShowModal(true);
  };

  const openEditModal = (training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title,
      description: training.description,
      type: training.type,
      duration: training.duration,
      maxStudents: training.maxStudents,
      thumbnailUrl: training.thumbnailUrl || "",
      price: training.price || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        duration: parseInt(formData.duration),
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : null,
        thumbnailUrl: formData.thumbnailUrl,
        price: formData.type === "PAID" && formData.price ? parseFloat(formData.price) : null,
      };
      if (editingTraining) {
        await updateTraining(editingTraining.id, data);
      } else {
        await createTraining(data);
      }
      setShowModal(false);
      fetchTrainings();
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePublish = async (id) => {
    if (!window.confirm("Publier cette formation ?")) return;
    try {
      await publishTraining(id);
      fetchTrainings();
    } catch (err) {
      alert("Erreur lors de la publication");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette formation ?")) return;
    try {
      await deleteTraining(id);
      fetchTrainings();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Chargement...</div>;
  }

  const publishedCount = trainings.filter((t) => t.status === "PUBLISHED").length;
  const draftCount = trainings.filter((t) => t.status === "DRAFT").length;
  const totalStudents = trainings.reduce((sum, t) => sum + (t.enrolledCount || 0), 0);

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "32px 24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Bannière héros */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "24px",
          padding: "48px 40px",
          color: "white",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "12px" }}>
            Bon retour, Mentor 👋
          </h1>
          <p style={{ fontSize: "16px", opacity: 0.9, marginBottom: "24px", maxWidth: "500px" }}>
            Créez des formations de qualité et partagez votre expertise avec la communauté.
          </p>
          <button
            onClick={openCreateModal}
            style={{
              padding: "12px 28px",
              background: "white",
              color: "#667eea",
              border: "none",
              borderRadius: "40px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            + Nouvelle formation
          </button>
        </div>
        <div
          style={{
            position: "absolute",
            right: "-20px",
            bottom: "-20px",
            fontSize: "180px",
            opacity: 0.1,
            zIndex: 1,
          }}
        >
          🎓
        </div>
      </div>

      {/* Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#667eea" }}>{trainings.length}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Total formations</div>
        </div>
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#10b981" }}>{publishedCount}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Formations publiées</div>
        </div>
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#f59e0b" }}>{draftCount}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Brouillons</div>
        </div>
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#8b5cf6" }}>{totalStudents}</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>Étudiants inscrits</div>
        </div>
      </div>

      {/* Liste des formations */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b" }}>📚 Mes formations</h2>
        <button
          onClick={openCreateModal}
          style={{
            padding: "8px 20px",
            background: "white",
            border: "2px solid #667eea",
            color: "#667eea",
            borderRadius: "40px",
            fontWeight: "500",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          + Nouvelle formation
        </button>
      </div>

      {trainings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px",
            background: "white",
            borderRadius: "24px",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📖</div>
          <h3 style={{ marginBottom: "8px" }}>Aucune formation pour le moment</h3>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>Commencez par créer votre première formation</p>
          <button
            onClick={openCreateModal}
            style={{
              padding: "10px 28px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "40px",
              cursor: "pointer",
            }}
          >
            Créer ma première formation
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "24px",
          }}
        >
          {trainings.map((t) => {
            const reviewInfo = reviewsData[t.id] || { averageRating: 0, totalReviews: 0 };
            return (
              <div
                key={t.id}
                style={{
                  background: "white",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  border: "1px solid #f1f5f9",
                  transition: "transform 0.2s",
                }}
              >
                <div
                  style={{
                    height: "140px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    position: "relative",
                  }}
                >
                  {t.thumbnailUrl ? (
                    <img
                      src={t.thumbnailUrl}
                      alt={t.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    "🎓"
                  )}
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: t.status === "PUBLISHED" ? "#d1fae5" : "#fef3c7",
                      color: t.status === "PUBLISHED" ? "#065f46" : "#92400e",
                    }}
                  >
                    {t.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>{t.title}</h3>
                  <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px" }}>
                    {t.description?.substring(0, 80)}...
                  </p>

                  {/* Avis */}
                  <div
                    style={{
                      background: "#fef9e6",
                      padding: "10px",
                      borderRadius: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "18px" }}>{getStars(reviewInfo.averageRating)}</span>
                        <span style={{ fontWeight: "bold", fontSize: "14px", color: "#1e293b" }}>
                          {reviewInfo.averageRating > 0 ? reviewInfo.averageRating.toFixed(1) : "Nouveau"}
                        </span>
                        <span style={{ color: "#64748b", fontSize: "11px" }}>
                          ({reviewInfo.totalReviews} avis)
                        </span>
                      </div>
                      <button
                        onClick={() => openReviewsModal(t)}
                        style={{
                          padding: "4px 10px",
                          background: "#667eea",
                          color: "white",
                          border: "none",
                          borderRadius: "20px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        📋 Voir
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <span>⏱️ {t.duration}h</span>
                    <span>👥 {t.enrolledCount || 0}</span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        background: t.type === "FREE" ? "#d1fae5" : "#fed7aa",
                        color: t.type === "FREE" ? "#065f46" : "#9a3412",
                        fontSize: "10px",
                        fontWeight: "600",
                      }}
                    >
                      {t.type === "FREE"
                        ? "Gratuite"
                        : `Payante${t.price ? ` — ${t.price.toFixed(2)} MAD` : ""}`}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      onClick={() => navigate(`/mentor/trainings/${t.id}/resources`)}
                      style={{
                        padding: "5px 12px",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: "20px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      📁 Ressources
                    </button>
                    <button
                      onClick={() => openEditModal(t)}
                      style={{
                        padding: "5px 12px",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: "20px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Modifier
                    </button>
                    {t.status === "DRAFT" && (
                      <button
                        onClick={() => handlePublish(t.id)}
                        style={{
                          padding: "5px 12px",
                          background: "#d1fae5",
                          color: "#065f46",
                          border: "none",
                          borderRadius: "20px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        🚀 Publier
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{
                        padding: "5px 12px",
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: "20px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal des avis */}
      {showReviewsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowReviewsModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              width: "90%",
              maxWidth: "700px",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f1f5f9",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                borderRadius: "24px 24px 0 0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b" }}>
                  ⭐ Avis des étudiants
                </h2>
                <button
                  onClick={() => setShowReviewsModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#94a3b8",
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>{selectedTrainingTitle}</p>
            </div>
            <div style={{ padding: "24px" }}>
              {selectedTrainingReviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
                  <p style={{ color: "#64748b" }}>Aucun avis pour cette formation pour le moment.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {selectedTrainingReviews.map((review, index) => (
                    <div
                      key={review.id}
                      style={{
                        padding: "20px",
                        background: index % 2 === 0 ? "#f8fafc" : "white",
                        borderRadius: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt=""
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "18px",
                            }}
                          >
                            {review.userFullName?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "15px", color: "#1e293b" }}>
                            {review.userFullName}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {review.formattedDate || new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginBottom: "8px", fontSize: "18px" }}>
                        {"⭐".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                      <p
                        style={{
                          color: "#475569",
                          lineHeight: "1.6",
                          margin: 0,
                          fontSize: "14px",
                        }}
                      >
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création / édition d'une formation */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              width: "90%",
              maxWidth: "520px",
              maxHeight: "85vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1e293b" }}>
                {editingTraining ? "✏️ Modifier" : "➕ Créer"} une formation
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value,
                          price: e.target.value === "FREE" ? "" : formData.price,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                    >
                      <option value="FREE">🎁 Gratuite</option>
                      <option value="PAID">💰 Payante</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Durée (heures)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                    />
                  </div>
                </div>

                {formData.type === "PAID" && (
                  <div style={{ marginBottom: "16px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#334155",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      💳 Prix (MAD) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="Ex: 199.00"
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "2px solid #fed7aa",
                        borderRadius: "12px",
                        background: "#fffbf5",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#9a3412",
                      }}
                    />
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                      Ce prix sera affiché aux étudiants lors de l'inscription.
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Max étudiants
                  </label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Image de couverture
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 24px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "40px",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 28px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "40px",
                    cursor: "pointer",
                  }}
                >
                  {editingTraining ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorTrainingsPage;