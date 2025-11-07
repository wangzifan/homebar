import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_PASSWORD = 'Issaquah@557';
const STORAGE_KEY = 'homebar_password';
const AUTH_KEY = 'homebar_auth';

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem(AUTH_KEY);
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Set default password if not exists
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, DEFAULT_PASSWORD);
    }
  }, []);

  const login = (password) => {
    const storedPassword = localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
    if (password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const changePassword = (currentPassword, newPassword) => {
    const storedPassword = localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
    if (currentPassword === storedPassword) {
      localStorage.setItem(STORAGE_KEY, newPassword);
      setShowChangePasswordModal(false);
      return true;
    }
    return false;
  };

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);
  const openChangePasswordModal = () => setShowChangePasswordModal(true);
  const closeChangePasswordModal = () => setShowChangePasswordModal(false);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        changePassword,
        showLoginModal,
        showChangePasswordModal,
        openLoginModal,
        closeLoginModal,
        openChangePasswordModal,
        closeChangePasswordModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
