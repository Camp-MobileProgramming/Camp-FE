import React from "react";
import { useEffect, useRef } from "react";
import { connectWS } from "../shared/ws.js";

export default function MapView() {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const myMarkerRef = useRef(null);
  const othersRef = useRef(new Map()); // sessionId -> Marker
  const wsRef = useRef(null);

  useEffect(() => {
    const { kakao } = window;
    kakao.maps.load(() => {
      // 1) Map init
      const center = new kakao.maps.LatLng(37.5665, 126.9780);
      const map = new kakao.maps.Map(mapRef.current, { center, level: 1 });
      kakaoMapRef.current = map;

      // 2) My marker
      const myMarker = new kakao.maps.Marker({ position: center, zIndex: 1000 });
      myMarker.setMap(map);
      myMarkerRef.current = myMarker;

      // 3) WebSocket connect
      const ws = connectWS({
        userId: "user-" + Math.random().toString(36).slice(2, 6),
        postId: "room-1",
        onJoinAck: (m) => { ws.sessionId = m.sessionId; },
        onLocation: (m) => {
          const { sessionId, lat, lng } = m;
          if (lat == null || lng == null) return;
          const pos = new kakao.maps.LatLng(lat, lng);

          if (ws.sessionId && sessionId === ws.sessionId) {
            myMarkerRef.current.setPosition(pos);
            map.setCenter(pos);
          } else {
            const others = othersRef.current;
            if (!others.has(sessionId)) {
              const mk = new kakao.maps.Marker({ position: pos, zIndex: 500 });
              mk.setMap(map);
              others.set(sessionId, mk);
            } else {
              others.get(sessionId).setPosition(pos);
            }
          }
        },
        onClose: (sessionId) => {
          const mk = othersRef.current.get(sessionId);
          if (mk) { mk.setMap(null); othersRef.current.delete(sessionId); }
        }
      });
      wsRef.current = ws;

      // 4) Geo watch → send & update
      if (navigator.geolocation) {
        let last = 0; const MIN = 800;
        const watchId = navigator.geolocation.watchPosition((p) => {
          const now = Date.now(); if (now - last < MIN) return; last = now;
          const lat = p.coords.latitude, lng = p.coords.longitude;
          const me = new kakao.maps.LatLng(lat, lng);
          myMarkerRef.current.setPosition(me);
          map.setCenter(me);
          ws.sendLoc(lat, lng);
        }, (e) => console.log("GPS 실패:", e), { enableHighAccuracy: true });

        // cleanup
        return () => {
          try { navigator.geolocation.clearWatch(watchId); } catch {}
          try { wsRef.current?.close(); } catch {}
          myMarkerRef.current?.setMap(null);
          othersRef.current.forEach(mk => mk.setMap(null));
          othersRef.current.clear();
        };
      }

      return () => {
        try { wsRef.current?.close(); } catch {}
        myMarkerRef.current?.setMap(null);
        othersRef.current.forEach(mk => mk.setMap(null));
        othersRef.current.clear();
      };
    });
  }, []);

  return (
    <>
      <header style={headerStyle}>📍 실시간 위치 테스트 맵</header>
      <div ref={mapRef} style={mapStyle} />
      <footer style={footerStyle}>Powered by Kakao Maps</footer>
    </>
  );
}

const headerStyle = {
  position: "fixed", top: 0, left: 0, right: 0, height: 56,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "linear-gradient(90deg, #377dff, #6aa9ff)", color: "#fff",
  fontWeight: 600, fontSize: "1.1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 1000
};
const mapStyle = {
  position: "absolute", top: 56, bottom: 0, width: "100%", height: "calc(100dvh - 56px)",
  borderRadius: "12px 12px 0 0", boxShadow: "0 -2px 20px rgba(0,0,0,0.05) inset", overflow: "hidden"
};
const footerStyle = {
  position: "fixed", bottom: 12, right: 16, fontSize: 12, color: "#7a8fa6",
  background: "rgba(255,255,255,.7)", backdropFilter: "blur(6px)",
  borderRadius: 8, padding: "4px 8px", boxShadow: "0 2px 6px rgba(0,0,0,.1)"
};
