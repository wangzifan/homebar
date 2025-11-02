import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const MOOD_OPTIONS = [
  {
    id: 'lazy',
    label: 'Lazy Night',
    icon: '😴',
    description: 'No mixing required - just pour and enjoy',
  },
  {
    id: 'sparkling',
    label: 'Sparkling',
    icon: '✨',
    description: 'Bubbly and effervescent drinks',
  },
  {
    id: 'warm',
    label: 'Warm & Cozy',
    icon: '🔥',
    description: 'Hot or warm drinks for comfort',
  },
  {
    id: 'light',
    label: 'Light & Easy',
    icon: '🌸',
    description: 'Low-ABV refreshing options',
  },
  {
    id: 'strong',
    label: 'Strong & Bold',
    icon: '💪',
    description: 'Spirit-forward cocktails',
  },
  {
    id: 'sweet',
    label: 'Sweet Tooth',
    icon: '🍭',
    description: 'Fruity and dessert-like drinks',
  },
  {
    id: 'sour',
    label: 'Sour & Tart',
    icon: '🍋',
    description: 'Citrus-forward cocktails',
  },
  {
    id: 'refreshing',
    label: 'Refreshing',
    icon: '🌊',
    description: 'Crisp and cooling drinks',
  },
];

function Welcome() {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const navigate = useNavigate();

  const toggleMood = (moodId) => {
    setSelectedMoods((prev) => {
      if (prev.includes(moodId)) {
        return prev.filter((id) => id !== moodId);
      } else {
        return [...prev, moodId];
      }
    });
  };

  const handleGetRecommendations = () => {
    if (selectedMoods.length === 0) {
      alert('Please select at least one mood or preference');
      return;
    }

    // Navigate to recommendations page with selected moods
    navigate('/recommendations', { state: { moods: selectedMoods } });
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1 className="welcome-title">Welcome to MyHomeBar</h1>
        <p className="welcome-subtitle">
          What's your mood tonight? Select one or more options to get personalized drink recommendations.
        </p>
      </div>

      <div className="mood-grid">
        {MOOD_OPTIONS.map((mood) => (
          <div
            key={mood.id}
            className={`mood-card ${selectedMoods.includes(mood.id) ? 'selected' : ''}`}
            onClick={() => toggleMood(mood.id)}
          >
            <div className="mood-icon">{mood.icon}</div>
            <h3 className="mood-label">{mood.label}</h3>
            <p className="mood-description">{mood.description}</p>
          </div>
        ))}
      </div>

      <div className="welcome-actions">
        <button
          className="btn-primary"
          onClick={handleGetRecommendations}
          disabled={selectedMoods.length === 0}
        >
          Get My Recommendations ({selectedMoods.length} selected)
        </button>
      </div>
    </div>
  );
}

export default Welcome;
