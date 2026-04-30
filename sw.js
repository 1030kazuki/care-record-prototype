// ===== Service Worker: 介護実施記録アプリ PWA =====
// キャッシュ戦略:
//   - HTML/JS/CSS: cache:'no-store' でブラウザHTTPキャッシュをバイパスし、常に最新を取得
//   - フォールバック: オフライン時のみキャッシュから返す
const CACHE_NAME = 'care-record-v3-20260501';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ネットワーク優先、フォールバックでキャッシュ
// ★ cache:'no-store' でブラウザHTTPキャッシュを完全バイパス（古いHTMLが返る問題を防止）
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // GET以外・http/https以外はスキップ
  if (event.request.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone).catch(() => {});
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
