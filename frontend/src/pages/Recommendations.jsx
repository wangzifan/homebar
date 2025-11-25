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
  const [showAll, setShowAll] = useState(false);
  const [moods, setMoods] = useState([]);
  const [mobileModalItem, setMobileModalItem] = useState(null);
  const [mobileModalFlipped, setMobileModalFlipped] = useState(false);

  useEffect(() => {
    // Scroll to top when page loads (with smooth behavior)
    window.scrollTo({ top: 0, behavior: 'instant' });

    const initialMoods = location.state?.moods || [];
    if (initialMoods.length === 0) {
      navigate('/');
      return;
    }

    setMoods(initialMoods);
    fetchRecommendations(initialMoods, false);
  }, []);

  const preloadImages = (imageUrls) => {
    return Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block loading
          img.src = url;
        });
      })
    );
  };

  const fetchRecommendations = async (moodsToUse, fetchAll = false) => {
    try {
      // Use provided moods or fall back to state
      const targetMoods = moodsToUse || moods;

      if (!targetMoods || targetMoods.length === 0) {
        setError('No moods selected. Please go back and select your preferences.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Check if mobile (width <= 768px)
      const isMobile = window.innerWidth <= 768;
      const response = await recommendationsApi.get(targetMoods, fetchAll, isMobile ? 4 : 3);
      const data = response.data;

      // Collect all image URLs to preload
      const imageUrls = [];
      if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach((rec) => {
          if (rec.imageUrl) imageUrls.push(rec.imageUrl);
        });
      }

      // For lazy mode, check organized data
      if (data.organizedByType) {
        Object.values(data.organizedByType).forEach((items) => {
          if (Array.isArray(items)) {
            items.forEach((item) => {
              if (item.imageUrl) imageUrls.push(item.imageUrl);
            });
          }
        });
      }

      // Preload all images before showing content
      await preloadImages(imageUrls);

      setRecommendations(data.recommendations || []);
      setIsLazyMode(data.isLazyMode || false);
      setIsInventoryMode(data.isInventoryMode || false);
      setIsSurpriseMode(data.isSurpriseMode || false);
      setOrganizedByType(data.organizedByType || null);
      setMessage(data.message || null);
      setShowAll(fetchAll);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = () => {
    fetchRecommendations(moods, true);
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

  // Mobile thumbnail view
  const renderMobileThumbnail = (rec, index) => {
    return (
      <div
        key={rec.recipeId}
        className="mobile-thumbnail"
        onClick={() => {
          setMobileModalItem(rec);
          setMobileModalFlipped(false);
        }}
      >
        {rec.imageUrl && (
          <img src={rec.imageUrl} alt={rec.name} onError={(e) => e.target.style.display = 'none'} />
        )}
        <div className="mobile-thumbnail-name">{rec.name}</div>
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
            {rec.description && <p className="drink-description">{rec.description}</p>}

            {/* Metadata */}
            <div className="drink-details-compact">
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
          </div>
        </div>
      </div>
    );
  };

  // Mobile modal component
  const renderMobileModal = () => {
    if (!mobileModalItem) return null;

    return (
      <div className="mobile-modal-overlay" onClick={() => setMobileModalItem(null)}>
        <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-modal-header">
            <span className="mobile-modal-hint">👇 Tap to view ingredients</span>
            <button className="mobile-modal-close" onClick={(e) => { e.stopPropagation(); setMobileModalItem(null); }}>✕</button>
          </div>

          <div
            className={`mobile-modal-card ${mobileModalFlipped ? 'flipped' : ''}`}
            onClick={() => setMobileModalFlipped(!mobileModalFlipped)}
          >
            <div className="mobile-modal-inner">
              {/* Front */}
              <div className="mobile-modal-front">
                {mobileModalItem.imageUrl && (
                  <div className="mobile-modal-image">
                    <img src={mobileModalItem.imageUrl} alt={mobileModalItem.name} />
                  </div>
                )}
                <div className="mobile-modal-title-overlay">
                  <h2>{mobileModalItem.name}</h2>
                </div>
              </div>

              {/* Back */}
              <div className="mobile-modal-back">
                {mobileModalItem.description && <p className="drink-description">{mobileModalItem.description}</p>}

                <div className="drink-details-compact">
                  {mobileModalItem.abv && <span className="detail-badge">ABV: {mobileModalItem.abv}%</span>}
                  {mobileModalItem.glassType && <span className="detail-badge">Glass: {mobileModalItem.glassType}</span>}
                </div>

                {mobileModalItem.ingredients && mobileModalItem.ingredients.length > 0 && (
                  <div className="ingredients-section">
                    <h3>Ingredients</h3>
                    <ul className="ingredients-list">
                      {mobileModalItem.ingredients.map((ing, idx) => {
                        const isAvailable = mobileModalItem.availableIngredients?.includes(ing.name);
                        const isMissing = mobileModalItem.missingIngredients?.includes(ing.name);
                        return (
                          <li key={idx} className={`ingredient-item ${isAvailable ? 'available' : isMissing ? 'missing' : ''}`}>
                            <span className="ingredient-icon">{isAvailable ? '✓' : isMissing ? '✗' : '?'}</span>
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

                {mobileModalItem.instructions && mobileModalItem.instructions.length > 0 && (
                  <div className="instructions-section">
                    <h3>Instructions</h3>
                    <ol className="instructions-list">
                      {mobileModalItem.instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {mobileModalItem.garnish && (
                  <div className="garnish-section">
                    <strong>Garnish:</strong> {mobileModalItem.garnish}
                  </div>
                )}

                {mobileModalItem.missingIngredients && mobileModalItem.missingIngredients.length > 0 && (
                  <div className="missing-alert">
                    <strong>Missing:</strong> {mobileModalItem.missingIngredients.join(', ')}
                  </div>
                )}
              </div>
            </div>
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
          <button className="btn-primary" onClick={() => fetchRecommendations(moods, false)}>
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
      {renderMobileModal()}

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
            Start Over
          </button>
        </div>
      ) : isLazyMode && organizedByType ? (
        // Lazy mode: Show all options organized by type
        <div className="lazy-mode-container">
          {organizedByType.whiskeys && organizedByType.whiskeys.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🥃 Whiskeys ({organizedByType.whiskeys.length})</h2>
              {/* Mobile thumbnails grid */}
              <div className="mobile-thumbnails-grid">
                {organizedByType.whiskeys.map((item, idx) => renderMobileThumbnail(item, idx))}
              </div>
              {/* Desktop full cards */}
              <div className="recommendations-grid desktop-only">
                {organizedByType.whiskeys.map((item, idx) =>
                  isInventoryMode ? renderInventoryCard(item, idx) : renderDrinkCard(item, idx, false)
                )}
              </div>
            </div>
          )}

          {organizedByType.sake && organizedByType.sake.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🍶 Sake ({organizedByType.sake.length})</h2>
              <div className="mobile-thumbnails-grid">
                {organizedByType.sake.map((item, idx) => renderMobileThumbnail(item, idx))}
              </div>
              <div className="recommendations-grid desktop-only">
                {organizedByType.sake.map((item, idx) =>
                  isInventoryMode ? renderInventoryCard(item, idx) : renderDrinkCard(item, idx, false)
                )}
              </div>
            </div>
          )}

          {organizedByType.wines && organizedByType.wines.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🍷 Wines ({organizedByType.wines.length})</h2>
              <div className="mobile-thumbnails-grid">
                {organizedByType.wines.map((item, idx) => renderMobileThumbnail(item, idx))}
              </div>
              <div className="recommendations-grid desktop-only">
                {organizedByType.wines.map((item, idx) =>
                  isInventoryMode ? renderInventoryCard(item, idx) : renderDrinkCard(item, idx, false)
                )}
              </div>
            </div>
          )}

          {organizedByType.beers && organizedByType.beers.length > 0 && (
            <div className="drink-category-section">
              <h2 className="category-header">🍺 Beers ({organizedByType.beers.length})</h2>
              <div className="mobile-thumbnails-grid">
                {organizedByType.beers.map((item, idx) => renderMobileThumbnail(item, idx))}
              </div>
              <div className="recommendations-grid desktop-only">
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
        <>
          <div className="hint-text desktop-only">
            💡 Click anywhere on the card to flip and review ingredients
          </div>
          <div className="hint-text mobile-only">
            💡 Tap any drink to view details
          </div>
          {/* Mobile thumbnails grid */}
          <div className="mobile-thumbnails-grid">
            {recommendations.map((rec, index) => renderMobileThumbnail(rec, index))}
          </div>
          {/* Desktop full cards */}
          <div className="recommendations-grid desktop-only">
            {recommendations.map((rec, index) => renderDrinkCard(rec, index, !isSurpriseMode))}
          </div>
        </>
      )}

      <div className="recommendations-actions">
        <button className="btn-secondary" onClick={handleBackToHome}>
          Start Over
        </button>
        {isSurpriseMode && (
          <button className="btn-primary" onClick={() => fetchRecommendations(moods, false)}>
            🎲 Surprise Me Again!
          </button>
        )}
        {!isSurpriseMode && !isLazyMode && !showAll && recommendations.length > 0 && (
          <button className="btn-primary" onClick={handleShowAll}>
            All Options
          </button>
        )}
        {!isSurpriseMode && !isLazyMode && showAll && (
          <button className="btn-secondary" onClick={() => fetchRecommendations(moods, false)}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
