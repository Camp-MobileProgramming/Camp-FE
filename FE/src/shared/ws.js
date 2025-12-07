export function connectWS({ userId, postId, nickname, onJoinAck, onLocation, onClose }) {
  const base = import.meta.env.VITE_WS_BASE || "/tracking";
  const wsUrl = base.startsWith("ws")
    ? base
    : `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}${base}`;
  console.log("[WS] connecting to", wsUrl);
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: "join",
      userId,
      postId,
      nickname,
    }));
  };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      console.log("[WS MESSAGE]",msg);
      if (msg.type === "join") {
        onJoinAck && onJoinAck(msg);
      }
      if (msg.type === "loc") {
        // 여기로 locationVisibility도 같이 들어올 거라고 가정
        // { type: "loc", sessionId, lat, lng, nickname, locationVisibility, ts, ... }
        onLocation && onLocation(msg);
      }
      if (msg.type === "leave" && msg.sessionId && onClose) {
        onClose(msg.sessionId);
      }
    } catch (e) {
      console.log("WS parse error:", e);
    }
  };

  ws.onerror = (e) => console.log("WS error:", e);
  ws.onclose  = () => console.log("WS closed");

  //visibility 같이 보내도록 수정
  ws.sendLoc = (lat, lng, visibility) => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log("[WS] send loc", { lat, lng, visibility })
      ws.send(JSON.stringify({
        type: "loc",
        lat,
        lng,
        locationVisibility: visibility, 
      }));
    }
  };

  return ws;
}
