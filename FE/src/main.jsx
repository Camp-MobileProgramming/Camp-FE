import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// 서비스 워커 등록
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[Service Worker] 등록 성공:", registration.scope);

        // 업데이트 확인
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // 새 버전이 설치되었을 때 사용자에게 알림 (선택사항)
                console.log("[Service Worker] 새 버전이 설치되었습니다. 새로고침하세요.");
                // 여기에 사용자에게 새로고침 알림을 표시하는 로직 추가 가능
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("[Service Worker] 등록 실패:", error);
      });

    // 서비스 워커 업데이트 확인 (페이지 로드 시마다)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("[Service Worker] 새 버전으로 업데이트되었습니다.");
      // 자동 새로고침 (선택사항)
      // window.location.reload();
    });
  });
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
