import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav.jsx';
import './ChatListPage.css';

export default function ChatListPage() {
  const navigate = useNavigate();
  const myNickname = localStorage.getItem('nickname');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 로그인 안 되어 있으면 로그인 페이지로
  useEffect(() => {
    if (!myNickname) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [myNickname, navigate]);

  // 채팅방 목록 불러오기
  useEffect(() => {
    if (!myNickname) return;

    const loadRooms = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const url = `/api/chats/rooms?me=${encodeURIComponent(myNickname)}`;
        const res = await fetch(url);

        if (!res.ok) {
          const text = await res.text();
          console.error('[ChatList] 목록 불러오기 실패', res.status, text);
          setLoadError('채팅 목록을 불러오지 못했습니다.');
          return;
        }

        const data = await res.json();
        //정렬
        data.sort((a, b) => {
          const ta = a.lastTs ? new Date(a.lastTs).getTime() : 0;
          const tb = b.lastTs ? new Date(b.lastTs).getTime() : 0;
          return tb - ta;
        });
        setRooms(data);
      } catch (e) {
        console.error('[ChatList] 에러', e);
        setLoadError('채팅 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [myNickname]);

  // Polling to refresh rooms periodically so state stays in sync when other client changes
  useEffect(() => {
    if (!myNickname) return;
    const id = setInterval(() => {
      (async () => {
        try {
          const url = `/api/chats/rooms?me=${encodeURIComponent(myNickname)}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          data.sort((a, b) => {
            const ta = a.lastTs ? new Date(a.lastTs).getTime() : 0;
            const tb = b.lastTs ? new Date(b.lastTs).getTime() : 0;
            return tb - ta;
          });
          setRooms(data);
        } catch (e) {
          // ignore polling errors
        }
      })();
    }, 60000);

    return () => clearInterval(id);
  }, [myNickname]);

  const handleRoomClick = (otherNickname) => {
    if (!otherNickname) return;
    navigate(`/chat/${encodeURIComponent(otherNickname)}`);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chatlist-layout">
      <header className="chatlist-header">
        <h1>채팅</h1>
      </header>

      <main className="chatlist-main">
        {loading && <div className="chatlist-info">채팅 목록을 불러오는 중...</div>}
        {loadError && <div className="chatlist-error">{loadError}</div>}

        {!loading && !loadError && rooms.length === 0 && (
          <div className="chatlist-empty">
            아직 채팅한 친구가 없습니다.
            <br />
            친구 프로필에서 채팅을 시작해보세요!
          </div>
        )}

        {!loading && !loadError && rooms.length > 0 && (
          <ul className="chatlist-list">
            {rooms.map((room) => (
              <li
                key={room.roomKey}
                className="chatlist-item"
                onClick={() => handleRoomClick(room.otherNickname)}
              >
                <div className="chatlist-avatar">
                  {/* 간단한 이니셜 아바타 */}
                  <span>{room.otherNickname?.[0] || '?'}</span>
                </div>

                <div className="chatlist-content">
                  <div className="chatlist-row-top">
                    <span className="chatlist-name">{room.otherNickname}</span>
                    <span className="chatlist-time">
                      {room.lastTs ? formatTime(room.lastTs) : ''}
                    </span>
                  </div>

                  <div className="chatlist-row-bottom">
                    <span className="chatlist-lastmsg">
                      {room.lastMessage || '대화를 시작해보세요.'}
                    </span>
                    {room.unreadCount > 0 && (
                      <span className="chatlist-unread">{room.unreadCount}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
}
