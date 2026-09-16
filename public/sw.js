const CACHE_NAME = 'daily-income-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Chỉ cache các request HTTP GET cục bộ, bỏ qua Supabase / chrome-extension
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('supabase.co')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch network in background to keep cache updated
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});

// ==============================================================================
// WEB PUSH NOTIFICATION HANDLER (Chạy ngầm khi tắt app / đóng trình duyệt)
// ==============================================================================
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {
        title: 'DailyIncome',
        body: event.data.text(),
      };
    }
  } else {
    data = {
      title: 'DailyIncome',
      body: 'Bạn có lời nhắc thu nhập mới!',
    };
  }

  const title = data.title || 'DailyIncome';
  const options = {
    body: data.body || data.message || 'Hãy kiểm tra và ghi nhận thu nhập hôm nay của bạn.',
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || `daily-income-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    data: {
      url: data.url || '/',
      actionDate: data.actionDate,
      actionTab: data.actionTab,
    },
    actions: [
      { action: 'open_app', title: 'Mở ứng dụng' },
      { action: 'close', title: 'Bỏ qua' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ==============================================================================
// XỬ LÝ KHI NGƯỜI DÙNG NHẤP VÀO THÔNG BÁO TRÊN MÀN HÌNH KHÓA / THANH THÔNG BÁO
// ==============================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Nếu đã có tab/app đang mở, chuyển tiêu điểm sang tab đó
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Nếu chưa có tab nào mở, mở cửa sổ mới
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ==============================================================================
// LẮNG NGHE ĐIỀU KHIỂN TỪ REACT CLIENT
// ==============================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delayMs } = event.data;
    if (delayMs && delayMs > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'scheduled-reminder',
        });
      }, delayMs);
    }
  }
});
