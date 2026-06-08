// src/pages/student/MyLearningsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyEnrollments } from "../../services/trainingApi";
import "./StudentStyles.css";

function MyLearningsPage() {
  const navigate = useNavigate();
  const [enrolledTrainings, setEnrolledTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchEnrolledTrainings();
  }, []);

  const fetchEnrolledTrainings = async () => {
    try {
      const response = await getMyEnrollments();
      setEnrolledTrainings(response.data);
    } catch (error) {
      console.error("Erreur chargement inscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="hero-student">
        <h2>📖 Mes formations</h2>
        <p>Continuez votre apprentissage où vous vous êtes arrêté</p>
      </div>

      <div className="trainings-student-container">
        {enrolledTrainings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Vous n'êtes inscrit à aucune formation</h3>
            <button className="btn-primary" onClick={() => navigate("/trainings")}>
              Découvrir les formations
            </button>
          </div>
        ) : (
          <div className="trainings-student-grid">
            {enrolledTrainings.map((training) => (
              <div
                key={training.id}
                className="training-student-card"
                onClick={() => navigate(`/trainings/${training.id}`)}
              >
                <div className="card-image">
                  {training.thumbnailUrl ? (
                    <img src={training.thumbnailUrl} alt={training.title} />
                  ) : (
                    <div className="image-placeholder">🎓</div>
                  )}
                </div>
                <div className="card-content">
                  <h3>{training.title}</h3>
                  <p>{training.description?.substring(0, 80)}...</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${training.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyLearningsPage;