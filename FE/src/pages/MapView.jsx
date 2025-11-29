import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWS } from '../shared/ws.js';
import BottomNav from '../components/BottomNav.jsx';
import './MapView.css';

export default function MapView() {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const myMarkerRef = useRef(null);        // 내 위치 CustomOverlay
  const othersRef = useRef(new Map());     // Map<sessionId, { overlay, el, nickname }>
  const wsRef = useRef(null);

  // 처음에는 "모두 보기"가 기본이도록
  const [isFriendsOnly, setIsFriendsOnly] = useState(false);
  const [friendsSet, setFriendsSet] = useState(new Set());
  const [friendsCount, setFriendsCount] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);
  const navigate = useNavigate();

  const nickname = localStorage.getItem('nickname') || '나';
  const userId = localStorage.getItem('userId'); // DB PK (로그인 시 저장했다고 가정)

  // 친구 목록 불러오기 
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const myNick = localStorage.getItem('nickname');
        if (!myNick) return;

        const encodedNick = encodeURIComponent(myNick);
        const res = await fetch('/api/friends/list', {
          headers: {
            'Authorization': `Bearer ${encodedNick}`,
          },
        });

        if (!res.ok) {
          console.warn('친구 목록 로드 실패', res.status);
          return;
        }

        const data = await res.json();
        const set = new Set(
          data
            .map((f) => f.nickname)
            .filter(Boolean)
        );
        setFriendsSet(set);
        setFriendsCount(set.size);
      } catch (e) {
        console.error('친구 목록 불러오기 에러', e);
      }
    };

    fetchFriends();
  }, []);

  //  WebSocket + 내 위치 세팅 (한 번만)
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

      // --- 내 마커 ---
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

      // --- WebSocket 연결 ---
      const effectiveUserId =
        userId || 'anon-' + Math.random().toString(36).slice(2, 8); // DB 없으면 임시값

      const ws = connectWS({
        userId: String(effectiveUserId),
        postId: 'room-1',
        nickname,

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

          // ── 다른 사람들 위치 업데이트 (친구 여부 상관 없이 일단 다 유지) ──
          const others = othersRef.current;
          const rawNickname = otherNickname || sessionId?.slice(-4) || 'USER';
          const displayName = rawNickname;

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

            // 다른 사람 마커 클릭 → 그 사람 프로필
            el.addEventListener('click', () => {
              if (otherNickname) {
                navigate(`/profile/${encodeURIComponent(otherNickname)}`);
              }
            });

            const overlay = new kakao.maps.CustomOverlay({
              position: pos,
              content: el,
              yAnchor: 1,
              zIndex: 500,
            });

            overlay.setMap(map);
            others.set(sessionId, { overlay, el, nickname: rawNickname });
          } else {
            const info = others.get(sessionId);
            info.overlay.setPosition(pos);
          }

          // 필터 적용은 별도 useEffect에서 처리할 거라 여기선 전체 수만 반영
          setNearbyCount(othersRef.current.size);
        },

        onClose: (sessionId) => {
          const info = othersRef.current.get(sessionId);
          if (info) {
            info.overlay.setMap(null);
            othersRef.current.delete(sessionId);
            setNearbyCount(othersRef.current.size);
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

    // cleanup
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
  }, [navigate, nickname, userId]); // isFriendsOnly, friendsSet 제거

  // 친구 공개 필터만 별도 처리
  useEffect(() => {
    const map = kakaoMapRef.current;
    if (!map) return;

    const others = othersRef.current;

    let visibleCount = 0;

    others.forEach((info) => {
      const isFriend = friendsSet.has(info.nickname);
      const shouldHide =
        isFriendsOnly && friendsSet.size > 0 && !isFriend;

      if (shouldHide) {
        info.overlay.setMap(null);       // 지도에서 감추기
      } else {
        info.overlay.setMap(map);        // 다시 보여주기
        visibleCount++;
      }
    });

    // 친구모드에 따라 실제 보이는 사람 수로 업데이트
    setNearbyCount(visibleCount);
  }, [isFriendsOnly, friendsSet]); // ✅ 필터 관련 상태만 의존

  return (
    <div className="map-page-layout">
      <header className="map-header">
        <div className="header-title">
          <h1>캠프맵</h1>
          <span>
            {nearbyCount === 0
              ? "주변 아무도 없음"
              : `주변 캠퍼 ${nearbyCount}명`}
          </span>
        </div>
        <button
          className="settings-button"
          onClick={() => navigate('/settings')}
        >
          ⚙️
        </button>
      </header>

      <div className="map-controls">
        <div className="location-status">📍 위치 공유 중</div>
        <div className="privacy-toggle">
          <span>친구 공개</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={isFriendsOnly}
              onChange={() => setIsFriendsOnly((prev) => !prev)}
            />
            <span className="slider round"></span>
          </label>
          {friendsCount > 0 && (
            <span className="friends-count-label">
              (내 친구 {friendsCount}명)
            </span>
          )}
        </div>
      </div>

      <div ref={mapRef} className="map-container" />

      <BottomNav />
    </div>
  );
}
