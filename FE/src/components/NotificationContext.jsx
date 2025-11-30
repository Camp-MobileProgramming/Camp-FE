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
      return saved ? JSON.parse(saved) : { campRequestAlarm: true, chatAlarm: true };
    } catch (e) {
      return { campRequestAlarm: true, chatAlarm: true };
    }
  });
  const fetchNotificationCounts = async () => {
    try {
      const myNickname = localStorage.getItem('nickname');
      if (!myNickname) return;

      const encodedNick = encodeURIComponent(myNickname);
      const friendRes = await fetch('/api/friends/pending', {
        headers: { 'Authorization': `Bearer ${encodedNick}` }
      });
      
      let friendCount = 0;
      if (friendRes.ok) {
        const friendData = await friendRes.json();
        friendCount = Array.isArray(friendData) ? friendData.length : 0;
      }

      const chatCount = 0; 
      setCounts({
        campRequest: friendCount,
        chat: chatCount
      });

    } catch (error) {
      console.error("알림 데이터 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchNotificationCounts();
  }, []);


  const toggleSetting = (key) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const updateCount = (type, count) => {
    setCounts((prev) => ({ ...prev, [type]: count }));
  };

  const refreshCounts = () => {
    fetchNotificationCounts();
  };

  return (
    <NotificationContext.Provider value={{ counts, settings, toggleSetting, updateCount, refreshCounts }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}