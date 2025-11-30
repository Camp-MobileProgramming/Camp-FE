import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ChatButton from '../components/ChatButton';
import './ChatRoom.css';
import { useNotification } from '../components/NotificationContext';
export default function ChatRoom() {
  const { nickname: targetNickname } = useParams();
  const navigate = useNavigate();
  const myNickname = localStorage.getItem('nickname');
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const roomKeyFromQuery = urlParams.get('roomKey');
  const { refreshCounts } = useNotification();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [initialLoaded, setInitialLoaded] = useState(false); // DB 초기 로딩 끝났는지
  const ws = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!myNickname) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [myNickname, navigate]);

  // 1. DB에서 기존 채팅 내역 불러오기
  useEffect(() => {
    if (!myNickname || !targetNickname) return;

    const loadChats = async () => {
      try {
        let res;

        if (roomKeyFromQuery) {
          // If caller provided a roomKey, try loading by roomKey first
          res = await fetch(
            `/api/chats?roomKey=${encodeURIComponent(roomKeyFromQuery)}`
          );

          // fallback to me/target if roomKey call not supported
          if (!res.ok) {
            res = await fetch(
              `/api/chats?me=${encodeURIComponent(myNickname)}&target=${encodeURIComponent(targetNickname)}`
            );
          }
        } else {
          res = await fetch(
            `/api/chats?me=${encodeURIComponent(myNickname)}&target=${encodeURIComponent(targetNickname)}`
          );
        }

        if (!res.ok) {
          console.error('채팅 내역 불러오기 실패', res.status);
          return;
        }

        const data = await res.json(); // [{ senderNickname, content, ts }, ...]
        setMessages(data);
      } catch (e) {
        console.error('채팅 내역 로드 중 에러', e);
      } finally {
        setInitialLoaded(true);
        refreshCounts();
      }
    };

    loadChats();
  }, [myNickname, targetNickname, refreshCounts]);

  // 2. WebSocket 연결 (DB 로딩이 끝난 뒤에 연결하도록 의존성에 initialLoaded 추가)
  useEffect(() => {
    if (!myNickname || !targetNickname) return;
    if (!initialLoaded) return; // DB 메시지 먼저 채우고 나서 WS 연결

    let base = import.meta.env.VITE_CHAT_WS_BASE || '/chat-ws';
    let wsUrl = base;

    if (wsUrl.startsWith('ws://') || wsUrl.startsWith('wss://')) {
      // 그대로 사용
    } else if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}${wsUrl}`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/${wsUrl}`;
    }

    console.log(' WebSocket 연결:', wsUrl);
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      const joinPayload = {
        type: 'join',
        myNickname,
        targetNickname,
      };

      // Include roomKey when available so server can attach to existing room
      if (roomKeyFromQuery) {
        joinPayload.roomKey = roomKeyFromQuery;
      }

      socket.send(JSON.stringify(joinPayload));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          // 기존 메시지에 append
          setMessages((prev) => [...prev, data]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    socket.onerror = (e) => {
      console.error('WS error:', e);
    };

    socket.onclose = () => {
      console.log('WS closed');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [myNickname, targetNickname, initialLoaded]);

  //  3. 메시지 변경될 때마다 스크롤 맨 아래로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (!ws.current) return;

    if (ws.current.readyState === WebSocket.OPEN) {
      const chatPayload = {
        type: 'chat',
        content: inputValue,
      };
      ws.current.send(JSON.stringify(chatPayload));
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  const getTimeKey = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    const h = d.getHours();
    const m = d.getMinutes();
    return `${h}:${m}`;
  };

  return (
    <div className="chat-room-layout">
      <header className="chat-header">
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 8px',
          }}
        >
          ←
        </button>
        <h1 className="chat-header-title">{targetNickname}</h1>
      </header>

      <div className="chat-window" ref={scrollRef}>
        {messages.map((msg, idx) => {
          const isMe = msg.senderNickname === myNickname;

          const timeKey = getTimeKey(msg.ts);
          const nextMsg = messages[idx + 1];

          let showTime = false;

          if (msg.ts) {
            if (!nextMsg || !nextMsg.ts) {
              showTime = true;
            } else {
              const nextTimeKey = getTimeKey(nextMsg.ts);
              const nextIsSameSender = nextMsg.senderNickname === msg.senderNickname;
              const nextIsSameTime = nextTimeKey === timeKey;
              showTime = !(nextIsSameSender && nextIsSameTime);
            }
          }

          const timeString = msg.ts
            ? new Date(msg.ts).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          return (
            <div
              key={idx}
              className={`message-row ${isMe ? 'my-msg' : 'other-msg'}`}
            >
              <div className="msg-content-col">
                {!isMe && <span className="sender-name">{msg.senderNickname}</span>}

                <div className="bubble-row">
                  {isMe && showTime && <span className="msg-time">{timeString}</span>}
                  <div className="msg-bubble">{msg.content}</div>
                  {!isMe && showTime && <span className="msg-time">{timeString}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
        />
        <ChatButton onClick={handleSend} disabled={!inputValue.trim()} label="전송" />
      </div>
    </div>
  );
}
