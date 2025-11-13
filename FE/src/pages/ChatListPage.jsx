import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav.jsx';
import './ChatListPage.css';

function ChatListPage() {
  const [chats, setChats] = useState([]);
  const [activeTab, setActiveTab] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    // Fetch chats from mock API
    fetch('/api/chats')
      .then(r => r.json())
      .then(data => {
        setChats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch chats:', err);
        setLoading(false);
      });
  }, []);

  const filteredChats = chats.filter(chat => {
    const matchesTab = activeTab === '전체' || 
                       (activeTab === '1:1' && chat.type === '1:1') || 
                       (activeTab === '그룹' && chat.type === 'group');
    
    const matchesSearch = searchInput === '' || 
                         chat.participants[0]?.name.includes(searchInput) ||
                         chat.lastMessage.includes(searchInput);
    
    return matchesTab && matchesSearch;
  });

  const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setMessageInput('');
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log('메시지 전송:', messageInput);
      fetch(`/api/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageInput })
      })
        .then(r => r.json())
        .then(() => {
          setMessageInput('');
          console.log('메시지 전송 완료');
        })
        .catch(err => console.error('메시지 전송 실패:', err));
    }
  };

  const handleAddChat = () => {
    alert('친구 선택 후 채팅 시작 기능 (준비 중)');
  };

  return (
    <div className="chat-list-page">
      <header className="chat-header">
        <h1>채팅</h1>
        <button className="add-chat-btn" onClick={handleAddChat}>+</button>
      </header>

      <div className="search-box">
        <input 
          type="text" 
          placeholder="캠퍼 검색" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="chat-tabs">
        <button 
          className={`tab ${activeTab === '전체' ? 'active' : ''}`}
          onClick={() => setActiveTab('전체')}
        >
          전체
        </button>
        <button 
          className={`tab ${activeTab === '1:1' ? 'active' : ''}`}
          onClick={() => setActiveTab('1:1')}
        >
          1:1
        </button>
        <button 
          className={`tab ${activeTab === '그룹' ? 'active' : ''}`}
          onClick={() => setActiveTab('그룹')}
        >
          그룹
        </button>
      </div>

      <div className="chat-list-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : filteredChats.length === 0 ? (
          <div className="empty">채팅이 없습니다</div>
        ) : (
          filteredChats.map(chat => (
            <div 
              key={chat.id} 
              className="chat-item"
              onClick={() => handleChatClick(chat)}
            >
              <div className="chat-avatar">
                {chat.participants[0]?.avatar || '💬'}
              </div>
              <div className="chat-content">
                <div className="chat-header-row">
                  <h3 className="chat-name">
                    {chat.type === '1:1' 
                      ? chat.participants[0]?.name 
                      : chat.participants[0]?.name}
                  </h3>
                  <span className="chat-time">{chat.lastMessageTime}</span>
                </div>
                <p className="chat-message">{chat.lastMessage}</p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="unread-badge">{chat.unreadCount}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Chat Detail Modal */}
      {selectedChat && (
        <div className="chat-modal-overlay" onClick={() => setSelectedChat(null)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-btn" onClick={() => setSelectedChat(null)}>←</button>
              <h2>{selectedChat.participants[0]?.name}</h2>
              <div style={{ width: '32px' }}></div>
            </div>

            <div className="messages-container">
              <div className="message-item received">
                <div className="message-avatar">{selectedChat.participants[0]?.avatar}</div>
                <div className="message-bubble">
                  <p>{selectedChat.lastMessage}</p>
                </div>
              </div>
            </div>

            <div className="message-input-box">
              <input 
                type="text" 
                placeholder="메시지 입력..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>전송</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default ChatListPage;