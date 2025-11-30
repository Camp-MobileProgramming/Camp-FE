import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotification } from './NotificationContext';
import './BottomNav.css';

function BottomNav() {
  const location = useLocation();
  const activeTab = location.pathname;

  const { counts, settings } = useNotification();

  const showChatBadge = settings.chatAlarm && counts.chat > 0;
  const showCampRequestBadge = settings.campRequestAlarm && counts.campRequest > 0;

  return (
    <nav className="bottom-nav-container">
      <Link to="/" className={`nav-item ${activeTab === '/' ? 'active' : ''}`}>
        <span className="nav-icon">🗺️</span>
        <div>캠프맵</div>
      </Link>

      <Link to="/chat" className={`nav-item ${activeTab === '/chat' ? 'active' : ''}`}>
        <div className="icon-wrapper">
          <span className="nav-icon">💬</span>
          {showChatBadge && (
            <span className="badge">
              {counts.chat > 99 ? '99+' : counts.chat}
            </span>
          )}
        </div>
        <div>채팅</div>
      </Link>

      <Link to="/friends" className={`nav-item ${activeTab === '/friends' ? 'active' : ''}`}>
        <div className="icon-wrapper">
          <span className="nav-icon">👥</span>
          {showCampRequestBadge && <span className="badge">!</span>}
        </div>
        <div>친구</div>
      </Link>

      <Link to="/profile" className={`nav-item ${activeTab === '/profile' ? 'active' : ''}`}>
        <span className="nav-icon">👤</span>
        <div>프로필</div>
      </Link>
    </nav>
  );
}

export default BottomNav;