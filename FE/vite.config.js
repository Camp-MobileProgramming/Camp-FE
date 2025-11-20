// vite.config.js
console.log("[VITE CONFIG LOADED]");

import { defineConfig } from "vite";

const useNgrokHmr = process.env.NGROK_HMR === "true";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8081,
    strictPort: true,

    // 로컬 + ngrok 모두 허용
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "uriel-radioactive-mariette.ngrok-free.dev",
      "*.ngrok-free.dev",
    ],

    // NGROK_HMR=true로 실행할 때만 HMR을 ngrok에 묶음
    ...(useNgrokHmr && {
      hmr: {
        protocol: "wss",
        host: "uriel-radioactive-mariette.ngrok-free.dev",
        clientPort: 443,
      },
    }),

    proxy: {
      "/api":      { target: "http://localhost:8080", changeOrigin: true },
      "/tracking": { target: "http://localhost:8080", changeOrigin: true, ws: true },
    },
  },
});
