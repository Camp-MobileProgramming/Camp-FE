import React, { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav.jsx';

function FriendsPage() {
  const [pending, setPending] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ paddingBottom: '70px' }}>
      <div style={{ padding: '20px' }}>

        <h1>친구 목록 페이지</h1>

        {/*친구 목록*/}
        <section style={{ marginTop: '20px' }}>
          <h2>내 친구 목록</h2>
          {friends.length === 0 ? (
            <p>아직 친구가 없습니다.</p>
          ) : (
            <ul style={{ paddingLeft: '16px' }}>
              {friends.map((f, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>
                  {f.nickname}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/*수락 대기 목록*/}
        <section style={{ marginTop: '30px' }}>
          <h2>수락 대기중</h2>

          {pending.length === 0 ? (
            <p>수락 대기중인 친구 요청이 없습니다.</p>
          ) : (
            <ul style={{ paddingLeft: '16px' }}>
              {pending.map((req, idx) => (
                <li key={idx} style={{
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{req.nickname}</span>

                  <button
                    onClick={() => handleAccept(req.nickname)}
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
                    {loading ? '처리중…' : '수락'}
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
