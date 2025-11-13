import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MapView from './pages/MapView';
import ChatListPage from './pages/ChatListPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading, true/false = loaded
  
  useEffect(() => {
    // Check token on mount only
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  // Show loading while checking auth state
  if (isLoggedIn === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        초기화 중...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? <MapView /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="/chat"
        element={
          isLoggedIn ? <ChatListPage /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/friends"
        element={
          isLoggedIn ? <FriendsPage /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/profile"
        element={
          isLoggedIn ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? <Navigate to="/" replace /> : <SignupPage />
        }
      />
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;