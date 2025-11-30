import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MapView from './pages/MapView';
import ChatListPage from './pages/ChatListPage';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import SettingPage from './pages/SettingPage';
import ChatRoom from './pages/ChatRoom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return ( 
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn ? <MapView /> : <Navigate to="/login" replace />
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
        path="/profile/:nickname" 
        element={<ProfilePage />} 
      
      />
      <Route
        path="/settings"
        element={
          isLoggedIn ? <SettingPage /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="/signup"
        element={
          isLoggedIn ? <Navigate to="/" replace /> : <SignupPage />
        }
      />

      <Route
        path="/chat/:nickname"
        element={isLoggedIn ? <ChatRoom /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;