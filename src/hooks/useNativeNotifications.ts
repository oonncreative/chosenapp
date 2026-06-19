import { useEffect } from 'react';
import { toast } from 'sonner';
import { getChosenForHour, isWithinQuietHours, NOTIFICATION_TITLES, pickNotificationBody } from '@/lib/psalms';

const ENABLED_KEY = 'chosen_notifications_enabled';
const NATIVE_SCHEDULED_KEY = 'chosen_native_scheduled_date';

function isCapacitor(): boolean {
  return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
}

function pickTitle(): string {
  return NOTIFICATION_TITLES[Math.floor(Math.random() * NOTIFICATION_TITLES.length)];
}

async function scheduleNativeNotifications() {
  try {
    console.log('scheduleNativeNotifications: iniciando');
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') return;

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const SCHEDULE = [
      { hour: 8,  title: 'Bom dia. Começa o dia com isso 👇' },
      { hour: 12, title: 'Pausa do almoço. Uma palavra pra você 👇' },
      { hour: 18, title: 'Como foi seu dia? Trouxemos algo especial 👇' },
      { hour: 21, title: 'Antes de dormir, guarda isso no coração 👇' },
    ];

    const notifications = [];
    const now = new Date();
    let id = 1;

    for (let day = 0; day <= 6; day++) {
      for (const slot of SCHEDULE) {
        const scheduledDate = new Date(now);
        scheduledDate.setDate(now.getDate() + day);
        scheduledDate.setHours(slot.hour, 0, 5, 0);

        if (scheduledDate > now) {
          const item = getChosenForHour(scheduledDate);
          notifications.push({
            id,
            title: slot.title,
            body: `${item.ref} — ${item.text}`,
            schedule: { at: scheduledDate },
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home' },
          });
          id++;
        }
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      try {
        localStorage.setItem(NATIVE_SCHEDULED_KEY, new Date().toDateString());
      } catch {}
    }
  } catch (err) {
    console.error('Erro ao agendar notificações nativas:', err);
  }
}

// Reagenda se ainda não agendou hoje
async function scheduleIfNeeded(force = false) {
  try {
    if (!force) {
      const lastScheduled = localStorage.getItem(NATIVE_SCHEDULED_KEY);
      const today = new Date().toDateString();
      if (lastScheduled === today) return;
    }
    await scheduleNativeNotifications();
  } catch {}
}

export async function requestNativeNotificationsPermission(): Promise<boolean> {
  if (!isCapacitor()) {
    // fallback para web
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      try { localStorage.setItem(ENABLED_KEY, 'true'); } catch {}
    }
    return result === 'granted';
  }

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display === 'prompt' || permission.display === 'prompt-with-rationale') {
      permission = await LocalNotifications.requestPermissions();
    }
    if (permission.display === 'granted') {
      try { localStorage.setItem(ENABLED_KEY, 'true'); } catch {}
      await scheduleNativeNotifications();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Erro ao pedir permissão de notificação nativa:', err);
    return false;
  }
}

export async function scheduleTestNotification() {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const testDate = new Date(Date.now() + 10000); // 10 segundos
    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: 'Chosen ✨',
        body: 'As notificações estão funcionando!',
        schedule: { at: testDate },
      }]
    });
  } catch (err) {
    console.error('Erro ao agendar notificação de teste:', err);
  }
}

// Hook principal — substitui useHourlyNotifications no app nativo
export function useNativeNotifications() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const enabled = localStorage.getItem(ENABLED_KEY) !== 'false';
    if (!enabled) return;

    if (isCapacitor()) {
      try {
        // No app nativo: agenda notificações locais via SO
        void scheduleIfNeeded();

        // Listeners: toque na notificação + reagendamento quando o app volta do background
        const cleanups: Array<() => void> = [];

        import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
          LocalNotifications.addListener('localNotificationActionPerformed', () => {
            // Já está no app, não precisa navegar
          }).then(h => cleanups.push(() => h.remove())).catch(() => {});
        }).catch(() => {});

        // Reagenda sempre que o app volta para o primeiro plano,
        // garantindo que a janela de 4 dias avance continuamente
        import('@capacitor/app').then(({ App }) => {
          App.addListener('appStateChange', (state) => {
            if (state.isActive) {
              void scheduleIfNeeded(true);
            }
          }).then(h => cleanups.push(() => h.remove())).catch(() => {});
        }).catch(() => {});

        return () => {
          cleanups.forEach(fn => fn());
        };
      } catch (err) {
        console.error('Erro fatal em useNativeNotifications:', err);
        return () => {};
      }
    } else {
      // No browser/PWA: mantém comportamento atual com setTimeout
      const next = new Date();
      next.setMinutes(0, 5, 0);
      next.setHours(next.getHours() + 1);
      const msUntilNext = next.getTime() - Date.now();

      let interval: ReturnType<typeof setInterval> | null = null;
      const timeout = setTimeout(async () => {
        const item = pickNotificationBody();
        const title = pickTitle();
        const body = item.ref === 'CHOSEN' ? item.text : `${item.ref} — ${item.text}`;
        if (document.visibilityState === 'visible') {
          toast(title, { description: body, duration: 8000 });
        }
        if (isWithinQuietHours() && 'serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification(title, {
            body,
            icon: '/logo-chosen.png',
            badge: '/logo-chosen.png',
            tag: 'chosen-hourly',
            data: { url: '/home' },
          });
        }
        interval = setInterval(async () => {
          const item2 = pickNotificationBody();
          const title2 = pickTitle();
          const body2 = item2.ref === 'CHOSEN' ? item2.text : `${item2.ref} — ${item2.text}`;
          if (document.visibilityState === 'visible') {
            toast(title2, { description: body2, duration: 8000 });
          }
        }, 60 * 60 * 1000);
      }, Math.max(1000, msUntilNext));

      return () => {
        clearTimeout(timeout);
        if (interval) clearInterval(interval);
      };
    }
  }, []);
}