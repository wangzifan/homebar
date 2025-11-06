import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const MOOD_OPTIONS = [
  {
    id: 'lazy',
    label: 'Lazy Night',
    icon: '😴',
    description: 'Ready to drink - whiskey, sake, wine, beer',
  },
  {
    id: 'sparkling',
    label: 'Sparkling',
    icon: '✨',
    description: 'Drinks with tonic, soda, or sparkling wine',
  },
  {
    id: 'warm',
    label: 'Warm & Cozy',
    icon: '🔥',
    description: 'Hot drinks - Irish coffee, toddy, mulled wine',
  },
  {
    id: 'light',
    label: 'Light & Easy',
    icon: '🌸',
    description: 'Low calorie with tonic, soda, or beer',
  },
  {
    id: 'strong',
    label: 'Strong & Bold',
    icon: '💪',
    description: 'High ABV drinks (>20%)',
  },
  {
    id: 'sweet',
    label: 'Sweet Tooth',
    icon: '🍭',
    description: 'With juice or sweet liqueurs',
  },
  {
    id: 'sour',
    label: 'Sour & Tart',
    icon: '🍋',
    description: 'Citrus-forward cocktails',
  },
  {
    id: 'surprise-me',
    label: 'Surprise Me!',
    icon: '🎲',
    description: 'Get a random drink recommendation',
  },
];

function Welcome() {
  const navigate = useNavigate();

  const handleMoodClick = (moodId) => {
    // Immediately navigate to recommendations with the selected mood
    navigate('/recommendations', { state: { moods: [moodId] } });
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1 className="welcome-title">Zifan's Home Bar</h1>
      </div>

      <div className="mood-grid">
        {MOOD_OPTIONS.map((mood) => (
          <div
            key={mood.id}
            className="mood-card"
            onClick={() => handleMoodClick(mood.id)}
          >
            <div className="mood-icon">{mood.icon}</div>
            <h3 className="mood-label">{mood.label}</h3>
            <p className="mood-description">{mood.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Welcome;
