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

  return (
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
          <li className="nav-item nav-auth">
            {isAuthenticated ? (
              <div className="auth-dropdown">
                <button className="nav-link auth-button">
                  👤 Owner ▾
                </button>
                <div className="auth-dropdown-menu">
                  <button onClick={openChangePasswordModal} className="dropdown-item">
                    🔑 Change Password
                  </button>
                  <button onClick={logout} className="dropdown-item">
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={openLoginModal} className="nav-link auth-button">
                🔒 Login
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
          <p>&copy; 2024 MyHomeBar - Your Personal Bartender</p>
        </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
