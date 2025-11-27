import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatButton from '../components/ChatButton';
import './ChatRoom.css';

export default function ChatRoom() {
  const { nickname: targetNickname } = useParams();
  const navigate = useNavigate();
  const myNickname = localStorage.getItem('nickname');

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const ws = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!myNickname) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 추후 WebSocket 주소 추가/ ex) VITE_CHAT_WS_BASE=wss://your-ngrok-url.ngrok-free.dev/chat-ws
    let wsUrl = import.meta.env.VITE_CHAT_WS_BASE;

    if (!wsUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//localhost:8080/chat-ws`; // 테스트 위해 하드코딩
    } else if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}${wsUrl}`;
    }

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      const joinPayload = {
        type: 'join',
        myNickname,
        targetNickname,
      };
      socket.send(JSON.stringify(joinPayload));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          setMessages((prev) => [...prev, data]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    socket.onerror = (e) => {
      console.error(e);
    };

    socket.onclose = () => {};

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [targetNickname, myNickname, navigate]);

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
              const nextIsSameSender =
                nextMsg.senderNickname === msg.senderNickname;
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
                {!isMe && (
                  <span className="sender-name">{msg.senderNickname}</span>
                )}

                <div className="bubble-row">
                  {isMe && showTime && (
                    <span className="msg-time">{timeString}</span>
                  )}
                  <div className="msg-bubble">{msg.content}</div>
                  {!isMe && showTime && (
                    <span className="msg-time">{timeString}</span>
                  )}
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
        <ChatButton
          onClick={handleSend}
          disabled={!inputValue.trim()}
          label="전송"
        />
      </div>
    </div>
  );
}
