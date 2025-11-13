// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8081,
    strictPort: false,  // ← 포트 충돌 시 다른 포트 사용 허용

    // HMR 설정: localhost 개발 환경 최적화
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 8081
    },

    // API 프록시는 선택사항
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});
