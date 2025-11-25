import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginModal, ChangePasswordModal } from './components/AuthModals';
import Welcome from './pages/Welcome';
import Recommendations from './pages/Recommendations';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import './App.css';

function NavBar() {
  const { isAuthenticated, logout, openLoginModal, openChangePasswordModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          BAR BY ZIFAN
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              🏠 HOME
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/inventory" className="nav-link">
              📦 INVENTORY
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/recipes" className="nav-link">
              📖 RECIPES
            </Link>
          </li>
          <li className="nav-item nav-auth">
            {isAuthenticated ? (
              <div className={`auth-dropdown ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                <button
                  className="nav-link auth-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  👤 OWNER ▾
                </button>
                <div className="auth-dropdown-menu">
                  <button onClick={() => { openChangePasswordModal(); setDropdownOpen(false); }} className="dropdown-item">
                    🔑 Change Password
                  </button>
                  <button onClick={() => { logout(); setDropdownOpen(false); }} className="dropdown-item">
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={openLoginModal} className="nav-link auth-button">
                🔒 LOGIN
              </button>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <NavBar />
          <LoginModal />
          <ChangePasswordModal />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </main>

        <footer className="footer">
        </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
