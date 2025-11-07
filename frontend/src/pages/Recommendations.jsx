import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recommendationsApi } from '../services';
import './Recommendations.css';

function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [organizedByType, setOrganizedByType] = useState(null);
  const [isLazyMode, setIsLazyMode] = useState(false);
  const [isInventoryMode, setIsInventoryMode] = useState(false);
  const [isSurpriseMode, setIsSurpriseMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);

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
      const data = response.data;

      setRecommendations(data.recommendations || []);
      setIsLazyMode(data.isLazyMode || false);
      setIsInventoryMode(data.isInventoryMode || false);
      setIsSurpriseMode(data.isSurpriseMode || false);
      setOrganizedByType(data.organizedByType || null);
      setMessage(data.message || null);
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

  // Render inventory item (for lazy mode)
  const renderInventoryCard = (item, index) => {
    const isExpanded = expandedCardId === item.itemId;
    const cardId = item.itemId;

    return (
      <div
        key={cardId}
        className={`recommendation-card inventory-card ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={() => setExpandedCardId(isExpanded ? null : cardId)}
      >
        <h2 className="drink-name">{item.name}</h2>
        {item.brand && <p className="drink-brand">{item.brand}</p>}

        {/* Expanded content */}
        {isExpanded && (
          <div className="expanded-content">
            <div className="drink-details">
              <div className="detail-item">
                <span className="detail-label">Quantity:</span>
                <span>{item.quantity} {item.unit}</span>
              </div>
              {item.category && (
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span>{item.category}</span>
                </div>
              )}
              {item.expirationDate && (
                <div className="detail-item">
                  <span className="detail-label">Expires:</span>
                  <span>{item.expirationDate}</span>
                </div>
              )}
              {item.purchaseDate && (
                <div className="detail-item">
                  <span className="detail-label">Purchased:</span>
                  <span>{item.purchaseDate}</span>
                </div>
              )}
            </div>
            {item.notes && (
              <div className="notes-section">
                <strong>Notes:</strong>
                <p><em>{item.notes}</em></p>
              </div>
            )}
          </div>
        )}

        {isExpanded && (
          <div className="expand-hint">
            ▲ Click to collapse
          </div>
        )}
      </div>
    );
  };

  const renderDrinkCard = (rec, index, showRank = true) => {
    const isFlipped = expandedCardId === rec.recipeId;
    const cardId = rec.recipeId;

    return (
      <div
        key={cardId}
        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setExpandedCardId(isFlipped ? null : cardId)}
      >
        <div className="flip-card-inner">
          {/* Front side - Image and name */}
          <div className="flip-card-front">
            {rec.imageUrl && (
              <div className="card-image-full">
                <img src={rec.imageUrl} alt={rec.name} onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
            <div className="card-title-overlay">
              <h2 className="drink-name-flip">
                {rec.name}
              </h2>
            </div>
          </div>

          {/* Back side - Details */}
          <div className="flip-card-back">
            <h2 className="drink-name-back">
              {rec.name}
            </h2>

            {rec.description && <p className="drink-description">{rec.description}</p>}

            {/* Metadata */}
            <div className="drink-details-compact">
              {rec.category && <span className="detail-badge">Category: {rec.category}</span>}
              {rec.abv && <span className="detail-badge">ABV: {rec.abv}%</span>}
              {rec.glassType && <span className="detail-badge">Glass: {rec.glassType}</span>}
            </div>

            {/* Ingredients */}
            {rec.ingredients && rec.ingredients.length > 0 && (
              <div className="ingredients-section">
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                  {rec.ingredients.map((ing, idx) => {
                    const isAvailable = rec.availableIngredients?.includes(ing.name);
                    const isMissing = rec.missingIngredients?.includes(ing.name);

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
            )}

            {/* Instructions */}
            {rec.instructions && rec.instructions.length > 0 && (
              <div className="instructions-section">
                <h3>Instructions</h3>
                <ol className="instructions-list">
                  {rec.instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}

            {rec.garnish && (
              <div className="garnish-section">
                <strong>Garnish:</strong> {rec.garnish}
              </div>
            )}

            {rec.missingIngredients && rec.missingIngredients.length > 0 && (
              <div className="missing-alert">
                <strong>Missing:</strong> {rec.missingIngredients.join(', ')}
              </div>
            )}

            <div className="flip-hint">Click to flip back</div>
          </div>
        </div>
      </div>
    );
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
      {message && (
        <div className="info-message">
          <p>{message}</p>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <h2>No matches found</h2>
          <p>We couldn't find any drinks matching your preferences with your current inventory.</p>
          <p>Try selecting different moods or update your inventory.</p>
          <button className="btn-primary" onClick={handleBackToHome}>
            Try Different Moods
          </button>
        </div>
      ) : isLazyMode && organizedByType ? (
        // Lazy mode: Show all options organized by type
        <div className="lazy-mode-container">
          {organizedByType.whiskeys && organizedByType.whiskeys.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🥃 Whiskeys ({organizedByType.whiskeys.length})</h2>
              <div className="recommendations-grid">
                {organizedByType.whiskeys.map((item, idx) =>
                  isInventoryMode ? renderInventoryCard(item, idx) : renderDrinkCard(item, idx, false)
                )}
              </div>
            </div>
          )}

          {organizedByType.sake && organizedByType.sake.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🍶 Sake ({organizedByType.sake.length})</h2>
              <div className="recommendations-grid">
                {organizedByType.sake.map((item, idx) =>
                  isInventoryMode ? renderInventoryCard(item, idx) : renderDrinkCard(item, idx, false)
                )}
              </div>
            </div>
          )}

          {organizedByType.wines && organizedByType.wines.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🍷 Wines ({organizedByType.wines.length})</h2>
              <div className="recommendations-grid">
                {organizedByType.wines.map((item, idx) =>
                  isInventoryMode ? renderInventoryCard(item, idx) : renderDrinkCard(item, idx, false)
                )}
              </div>
            </div>
          )}

          {organizedByType.beers && organizedByType.beers.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🍺 Beers ({organizedByType.beers.length})</h2>
              <div className="recommendations-grid">
                {organizedByType.beers.map((item, idx) =>
                  isInventoryMode ? renderInventoryCard(item, idx) : renderDrinkCard(item, idx, false)
                )}
              </div>
            </div>
          )}

          {(!organizedByType.whiskeys || organizedByType.whiskeys.length === 0) &&
           (!organizedByType.sake || organizedByType.sake.length === 0) &&
           (!organizedByType.wines || organizedByType.wines.length === 0) &&
           (!organizedByType.beers || organizedByType.beers.length === 0) && (
            <div className="no-recommendations">
              <p>No ready-to-drink options found in your inventory. Add some whiskey, sake, wine, or beer!</p>
            </div>
          )}
        </div>
      ) : (
        // Normal mode or surprise mode: Show regular recommendations
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => renderDrinkCard(rec, index, !isSurpriseMode))}
        </div>
      )}

      <div className="recommendations-actions">
        <button className="btn-secondary" onClick={handleBackToHome}>
          Try Different Moods
        </button>
        <button className="btn-primary" onClick={() => navigate('/inventory')}>
          Update Inventory
        </button>
        {isSurpriseMode && (
          <button className="btn-primary" onClick={fetchRecommendations}>
            🎲 Surprise Me Again!
          </button>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
