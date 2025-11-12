import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 8081,
        proxy: {
            "/api": { target: "http://localhost:8080", changeOrigin: true },
            "/tracking": { target: "http://localhost:8080", ws: true, changeOrigin: true }
        }
    }
});
