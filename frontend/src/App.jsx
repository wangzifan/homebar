import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Recommendations from './pages/Recommendations';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🍸 MyHomeBar
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/inventory" className="nav-link">
                  Inventory
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/recipes" className="nav-link">
                  Recipes
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2024 MyHomeBar - Your Personal Bartender</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
