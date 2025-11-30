import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './components/NotificationContext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MapView from './pages/MapView';
import ChatListPage from './pages/ChatListPage';
import ChatingPage from './pages/ChatingPage';
import ChatRoom from './pages/ChatRoom';
import FriendsPage from './pages/FriendsPage';
import ProfilePage from './pages/ProfilePage';
import SettingPage from './pages/SettingPage';

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
    <NotificationProvider>
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
          path="/chat/:nickname"
          element={
            isLoggedIn ? <ChatRoom /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/chating-preview"
          element={
            <ChatingPage 
              roomId="preview-room" 
              messages={[
                { id: 1, text: '안녕하세요!', self: false, ts: Date.now() - 5000 },
                { id: 2, text: '반갑습니다!', self: true, ts: Date.now() - 3000 }
              ]} 
              onSend={(payload) => console.log('메시지 전송:', payload)} 
            />
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
      </Routes>
    </NotificationProvider>
  );
}

export default App;