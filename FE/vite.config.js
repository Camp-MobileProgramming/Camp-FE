// vite.config.js
console.log("[VITE CONFIG LOADED]");

import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",      // 외부 공개
    port: 8081,
    strictPort: true,

    // ngrok 도메인 허용 (주소가 바뀔 수 있으니 와일드카드까지)
    allowedHosts: ["uriel-radioactive-mariette.ngrok-free.dev", "*.ngrok-free.dev"],

    // HTTPS(ngrok) 환경에서 HMR(WebSocket)을 wss로 고정
    hmr: {
      protocol: "wss",
      host: "uriel-radioactive-mariette.ngrok-free.dev",
      clientPort: 443,
    },

    proxy: {
      "/api":      { target: "http://localhost:8080", changeOrigin: true },
      "/tracking": { target: "http://localhost:8080", changeOrigin: true, ws: true },
    },
  },
});
