import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav.jsx';
import './ProfilePage.css';

function ProfilePage({ onLogout }) {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/friend-requests').then(r => r.json())
    ])
      .then(([userData, requestsData]) => {
        setUser(userData);
        setRequests(requestsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch user data:', err);
        setLoading(false);
      });
  }, []);

  const handleAcceptRequest = (requestId) => {
    setRequests(requests.filter(r => r.id !== requestId));
    console.log('친구 요청 수락:', requestId);
  };

  const handleDeclineRequest = (requestId) => {
    setRequests(requests.filter(r => r.id !== requestId));
    console.log('친구 요청 거절:', requestId);
  };

  const handleLogout = () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">로딩 중...</div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>친구</h1>
        <button className="settings-btn">⚙️</button>
      </header>

      <div className="profile-card">
        <div className="profile-avatar">{user?.avatar || '👤'}</div>
        <div className="profile-info">
          <h2 className="profile-name">{user?.name || '사용자'}</h2>
          <p className="profile-email">{user?.email || 'user@university.ac.kr'}</p>
          <p className="profile-status">{user?.status || '캠퍼스에서 만나요'}</p>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-label">친구</span>
          <span className="stat-num">{user?.friends || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">요청</span>
          <span className="stat-num" style={{ color: user?.friendRequests > 0 ? '#ff5252' : '#999' }}>
            {user?.friendRequests || 0}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">온라인</span>
          <span className="stat-num">{user?.onlineFriends || 0}</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === '전체' ? 'active' : ''}`}
          onClick={() => setActiveTab('전체')}
        >
          전체
        </button>
        <button 
          className={`tab ${activeTab === '요청' ? 'active' : ''}`}
          onClick={() => setActiveTab('요청')}
        >
          요청
        </button>
        <button 
          className={`tab ${activeTab === '차단' ? 'active' : ''}`}
          onClick={() => setActiveTab('차단')}
        >
          차단
        </button>
      </div>

      <div className="profile-content">
        {activeTab === '전체' && (
          <div className="friends-preview">
            <div className="empty-state">친구를 표시할 친구가 없습니다</div>
          </div>
        )}
        {activeTab === '요청' && (
          <div className="requests-preview">
            {requests.length === 0 ? (
              <div className="empty-state">친구 요청이 없습니다</div>
            ) : (
              requests.map(request => (
                <div key={request.id} className="request-item">
                  <div className="request-avatar">{request.avatar}</div>
                  <div className="request-info">
                    <h3>{request.name}</h3>
                    <p>{request.status}</p>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="accept-btn"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      수락
                    </button>
                    <button 
                      className="decline-btn"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === '차단' && (
          <div className="blocked-preview">
            <div className="empty-state">차단한 사용자가 없습니다</div>
          </div>
        )}
      </div>

      <div className="logout-section">
        <button onClick={handleLogout} className="logout-btn">로그아웃</button>
      </div>

      <BottomNav />
    </div>
  );
}

export default ProfilePage;