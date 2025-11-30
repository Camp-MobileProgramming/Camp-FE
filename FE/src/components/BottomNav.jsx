import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

function BottomNav() {
  const location = useLocation();
  const activeTab = location.pathname;

  return (
    <nav className="bottom-nav-container">
      <Link to="/" className={`nav-item ${activeTab === '/' ? 'active' : ''}`}>
        <span>🗺️</span>
        <div>캠프맵</div>
      </Link>
      <Link to="/chat" className={`nav-item ${activeTab === '/chat' ? 'active' : ''}`}>
        <span>💬</span>
        <div>채팅</div>
      </Link>
      <Link to="/friends" className={`nav-item ${activeTab === '/friends' ? 'active' : ''}`}>
        <span>👥</span>
        <div>친구</div>
      </Link>
      <Link to="/profile" className={`nav-item ${activeTab === '/profile' ? 'active' : ''}`}>
        <span>👤</span>
        <div>프로필</div>
      </Link>
    </nav>
  );
}

export default BottomNav;