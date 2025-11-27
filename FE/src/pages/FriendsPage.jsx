import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';
import './FriendsPage.css';

function FriendsPage() {
  const [pending, setPending] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
    fetchFriendList();
  }, []);

  // 수락대기 목록조회
  const fetchPendingRequests = async () => {
    try {
      const myNick = localStorage.getItem('nickname');
      const encodedNick = encodeURIComponent(myNick);

      const res = await fetch('/api/friends/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${encodedNick}`
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPending(data || []);
    } catch (err) {
      console.error('fetchPendingRequests error', err);
      setPending([]);
    }
  };

  // 친구 목록 조회
  const fetchFriendList = async () => {
    try {
      const myNick = localStorage.getItem('nickname');
      const encodedNick = encodeURIComponent(myNick);

      const res = await fetch('/api/friends/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${encodedNick}`
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFriends(data || []);
    } catch (err) {
      console.error('fetchFriendList error', err);
      setFriends([]);
    }
  };

  // 친구 요청 수락
  const handleAccept = async (requesterNickname) => {
    if (loading) return;
    setLoading(true);

    try {
      const myNick = localStorage.getItem('nickname');
      const encodedNick = encodeURIComponent(myNick);

      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${encodedNick}`
        },
        body: JSON.stringify({ requesterNickname })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      alert(`${requesterNickname}님의 친구 요청을 수락했습니다.`);

      await fetchPendingRequests();
      await fetchFriendList(); // 수락 후 목록 갱신
    } catch (err) {
      console.error('handleAccept error', err);
      alert('요청 수락 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const hasPending = pending.length > 0;

  return (
    <div className="friends-page-layout">
      {/* 헤더 */}
      <header className="friends-header">
        <h1 className="friends-header-title">친구</h1>
        <div style={{ width: '40px' }} />
      </header>

      <main className="friends-main">
        {/* 상단 카드: 수락 대기 버튼 */}
        <section className="friends-pending-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="friends-pending-title">친구 신청</h3>
              <p className="friends-pending-subtitle">
                {hasPending
                  ? `${pending.length}개의 친구 신청이 있습니다`
                  : '새로운 친구 신청이 없습니다'}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className={`friends-pending-btn ${hasPending ? 'active' : 'inactive'}`}
              disabled={!hasPending}
            >
              <span className="friends-pending-icon">→</span>
            </button>
          </div>
        </section>

        {/* 친구 목록 섹션 */}
        <section className="friends-section">
          <h2 className="friends-section-title">
            친구 목록
            {friends.length > 0 && <span className="friends-count">{friends.length}</span>}
          </h2>

          {friends.length === 0 ? (
            <div className="friends-empty">
              <p className="friends-empty-icon">👥</p>
              <p className="friends-empty-text">아직 친구가 없습니다.</p>
              <p className="friends-empty-subtext">프로필에서 친구를 찾아 신청해보세요!</p>
            </div>
          ) : (
            <div className="friends-list">
              {friends.map((f, idx) => (
                <div key={idx} className="friend-item">
                  <div className="friend-avatar">{f.nickname?.[0] || '?'}</div>
                  <div className="friend-info">
                    <p className="friend-name">{f.nickname}</p>
                    <p className="friend-status">친구</p>
                  </div>
                  <button className="friend-action-btn">···</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 모달 팝업 */}
      {showModal && (
        <div className="friends-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="friends-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="friends-modal-header">
              <h2>친구 신청 ({pending.length})</h2>
              <button
                className="friends-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="friends-modal-content">
              {pending.length === 0 ? (
                <div className="friends-modal-empty">
                  <p>수락 대기중인 친구 요청이 없습니다.</p>
                </div>
              ) : (
                <div className="pending-requests-list">
                  {pending.map((req, idx) => (
                    <div key={idx} className="pending-request-item">
                      <div className="pending-avatar">{req.nickname?.[0] || '?'}</div>
                      <div className="pending-info">
                        <p className="pending-name">{req.nickname}</p>
                        <p className="pending-time">친구 신청이 도착했습니다</p>
                      </div>
                      <div className="pending-actions">
                        <button
                          className="pending-accept-btn"
                          onClick={() => handleAccept(req.nickname)}
                          disabled={loading}
                        >
                          {loading ? '처리중…' : '수락'}
                        </button>
                        <button
                          className="pending-decline-btn"
                          onClick={() => {
                            alert('거절 기능은 향후 추가될 예정입니다.');
                          }}
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="friends-modal-footer">
              <button
                className="friends-modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default FriendsPage;
