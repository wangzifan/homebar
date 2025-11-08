import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const MOOD_OPTIONS = [
  {
    id: 'sparkling',
    label: 'Sparkling',
    icon: '🥂',
  },
  {
    id: 'warm',
    label: 'Warm & Cozy',
    icon: '☕',
  },
  {
    id: 'light',
    label: 'Light & Easy',
    icon: '🌿',
  },
  {
    id: 'strong',
    label: 'Strong & Bold',
    icon: '🥃',
  },
  {
    id: 'sweet-sour',
    label: 'Sweet & Sour',
    icon: '🍹',
  },
];

const LIQUOR_OPTIONS = [
  {
    id: 'rum',
    label: 'Rum',
    icon: '🏝️',
  },
  {
    id: 'gin',
    label: 'Gin',
    icon: '🌿',
  },
  {
    id: 'vodka',
    label: 'Vodka',
    icon: '❄️',
  },
  {
    id: 'tequila',
    label: 'Tequila',
    icon: '🌵',
  },
  {
    id: 'brandy',
    label: 'Brandy',
    icon: '🍇',
  },
  {
    id: 'whiskey',
    label: 'Whiskey',
    icon: '🥃',
  },
];

const QUICK_OPTIONS = [
  {
    id: 'surprise-me',
    label: 'Surprise Me',
    icon: '🎲',
  },
  {
    id: 'lazy',
    label: 'Ready to Drink',
    icon: '🍺',
  },
];

function Welcome() {
  const navigate = useNavigate();

  const handleOptionClick = (optionId) => {
    // Navigate to recommendations with the selected option
    navigate('/recommendations', { state: { moods: [optionId] } });
  };

  return (
    <div className="welcome-container">
      <div className="section">
        <h2 className="section-subtitle">By Mood</h2>
        <div className="options-row">
          {MOOD_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="option-item"
              onClick={() => handleOptionClick(option.id)}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-label">{option.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-subtitle">By Base Liquor</h2>
        <div className="options-row">
          {LIQUOR_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="option-item"
              onClick={() => handleOptionClick(option.id)}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-label">{option.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-subtitle">Can't Decide?</h2>
        <div className="options-row quick-options">
          {QUICK_OPTIONS.map((option) => (
            <div
              key={option.id}
              className="option-item"
              onClick={() => handleOptionClick(option.id)}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-label">{option.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Welcome;
