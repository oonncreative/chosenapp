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
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/home');
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
