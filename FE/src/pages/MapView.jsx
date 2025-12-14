import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWS } from '../shared/ws.js';
import BottomNav from '../components/BottomNav.jsx';
import './MapView.css';

export default function MapView() {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const myMarkerRef = useRef(null);
  const othersRef = useRef(new Map());
  const wsRef = useRef(null);

  const [friendsSet, setFriendsSet] = useState(new Set());
  const friendsSetRef = useRef(new Set());
  const [friendsCount, setFriendsCount] = useState(0);
  const [nearbyCount, setNearbyCount] = useState(0);

  const [locationShare, setLocationShare] = useState(true);
  const [locationVisibility, setLocationVisibility] = useState('all'); // 'all' | 'friends' | 'none'
  const locationShareRef = useRef(true);
  const locationVisibilityRef = useRef('all');

  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || '나';
  const userId = localStorage.getItem('userId');

  // 1) 친구 목록 불러오기
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
          data.map((f) => f.nickname).filter(Boolean)
        );
        setFriendsSet(set);
        friendsSetRef.current = set; //최신값 ref에 저장
        setFriendsCount(set.size);
      } catch (e) {
        console.error('친구 목록 불러오기 에러', e);
      }
    };

    fetchFriends();
  }, []);

  // 2) 내 위치 설정 불러오기 (/api/settings/me)
  useEffect(() => {
    const fetchSettings = async () => {
      const myNick = localStorage.getItem('nickname');
      if (!myNick) return;

      try {
        const res = await fetch('/api/settings/me', {
          headers: {
            'Authorization': `Bearer ${encodeURIComponent(myNick)}`
          }
        });
        if (!res.ok) return;

        const data = await res.json();
        const share = data.locationShare ?? true;
        const visibility = data.locationVisibility ?? 'all';

        setLocationShare(share);
        setLocationVisibility(visibility);
        locationShareRef.current = share; // WS에서 쓸 최신 값
        locationVisibilityRef.current = visibility;
      } catch (e) {
        console.error('위치 설정 불러오기 실패', e);
      }
    };

    fetchSettings();
  }, []);

  // 3) WebSocket + 지도 세팅
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
        userId || 'anon-' + Math.random().toString(36).slice(2, 8);

      const ws = connectWS({
        userId: String(effectiveUserId),
        postId: 'room-1',
        nickname,

        onJoinAck: (m) => {
          if (ws) ws.sessionId = m.sessionId;
        },

        // 서버에서 location 메시지:
        // { sessionId, lat, lng, nickname, locationVisibility: 'all'|'friends'|'none' }
        onLocation: (m) => {
          if (!kakao) return;
          console.log("[onloc]",m);
          const {
            sessionId,
            lat,
            lng,
            nickname: otherNickname,
            locationVisibility: otherVisibility,
          } = m;
          if (lat == null || lng == null) return;

          const pos = new kakao.maps.LatLng(lat, lng);
          const others = othersRef.current;

          // 내 위치인 경우
          if (ws && ws.sessionId && sessionId === ws.sessionId) {
            if (myMarkerRef.current) {
              myMarkerRef.current.setPosition(pos);
            }
            map.setCenter(pos);
            return;
          }

          const displayName = otherNickname || sessionId?.slice(-4) || 'USER';
          const key = otherNickname ?? displayName;
          const isFriend = friendsSetRef.current.has(key); // 항상 최신 친구목록 사용
          const visibility = otherVisibility || 'all'; // 서버 미설정 시 전체공개

          // 상대방의 공개 범위 기준으로만 표시 결정
          let allowedByUserVisibility = false;
          if (visibility === 'all') {
            allowedByUserVisibility = true;
          } else if (visibility === 'friends') {
            allowedByUserVisibility = isFriend;
          } else if (visibility === 'none') {
            allowedByUserVisibility = false;
          }

          const shouldShow = allowedByUserVisibility;

          if (!others.has(sessionId)) {
            // 새 유저 → 마커 생성
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

            if (shouldShow) {
              overlay.setMap(map);
            } else {
              overlay.setMap(null);
            }

            others.set(sessionId, {
              overlay,
              el,
              nickname: displayName,
              visibility,
            });
          } else {
            // 기존 유저 → 위치/표시 여부 갱신
            const info = others.get(sessionId);
            info.overlay.setPosition(pos);
            info.visibility = visibility;

            if (shouldShow) {
              info.overlay.setMap(map);
            } else {
              info.overlay.setMap(null);
            }
          }

          // 현재 보이는 마커 수 카운트
          let visibleCount = 0;
          others.forEach((info) => {
            if (info.overlay.getMap()) {
              visibleCount++;
            }
          });
          setNearbyCount(visibleCount);
        },

        onClose: (sessionId) => {
          const info = othersRef.current.get(sessionId);
          if (info) {
            info.overlay.setMap(null);
            othersRef.current.delete(sessionId);
            // 남은 사람 중 보이는 마커 수 다시 계산
            let visibleCount = 0;
            othersRef.current.forEach((i) => {
              if (i.overlay.getMap()) visibleCount++;
            });
            setNearbyCount(visibleCount);
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

            // 내 위치 공유 설정에 따라 서버로 보낼지 결정
            if (locationShareRef.current) {
              const visibilityToUse = locationVisibilityRef.current;
              // 서버가 이 visibility를 이용해서 브로드캐스트에 포함
              ws.sendLoc(lat, lng, visibilityToUse);
            }
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
  }, [navigate, nickname, userId]); // 설정값은 ref/상태로만 사용

  const visibilityLabel =
    locationVisibility === 'all'
      ? '전체🌍'
      : locationVisibility === 'friends'
      ? '친구 👥'
      : '비공개';

  return (
    <div className="map-page-layout">
      <header className="map-header">
        <div className="header-title">
          <h1>캠프맵</h1>
          <span>
            {nearbyCount === 0
              ? '주변 아무도 없음'
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
        <div className="location-status">
          {locationShare ? '위치 공유 중' : '위치 비공개'}
        </div>
        <div className="privacy-info">
          위치 공개 범위 : {visibilityLabel}
        </div>
        {friendsCount > 0 && (
          <div className="friends-count-label">
            내 친구 {friendsCount}명 등록됨
          </div>
        )}
      </div>

      <div ref={mapRef} className="map-container" />

      <BottomNav />
    </div>
  );
}
