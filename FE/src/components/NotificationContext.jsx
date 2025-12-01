import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [counts, setCounts] = useState({
    campRequest: 0,
    chat: 0,
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('notificationSettings');
      return saved
        ? JSON.parse(saved)
        : { campRequestAlarm: true, chatAlarm: true };
    } catch (e) {
      return { campRequestAlarm: true, chatAlarm: true };
    }
  });

  // 친구/채팅 알림 카운트 조회
  const fetchNotificationCounts = async () => {
    try {
      const myNickname = localStorage.getItem('nickname');
      if (!myNickname) return;

      const encodedNick = encodeURIComponent(myNickname);

      // 1) 친구 요청 (pending)
      const friendRes = await fetch('/api/friends/pending', {
        headers: { Authorization: `Bearer ${encodedNick}` },
      });

      let friendCount = 0;
      if (friendRes.ok) {
        const friendData = await friendRes.json();
        friendCount = Array.isArray(friendData) ? friendData.length : 0;
      }

      // 2) 채팅 미읽음
      let chatCount = 0;
      const chatRes = await fetch(
        `/api/chats/unread-count?me=${encodedNick}`
      );
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        chatCount = chatData.total ?? 0;
      }

      setCounts({
        campRequest: friendCount,
        chat: chatCount,
      });
    } catch (error) {
      console.error('알림 데이터 불러오기 실패:', error);
    }
  };

  // 앱 처음 켜질 때 1번
  useEffect(() => {
    fetchNotificationCounts();
  }, []);

  // 🔁 새로고침 없이도 배지가 갱신되도록 주기적으로 리프레시
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchNotificationCounts();
    }, 15000); // 15초마다 한번씩 (원하면 10초 / 20초로 조절 가능)

    return () => clearInterval(intervalId);
  }, []);

  const toggleSetting = (key) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  // 특정 페이지(FriendsPage 등)에서 직접 덮어쓸 때
  const updateCount = (type, count) => {
    setCounts((prev) => ({ ...prev, [type]: count }));
  };

  // 수동으로 새로고침하고 싶을 때 (이미 ChatRoom/FriendsPage에서 사용중)
  const refreshCounts = () => {
    fetchNotificationCounts();
  };

  return (
    <NotificationContext.Provider
      value={{ counts, settings, toggleSetting, updateCount, refreshCounts }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
