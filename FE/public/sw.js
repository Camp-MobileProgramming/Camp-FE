// 서비스 워커 버전 (업데이트 시 변경)
const CACHE_NAME = 'campus-friend-v1';
const RUNTIME_CACHE = 'campus-friend-runtime-v1';

// 캐시할 정적 리소스 목록
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/main.jsx',
  '/src/App.jsx',
];

// 설치 이벤트: 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  // 즉시 활성화 (기존 서비스 워커 대기 중인 것 무시)
  self.skipWaiting();
});

// 활성화 이벤트: 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 현재 버전이 아닌 캐시 삭제
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 모든 클라이언트에 즉시 제어권 부여
  return self.clients.claim();
});

// fetch 이벤트: 네트워크 우선, 실패 시 캐시 사용 (Network First)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 외부 API나 WebSocket은 캐싱하지 않음
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/tracking') ||
    url.pathname.startsWith('/chat-ws') ||
    url.protocol === 'ws:' ||
    url.protocol === 'wss:'
  ) {
    return; // 네트워크 요청 그대로 진행
  }

  // 네트워크 우선 전략 (Network First)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 성공한 응답을 캐시에 저장
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 찾기
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 캐시에도 없으면 오프라인 페이지 반환 (선택사항)
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  // 오프라인 중 저장된 데이터를 동기화하는 로직 추가 가능
});

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Campus Friend';
  const options = {
    body: data.body || '새로운 알림이 있습니다',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'default',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 창이 있으면 포커스
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

