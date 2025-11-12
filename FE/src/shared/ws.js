export function connectWS({ userId, postId, onJoinAck, onLocation, onClose }) {
  const base = import.meta.env.VITE_WS_BASE || "/tracking";
  const wsUrl = base.startsWith("ws")
    ? base
    : `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}${base}`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", userId, postId }));
  };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === "join") onJoinAck && onJoinAck(msg);     // {sessionId,...}
      if (msg.type === "loc")  onLocation && onLocation(msg);   // {sessionId,lat,lng}
      if (msg.type === "leave" && msg.sessionId && onClose) onClose(msg.sessionId);
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
