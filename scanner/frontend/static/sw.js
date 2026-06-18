const CACHE_NAME = 'ar-chinese-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index/',
    '/levels/',
    '/lesson/1/',
    '/static/css/main.css',
    '/static/css/lesson.css',
    '/static/css/level.css',
    '/static/css/scanner.css',
    '/static/js/home.js',
    '/static/js/levels.js',
    '/static/js/lesson.js',
    '/static/js/camera.js',
    '/static/js/themes.js',
    '/static/js/scan_object.js',
    '/static/js/dictionary.js',
    '/static/js/word.js',
    '/static/js/level.js',
    '/static/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Устанавливаем Service Worker и кэшируем ресурсы
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            self.skipWaiting();
        })
    );
});

// Активируем Service Worker и удаляем старые кэши
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Обрабатываем запросы
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Возвращаем кэшированный ресурс, если он есть
            if (cachedResponse) {
                return cachedResponse;
            }

            // Иначе запрашиваем из сети
            return fetch(event.request).then((networkResponse) => {
                // Обновляем кэш
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            }).catch(() => {
                // Если нет сети и нет кэша, возвращаем fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
