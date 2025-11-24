import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

function FriendsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 백엔드에서 수락 대기 목록 조회
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const myNick = localStorage.getItem('nickname');
      const response = await fetch('/api/friends/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myNick}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setPending(data || []);
    } catch (err) {
      console.error('fetchPendingRequests error', err);
      setPending([]);
    }
  };

  const handleAccept = async (requesterNickname) => {
    if (loading) return;
    setLoading(true);

    try {
      const myNick = localStorage.getItem('nickname');
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myNick}`
        },
        body: JSON.stringify({ requesterNickname })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // 수락 완료 후 목록 새로고침
      await fetchPendingRequests();
      alert(`${requesterNickname}님의 친구 요청을 수락했습니다.`);
    } catch (err) {
      console.error('handleAccept error', err);
      alert('요청 수락 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '70px' }}>
      <div style={{ padding: '20px' }}>
        <h1>친구 목록 페이지</h1>

        <section style={{ marginTop: '16px' }}>
          <h2>수락 대기중</h2>
          {pending.length === 0 ? (
            <p>수락 대기중인 친구 요청이 없습니다.</p>
          ) : (
            <ul style={{ paddingLeft: '16px' }}>
              {pending.map((request, index) => (
                <li key={index} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{request.nickname || request}</span>
                  <button
                    onClick={() => handleAccept(request.nickname || request)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {loading ? '처리중...' : '수락'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
export default FriendsPage;