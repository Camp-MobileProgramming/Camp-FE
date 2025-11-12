export function initMap() {
    const container = document.getElementById("map");
    const center = new kakao.maps.LatLng(37.5665, 126.9780);
    const map = new kakao.maps.Map(container, { center, level: 4 });

    const myMarker = new kakao.maps.Marker({ position: center });
    myMarker.setMap(map);

    const others = new Map();

    const ws = connectWS({
        userId: "user-" + Math.random().toString(36).slice(2,6),
        postId: "room-1",
        onJoinAck: (m) => { ws.sessionId = m.sessionId; },
        onLocation: (m) => {
            const { sessionId, lat, lng } = m;
            if (lat == null || lng == null) return;
            const pos = new kakao.maps.LatLng(lat, lng);

            if (ws.sessionId && sessionId === ws.sessionId) {
                myMarker.setPosition(pos);
                map.setCenter(pos);
            } else {
                if (!others.has(sessionId)) {
                    const mk = new kakao.maps.Marker({ position: pos });
                    mk.setMap(map);
                    others.set(sessionId, mk);
                } else {
                    others.get(sessionId).setPosition(pos);
                }
            }
        }
    });

    if (navigator.geolocation) {
        let last = 0; const MIN = 800;
        navigator.geolocation.watchPosition((p) => {
            const now = Date.now(); if (now - last < MIN) return; last = now;
            const lat = p.coords.latitude, lng = p.coords.longitude;
            const me = new kakao.maps.LatLng(lat, lng);
            myMarker.setPosition(me); map.setCenter(me);
            ws.sendLoc(lat, lng);
        }, (e)=>console.log("GPS 실패:", e), { enableHighAccuracy: true });
    }
}

function connectWS({ userId, postId, onJoinAck, onLocation }) {
    // 환경변수 우선: ws/wss 또는 경로(/tracking) 둘 다 지원
    const base = import.meta.env.VITE_WS_BASE || "/tracking";
    const wsUrl = base.startsWith("ws")
        ? base
        : `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}${base}`;

    const ws = new WebSocket(wsUrl);
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", userId, postId }));
    ws.onmessage = (ev) => {
        try {
            const msg = JSON.parse(ev.data);
            if (msg.type === "join") onJoinAck && onJoinAck(msg);
            if (msg.type === "loc")  onLocation && onLocation(msg);
        } catch (e) { console.log("WS parse error:", e); }
    };
    ws.onerror = (e) => console.log("WS error:", e);
    ws.onclose  = () => console.log("WS closed");
    ws.sendLoc = (lat, lng) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "loc", lat, lng }));
        }
    };
    return ws;
}
