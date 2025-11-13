import React, { useEffect, useRef, useState } from 'react';
import { connectWS } from '../shared/ws.js';
import BottomNav from '../components/BottomNav.jsx';
import './MapView.css';

export default function MapView() {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const myMarkerRef = useRef(null);
  const othersRef = useRef(new Map());
  const wsRef = useRef(null);
  const [isFriendsOnly, setIsFriendsOnly] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const { kakao } = window;

    if (!kakao || !kakao.maps) {
      console.error("Kakao Maps SDK가 로드되지 않았습니다.");
      return;
    }

    let watchId = null;

    kakao.maps.load(() => {
      if (!mapRef.current) return;

      const center = new kakao.maps.LatLng(37.5665, 126.9780);
      const map = new kakao.maps.Map(mapRef.current, { center, level: 1 });
      kakaoMapRef.current = map;

      const myMarker = new kakao.maps.Marker({ position: center, zIndex: 1000 });
      myMarker.setMap(map);
      myMarkerRef.current = myMarker;

      const ws = connectWS({
        userId: "user-" + Math.random().toString(36).slice(2, 6),
        postId: "room-1",
        onJoinAck: (m) => { if (ws) ws.sessionId = m.sessionId; },
        onLocation: (m) => {
          if (!kakao) return;
          const { sessionId, lat, lng } = m;
          if (lat == null || lng == null) return;
          const pos = new kakao.maps.LatLng(lat, lng);

          if (ws && ws.sessionId && sessionId === ws.sessionId) {
            myMarkerRef.current?.setPosition(pos);
            map.setCenter(pos);
          } else {
            const others = othersRef.current;
            if (!others.has(sessionId)) {
              const mk = new kakao.maps.Marker({ position: pos, zIndex: 500 });
              mk.setMap(map);
              others.set(sessionId, mk);
            } else {
              others.get(sessionId)?.setPosition(pos);
            }
          }
        },
        onClose: (sessionId) => {
          const mk = othersRef.current.get(sessionId);
          if (mk) { mk.setMap(null); othersRef.current.delete(sessionId); }
        }
      });
      wsRef.current = ws;

      if (navigator.geolocation) {
        let last = 0; const MIN = 800;
        watchId = navigator.geolocation.watchPosition((p) => {
          if (!kakao || !ws || !myMarkerRef.current || !map) return;
          const now = Date.now(); if (now - last < MIN) return; last = now;
          const lat = p.coords.latitude, lng = p.coords.longitude;
          const me = new kakao.maps.LatLng(lat, lng);
          myMarkerRef.current.setPosition(me);
          map.setCenter(me);
          ws.sendLoc(lat, lng);
        }, (e) => console.log("GPS 실패:", e), { enableHighAccuracy: true });
      }
    });

    return () => {
      try { if (watchId) navigator.geolocation.clearWatch(watchId); } catch {}
      try { wsRef.current?.close(); } catch {}
      myMarkerRef.current?.setMap(null);
      othersRef.current.forEach(mk => mk.setMap(null));
      othersRef.current.clear();
    };
  }, []);

  return (
    <div className="map-page-layout">
      <header className="map-header">
        <div className="header-title">
          <h1>캠프맵</h1>
          <span>주변 캠퍼 6명</span>
        </div>
        <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>⚙️</button>
      </header>
      
      <div className="map-controls">
        <div className="location-status">📍 위치 공유 중</div>
        <div className="privacy-toggle">
          <span>친구 공개</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isFriendsOnly} 
              onChange={() => setIsFriendsOnly(!isFriendsOnly)} 
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      
      <div ref={mapRef} className="map-container" />

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3>설정</h3>
            <div className="settings-item">
              <label>위치 공유</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="settings-item">
              <label>친구에게만 공개</label>
              <input 
                type="checkbox" 
                checked={isFriendsOnly}
                onChange={() => setIsFriendsOnly(!isFriendsOnly)}
              />
            </div>
            <div className="settings-item">
              <label>배경 소리</label>
              <input type="checkbox" />
            </div>
            <button className="close-settings" onClick={() => setShowSettings(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}