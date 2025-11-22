import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWS } from '../shared/ws.js';
import BottomNav from '../components/BottomNav.jsx';
import './MapView.css';

export default function MapView() {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const myMarkerRef = useRef(null);        // 내 위치 CustomOverlay
  const othersRef = useRef(new Map());     // 다른 사람들: Map<sessionId, { overlay, el, nickname }>
  const wsRef = useRef(null);

  const [isFriendsOnly, setIsFriendsOnly] = useState(true);
  const navigate = useNavigate();

  // 로그인 시 저장해 둔 정보 사용 (없으면 '나')
  const nickname = localStorage.getItem('nickname') || '나';

  useEffect(() => {
    const { kakao } = window;

    if (!kakao || !kakao.maps) {
      console.error('Kakao Maps SDK가 로드되지 않았습니다.');
      return;
    }

    let watchId = null;

    kakao.maps.load(() => {
      if (!mapRef.current) return;

      const center = new kakao.maps.LatLng(37.5665, 126.9780);
      const map = new kakao.maps.Map(mapRef.current, { center, level: 1 });
      kakaoMapRef.current = map;

      // 내 마커: 동그라미 + 내 닉네임
      const myEl = document.createElement('div');
      myEl.className = 'user-marker my-marker';
      myEl.innerText = nickname;

      Object.assign(myEl.style, {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        border: '2px solid #4f46e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: '600',
        color: '#111827',
        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        cursor: 'pointer',
        userSelect: 'none',
      });

      // 내 마커 클릭 → 내 프로필로 이동
      // (프로필 페이지에서 localStorage.nickname 사용하면 됨)
      myEl.addEventListener('click', () => {
        navigate('/profile');
      });

      const myOverlay = new kakao.maps.CustomOverlay({
        position: center,
        content: myEl,
        yAnchor: 1,
        zIndex: 1000,
      });

      myOverlay.setMap(map);
      myMarkerRef.current = myOverlay;

      //WebSocket 연결
      const ws = connectWS({
        // 아직 DB PK 안 쓰니까 세션용 임시 ID
        userId: 'user-' + Math.random().toString(36).slice(2, 6),
        postId: 'room-1',
        nickname, // 🔹 서버에 join 시 전달

        onJoinAck: (m) => {
          if (ws) ws.sessionId = m.sessionId;
        },

        onLocation: (m) => {
          if (!kakao) return;

          const { sessionId, lat, lng, nickname: otherNickname } = m;
          if (lat == null || lng == null) return;

          const pos = new kakao.maps.LatLng(lat, lng);

          // 내 위치인 경우
          if (ws && ws.sessionId && sessionId === ws.sessionId) {
            if (myMarkerRef.current) {
              myMarkerRef.current.setPosition(pos);
            }
            map.setCenter(pos);
            return;
          }

          // 다른 사람들 위치
          const others = othersRef.current;
          const displayName = otherNickname || sessionId?.slice(-4) || 'USER';

          if (!others.has(sessionId)) {
            // 처음 보는 세션 → 동그라미 마커 생성
            const el = document.createElement('div');
            el.className = 'user-marker';
            el.innerText = displayName;

            Object.assign(el.style, {
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '2px solid #4b5563',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '600',
              color: '#111827',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              cursor: 'pointer',
              userSelect: 'none',
            });

            // 다른 사람 마커 클릭 -> 그 사람 닉네임 기반 프로필로 이동
            el.addEventListener('click', () => {
              if (otherNickname) {
                navigate(`/profile/${encodeURIComponent(otherNickname)}`);
              } else {
                // 닉네임이 없으면 세션ID로라도 구분
                navigate(`/profile/session/${sessionId}`);
              }
            });

            const overlay = new kakao.maps.CustomOverlay({
              position: pos,
              content: el,
              yAnchor: 1,
              zIndex: 500,
            });

            overlay.setMap(map);
            others.set(sessionId, { overlay, el, nickname: displayName });
          } else {
            const info = others.get(sessionId);
            info.overlay.setPosition(pos);
          }
        },

        onClose: (sessionId) => {
          const info = othersRef.current.get(sessionId);
          if (info) {
            info.overlay.setMap(null);
            othersRef.current.delete(sessionId);
          }
        },
      });

      wsRef.current = ws;

      //  내 GPS 추적
      if (navigator.geolocation) {
        let last = 0;
        const MIN = 800;

        watchId = navigator.geolocation.watchPosition(
          (p) => {
            if (!kakao || !ws || !myMarkerRef.current || !map) return;
            const now = Date.now();
            if (now - last < MIN) return;
            last = now;

            const lat = p.coords.latitude;
            const lng = p.coords.longitude;
            const me = new kakao.maps.LatLng(lat, lng);

            myMarkerRef.current.setPosition(me);
            map.setCenter(me);
            ws.sendLoc(lat, lng);
          },
          (e) => console.log('GPS 실패:', e),
          { enableHighAccuracy: true }
        );
      }
    });

    //cleanup
    return () => {
      try {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      } catch {}

      try {
        wsRef.current?.close();
      } catch {}

      if (myMarkerRef.current) {
        myMarkerRef.current.setMap(null);
        myMarkerRef.current = null;
      }

      othersRef.current.forEach((info) => {
        info.overlay.setMap(null);
      });
      othersRef.current.clear();
    };
  }, [navigate, nickname]);

  return (
    <div className="map-page-layout">
      <header className="map-header">
        <div className="header-title">
          <h1>캠프맵</h1>
          <span>주변 캠퍼 6명</span>
        </div>
        <button className="settings-button">⚙️</button>
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

      <BottomNav />
    </div>
  );
}
