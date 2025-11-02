import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recommendationsApi } from '../services';
import './Recommendations.css';

function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const moods = location.state?.moods || [];

  useEffect(() => {
    if (moods.length === 0) {
      navigate('/');
      return;
    }

    fetchRecommendations();
  }, [moods]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await recommendationsApi.get(moods);
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Finding your perfect drink...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <div className="error">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchRecommendations}>
            Try Again
          </button>
          <button className="btn-secondary" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <button className="btn-back" onClick={handleBackToHome}>
          ← Change Mood
        </button>
        <h1>Your Top 3 Drink Recommendations</h1>
        <p className="selected-moods">
          Based on your mood: <strong>{moods.join(', ')}</strong>
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <h2>No matches found</h2>
          <p>We couldn't find any drinks matching your preferences with your current inventory.</p>
          <p>Try selecting different moods or update your inventory.</p>
          <button className="btn-primary" onClick={handleBackToHome}>
            Try Different Moods
          </button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div
              key={rec.recipeId}
              className={`recommendation-card ${rec.canMake ? 'can-make' : 'missing-ingredients'}`}
            >
              <div className="card-header">
                <span className="rank-badge">#{index + 1}</span>
                <span className={`status-badge ${rec.canMake ? 'available' : 'unavailable'}`}>
                  {rec.canMake ? '✓ Can Make' : '⚠ Missing Items'}
                </span>
              </div>

              <h2 className="drink-name">{rec.name}</h2>
              <p className="drink-description">{rec.description}</p>

              <div className="drink-details">
                <div className="detail-item">
                  <span className="detail-label">Glass:</span>
                  <span>{rec.glassType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Difficulty:</span>
                  <span className={`difficulty-${rec.difficulty}`}>{rec.difficulty}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time:</span>
                  <span>{rec.preparationTime} min</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Match:</span>
                  <span>{Math.round(rec.matchPercentage)}%</span>
                </div>
              </div>

              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                  {rec.ingredients.map((ing, idx) => {
                    const isAvailable = rec.availableIngredients.includes(ing.name);
                    const isMissing = rec.missingIngredients.includes(ing.name);

                    return (
                      <li
                        key={idx}
                        className={`ingredient-item ${
                          isAvailable ? 'available' : isMissing ? 'missing' : ''
                        }`}
                      >
                        <span className="ingredient-icon">
                          {isAvailable ? '✓' : isMissing ? '✗' : '?'}
                        </span>
                        <span className="ingredient-text">
                          {ing.quantity} {ing.unit} {ing.name}
                          {ing.optional && <em> (optional)</em>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="instructions-section">
                <h3>Instructions</h3>
                <ol className="instructions-list">
                  {rec.instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {rec.garnish && (
                <div className="garnish-section">
                  <strong>Garnish:</strong> {rec.garnish}
                </div>
              )}

              {rec.missingIngredients.length > 0 && (
                <div className="missing-alert">
                  <strong>Missing:</strong> {rec.missingIngredients.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="recommendations-actions">
        <button className="btn-secondary" onClick={handleBackToHome}>
          Try Different Moods
        </button>
        <button className="btn-primary" onClick={() => navigate('/inventory')}>
          Update Inventory
        </button>
      </div>
    </div>
  );
}

export default Recommendations;
