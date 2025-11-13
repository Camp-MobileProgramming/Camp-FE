import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav.jsx';
import './FriendsPage.css';

function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/friends').then(r => r.json()),
      fetch('/api/friend-requests').then(r => r.json())
    ])
      .then(([friendsData, requestsData]) => {
        setFriends(friendsData);
        setRequests(requestsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch friends:', err);
        setLoading(false);
      });
  }, []);

  const onlineFriends = friends.filter(f => f.online);

  let displayData = friends;
  if (activeTab === '온라인') displayData = onlineFriends;
  if (activeTab === '요청') displayData = requests;

  // Apply search filter
  displayData = displayData.filter(friend => 
    searchInput === '' || 
    friend.name.includes(searchInput) ||
    friend.status.includes(searchInput)
  );

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  const handleStartChat = (friend) => {
    console.log('채팅 시작:', friend.name);
    alert(`${friend.name}님과의 채팅을 시작합니다.`);
    // TODO: ChatListPage로 이동 또는 새 채팅 생성
  };

  const handleAcceptRequest = (friend) => {
    console.log('친구 요청 수락:', friend.name);
    setRequests(requests.filter(r => r.id !== friend.id));
    setFriends([...friends, friend]);
    alert(`${friend.name}님을 친구로 추가했습니다.`);
  };

  const handleDeclineRequest = (friend) => {
    console.log('친구 요청 거절:', friend.name);
    setRequests(requests.filter(r => r.id !== friend.id));
    alert(`${friend.name}님의 요청을 거절했습니다.`);
  };

  return (
    <div className="friends-page">
      <header className="friends-header">
        <h1>친구</h1>
        <button className="settings-btn">⚙️</button>
      </header>

      <div className="friends-stats">
        <div className="stat">
          <span className="stat-label">전체</span>
          <span className="stat-value">{friends.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">온라인</span>
          <span className="stat-value">{onlineFriends.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">요청</span>
          <span className="stat-value" style={{ color: requests.length > 0 ? '#ff5252' : '#999' }}>
            {requests.length}
          </span>
        </div>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          placeholder="친구 검색" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="friends-tabs">
        <button 
          className={`tab ${activeTab === '전체' ? 'active' : ''}`}
          onClick={() => setActiveTab('전체')}
        >
          전체
        </button>
        <button 
          className={`tab ${activeTab === '온라인' ? 'active' : ''}`}
          onClick={() => setActiveTab('온라인')}
        >
          온라인
        </button>
        <button 
          className={`tab ${activeTab === '요청' ? 'active' : ''}`}
          onClick={() => setActiveTab('요청')}
        >
          요청
        </button>
      </div>

      <div className="friends-list-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : displayData.length === 0 ? (
          <div className="empty">친구가 없습니다</div>
        ) : (
          displayData.map(friend => (
            <div key={friend.id} className="friend-item">
              <div className="friend-avatar" onClick={() => handleFriendClick(friend)}>
                {friend.avatar || '🔵'}
                {friend.online && <span className="online-indicator"></span>}
              </div>
              <div 
                className="friend-info"
                onClick={() => handleFriendClick(friend)}
              >
                <h3 className="friend-name">{friend.name}</h3>
                <p className="friend-status">{friend.status}</p>
              </div>
              {activeTab === '요청' ? (
                <div className="action-buttons">
                  <button 
                    className="accept-btn"
                    onClick={() => handleAcceptRequest(friend)}
                  >
                    수락
                  </button>
                  <button 
                    className="decline-btn"
                    onClick={() => handleDeclineRequest(friend)}
                  >
                    거절
                  </button>
                </div>
              ) : (
                <button 
                  className="chat-btn"
                  onClick={() => handleStartChat(friend)}
                >
                  💬
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Friend Profile Modal */}
      {selectedFriend && (
        <div className="profile-modal-overlay" onClick={() => setSelectedFriend(null)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn" 
              onClick={() => setSelectedFriend(null)}
            >
              ✕
            </button>
            
            <div className="profile-modal-content">
              <div className="profile-avatar-large">
                {selectedFriend.avatar}
                {selectedFriend.online && <span className="online-indicator-large"></span>}
              </div>
              
              <h2 className="profile-name">{selectedFriend.name}</h2>
              <p className="profile-status">{selectedFriend.status}</p>
              
              <div className="profile-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    handleStartChat(selectedFriend);
                    setSelectedFriend(null);
                  }}
                >
                  💬 채팅 시작
                </button>
                <button className="action-btn secondary">
                  📍 위치 보기
                </button>
                <button className="action-btn secondary">
                  🔗 공유
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default FriendsPage;