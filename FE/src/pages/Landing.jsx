import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className="landing" style={styles.landing}>
      <div className="card" style={styles.card}>
        <div className="title" style={styles.title}>📍 캠프맵</div>
        <div className="sub" style={styles.sub}>버튼을 누르면 지도가 열리고 위치 공유가 시작됩니다.</div>
        <button className="btn" style={styles.btn} onClick={() => nav("/map")}>
          지도 열기
        </button>
      </div>
    </div>
  );
}

const styles = {
  landing: {
    position: "fixed", inset: 0, display: "grid", placeItems: "center",
    background: "linear-gradient(160deg, #eef3ff, #f7fbff)"
  },
  card: {
    width: "min(92vw, 420px)", background: "#fff", borderRadius: 16,
    boxShadow: "0 12px 28px rgba(0,0,0,.08)", padding: 28, textAlign: "center"
  },
  title: { fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 },
  sub:   { fontSize: 14, color: "#64748b", marginBottom: 20 },
  btn:   {
    width: "100%", padding: "14px 16px", borderRadius: 12, border: "none", cursor: "pointer",
    background: "linear-gradient(90deg, #2d68ff, #6aa9ff)", color: "#fff", fontWeight: 700, fontSize: 15,
    boxShadow: "0 8px 18px rgba(45,104,255,.25)"
  }
};
