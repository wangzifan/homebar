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
    const isExpanded = expandedCardId === rec.recipeId;
    const cardId = rec.recipeId;

    return (
      <div
        key={cardId}
        className={`recommendation-card ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <div className="card-layout">
          <div className="card-content" onClick={() => setExpandedCardId(isExpanded ? null : cardId)}>
            <h2 className="drink-name">
              {showRank && <span className="rank-number">#{index + 1}</span>}
              {rec.name}
            </h2>

        {/* Metadata - always visible */}
        <div className="drink-details">
          {rec.category && (
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span>{rec.category}</span>
            </div>
          )}
          {rec.abv && (
            <div className="detail-item">
              <span className="detail-label">ABV:</span>
              <span>{rec.abv}%</span>
            </div>
          )}
          {rec.glassType && (
            <div className="detail-item">
              <span className="detail-label">Glass:</span>
              <span>{rec.glassType}</span>
            </div>
          )}
        </div>

        {/* Main ingredients - always visible (first 3-4) */}
        {rec.ingredients && rec.ingredients.length > 0 && (
          <div className="ingredients-preview">
            <strong>Main Ingredients:</strong>
            <span className="ingredients-list-preview">
              {rec.ingredients.slice(0, 3).map((ing, idx) => (
                <span key={idx}>
                  {ing.name}
                  {idx < 2 && idx < rec.ingredients.length - 1 ? ', ' : ''}
                </span>
              ))}
              {rec.ingredients.length > 3 && ` +${rec.ingredients.length - 3} more`}
            </span>
          </div>
        )}

        {/* Expanded content - shown only when clicked */}
        {isExpanded && (
          <div className="expanded-content">
            {rec.description && <p className="drink-description">{rec.description}</p>}

            {rec.ingredients && rec.ingredients.length > 0 && (
              <div className="ingredients-section">
                <h3>All Ingredients</h3>
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
          </div>
        )}

            <div className="expand-hint">
              {isExpanded ? '▲ Click to collapse' : '▼ Click for details'}
            </div>
          </div>

          {rec.imageUrl && (
            <div className="drink-image">
              <img src={rec.imageUrl} alt={rec.name} onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
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

  const getHeaderTitle = () => {
    if (isSurpriseMode) return 'Surprise! Here\'s Your Random Pick';
    if (isLazyMode) return 'All Available Options for Lazy Night';
    return 'Your Top 3 Drink Recommendations';
  };

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <button className="btn-back" onClick={handleBackToHome}>
          ← Change Mood
        </button>
        <h1>{getHeaderTitle()}</h1>
        <p className="selected-moods">
          Based on your mood: <strong>{moods.join(', ')}</strong>
        </p>
      </div>

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
