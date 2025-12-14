// vite.config.js
console.log("[VITE CONFIG LOADED]");

import { defineConfig } from "vite";

// ngrok 환경인지 확인 (npm run dev 때는 보통 false)
const useNgrokHmr = process.env.NGROK_HMR === "true";

export default defineConfig({
  server: {
    host: "0.0.0.0", // 모든 IP 접속 허용 (ngrok 연동 필수)
    port: 8081,      // 프론트엔드는 8081 포트 사용
    strictPort: true,

    // ngrok 등 외부 접속 허용 설정 (보안 경고 방지)
    allowedHosts: true, 

    // 프록시 설정: /api, /tracking, /chat-ws 요청을 백엔드(8080)로 토스
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080", // localhost 대신 IP 사용 (더 안정적)
        changeOrigin: true,
        secure: false,
      },
      "/tracking": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        ws: true, // 웹소켓 허용
      },
      "/chat-ws": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        ws: true,
      },
    },

    // ngrok HMR 설정 (개발자 편의용, 필수는 아님)
    ...(useNgrokHmr && {
      hmr: {
        protocol: "wss",
        host: "uriel-radioactive-mariette.ngrok-free.dev",
        clientPort: 443,
      },
    }),
  },
});