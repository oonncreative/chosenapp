// Script do Service Worker para lidar com notificações locais
const CACHE_NAME = 'ressoa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const MOOD_TO_CATEGORY = {
    mood_happy: 'Feliz',
    mood_neutral: 'Preciso de paz',
    mood_sad: 'Triste',
    mood_angry: 'Nervoso',
  };
  let targetUrl = (event.notification.data && event.notification.data.url) || '/home';
  if (event.action && MOOD_TO_CATEGORY[event.action]) {
    targetUrl = '/mensagem/' + encodeURIComponent(MOOD_TO_CATEGORY[event.action]) + '?color=%23f1f26c&id=mood';
  }
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          try { client.navigate(targetUrl); } catch (e) {}
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// Listener para mensagens do app (para agendar notificações simuladas se necessário)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // Nota: Service Workers não podem usar setTimeout por longos períodos confiavelmente.
    // Para uma experiência real de PWA, usaríamos a Periodic Sync API ou Push API.
    // Aqui mostramos uma notificação imediata como teste se solicitado.
    if (event.data.immediate) {
      self.registration.showNotification('Ressoa', {
        body: event.data.message || 'É hora de Ressoar uma nova mensagem de fé.',
        icon: '/logo-ressoa.png',
        badge: '/logo-ressoa.png',
      });
    }
  }
});
