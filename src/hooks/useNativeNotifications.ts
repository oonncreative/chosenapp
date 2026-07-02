import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  getSalmoForHour,
  getMotivacionalForHour,
  isWithinQuietHours,
  NOTIFICATION_TITLES,
} from '@/lib/psalms';
import { getRandomSalmo, getRandomMotivacional } from '@/lib/data';
import { getPreferredHours } from '@/lib/usagePattern';
import { pickSilenceWord } from '@/lib/silenceWords';
import { toggleFavorite, isFavorite } from '@/lib/favorites';

const ENABLED_KEY = 'chosen_notifications_enabled';
const NATIVE_SCHEDULED_KEY = 'chosen_native_scheduled_date';

const MOOD_ACTION_TYPE = 'MOOD_CHECK';
const MSG_TYPE_ACTION_TYPE = 'MSG_TYPE_CHECK';
const MSG_QUICK_ACTION_TYPE = 'MSG_QUICK';
const MOOD_TO_CATEGORY: Record<string, string> = {
  mood_happy: 'Feliz',
  mood_neutral: 'Preciso de paz',
  mood_sad: 'Triste',
  mood_angry: 'Nervoso',
};

function nextWeekday(from: Date, weekday: number): Date {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

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

    // Registra ações do mood check-in (idempotente)
    try {
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: MOOD_ACTION_TYPE,
            actions: [
              { id: 'mood_happy', title: '😊 Bem' },
              { id: 'mood_neutral', title: '😐 Mais ou menos' },
              { id: 'mood_sad', title: '😢 Triste' },
              { id: 'mood_angry', title: '😤 Irritado' },
            ],
          },
          {
            id: MSG_TYPE_ACTION_TYPE,
            actions: [
              { id: 'msg_salmo', title: '📖 Salmo' },
              { id: 'msg_moti', title: '✨ Motivação' },
            ],
          },
          {
            id: MSG_QUICK_ACTION_TYPE,
            actions: [
              { id: 'msg_amem', title: '🙏 Amém' },
              { id: 'msg_save', title: '💛 Salvar' },
              { id: 'msg_next', title: '⏭️ Próxima' },
            ],
          },
        ],
      });
    } catch {}

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const DEFAULT_SCHEDULE = [
      { hour: 8,  minute: 8,  title: 'Bom dia. Começa o dia com isso 👇' },
      { hour: 10, minute: 10, title: 'Uma pausa pra recarregar 👇' },
      { hour: 12, minute: 12, title: 'Pausa do almoço. Uma palavra pra você 👇' },
      { hour: 14, minute: 14, title: 'Respira. Tem algo pra você 👇' },
      { hour: 18, minute: 18, title: 'Como foi seu dia? Trouxemos algo especial 👇' },
      { hour: 21, minute: 21, title: 'Antes de dormir, guarda isso no coração 👇' },
    ];

    // Se já temos amostras suficientes, usa as top horas do usuário.
    const learned = getPreferredHours(6);
    const SCHEDULE = learned
      ? learned.map((h) => ({
          hour: h,
          minute: h, // mantém variação tipo 8h08, 14h14
          title: 'Uma palavra escolhida pra você 👇',
        }))
      : DEFAULT_SCHEDULE;

    const notifications = [];
    const now = new Date();
    let id = 1;

    for (let day = 0; day <= 6; day++) {
      SCHEDULE.forEach((slot, slotIndex) => {
        const scheduledDate = new Date(now);
        scheduledDate.setDate(now.getDate() + day);
        scheduledDate.setHours(slot.hour, slot.minute, 0, 0);

        if (scheduledDate > now) {
          // Alterna a cada notificação: pares → salmo, ímpares → motivacional.
          const useSalmo = (day * SCHEDULE.length + slotIndex) % 2 === 0;
          const item = useSalmo
            ? getSalmoForHour(scheduledDate)
            : getMotivacionalForHour(scheduledDate);
          const body =
            item.ref === 'CHOSEN' ? item.text : `${item.ref} — ${item.text}`;
          notifications.push({
            id,
            title: slot.title,
            body,
            schedule: { at: scheduledDate },
            actionTypeId: MSG_QUICK_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: {
              url: '/home',
              // Contexto pra ações rápidas (Amém / Salvar / Próxima)
              msg: {
                id: `notif-${scheduledDate.getTime()}`,
                categoria: useSalmo ? 'Motivação' : 'Motivação',
                ref: item.ref,
                text: item.text,
              },
            },
          } as any);
          id++;
        }
      });
    }

    // Palavra do silêncio — sábados às 09:09, próximas 4 semanas.
    for (let week = 0; week < 4; week++) {
      const d = nextWeekday(now, 6);
      d.setDate(d.getDate() + week * 7);
      d.setHours(9, 9, 0, 0);
      if (d > now) {
        const seed = d.getFullYear() * 1000 + Math.floor(d.getTime() / (24 * 3600 * 1000));
        const word = pickSilenceWord(seed);
        notifications.push({
          id: id++,
          title: 'Palavra do silêncio',
          body: word,
          schedule: { at: d },
          smallIcon: 'ic_stat_chosen',
          iconColor: '#f1f26c',
          extra: { url: `/silencio?w=${encodeURIComponent(word)}` },
        });
      }
    }

    // Palavra do silêncio — dias alternados às 19:19 (próximas 2 semanas).
    for (let day = 1; day <= 14; day += 2) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(19, 19, 0, 0);
      if (d > now && d.getDay() !== 6) {
        // evita duplicar com o slot de sábado 09:09
        const seed = d.getFullYear() * 1000 + Math.floor(d.getTime() / (24 * 3600 * 1000));
        const word = pickSilenceWord(seed + 1);
        notifications.push({
          id: id++,
          title: 'Palavra do silêncio',
          body: word,
          schedule: { at: d },
          smallIcon: 'ic_stat_chosen',
          iconColor: '#f1f26c',
          extra: { url: `/silencio?w=${encodeURIComponent(word)}` },
        });
      }
    }

    // Como você tá agora? — todos os dias às 18h, próximas 2 semanas.
    for (let day = 0; day < 14; day++) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(18, 0, 0, 0);
      if (d > now) {
          notifications.push({
            id: id++,
            title: 'Como você tá agora?',
            body: 'Toca no que você sente que escolho a palavra certa.',
            schedule: { at: d },
            actionTypeId: MOOD_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'mood' },
          } as any);
      }
    }

    // Check-in de mensagem — todos os dias às 11h, próximas 2 semanas.
    for (let day = 0; day < 14; day++) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(11, 0, 0, 0);
      if (d > now) {
        notifications.push({
          id: id++,
          title: 'Se fosse pra receber uma mensagem agora…',
          body: 'Você gostaria de um salmo ou uma motivação?',
          schedule: { at: d },
          actionTypeId: MSG_TYPE_ACTION_TYPE,
          smallIcon: 'ic_stat_chosen',
          iconColor: '#f1f26c',
          extra: { url: '/home', type: 'msg_type' },
        } as any);
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
          LocalNotifications.addListener('localNotificationActionPerformed', (notif: any) => {
            try {
              const actionId = notif?.actionId as string | undefined;
              const extraUrl = notif?.notification?.extra?.url as string | undefined;
              const extraMsg = notif?.notification?.extra?.msg as
                | { id: string; categoria: string; ref: string; text: string }
                | undefined;

              // Ações rápidas em cima da mensagem enviada no push
              if (actionId === 'msg_amem') {
                // Só abre o app na tela inicial — nenhuma ação destrutiva.
                window.location.href = '/home';
                return;
              }
              if (actionId === 'msg_save' && extraMsg) {
                if (!isFavorite(extraMsg.id)) {
                  toggleFavorite({
                    id: extraMsg.id,
                    categoria: extraMsg.categoria,
                    ref: extraMsg.ref,
                    text: extraMsg.text,
                  });
                }
                window.location.href = '/escolhidas';
                return;
              }
              if (actionId === 'msg_next') {
                const { categoria, id } = getRandomSalmo();
                window.location.href = `/mensagem/${encodeURIComponent(categoria)}?color=%23f1f26c&id=${encodeURIComponent(id)}`;
                return;
              }

              // Check-in de tipo de mensagem
              if (actionId === 'msg_salmo') {
                const { categoria, id } = getRandomSalmo();
                window.location.href = `/mensagem/${encodeURIComponent(categoria)}?color=%23f1f26c&id=${encodeURIComponent(id)}`;
                return;
              }
              if (actionId === 'msg_moti') {
                const { categoria, id } = getRandomMotivacional();
                window.location.href = `/mensagem/${encodeURIComponent(categoria)}?color=%23f1f26c&id=${encodeURIComponent(id)}`;
                return;
              }
              const cat = actionId ? MOOD_TO_CATEGORY[actionId] : undefined;
              if (cat) {
                window.location.href = `/mensagem/${encodeURIComponent(cat)}?color=%23f1f26c&id=mood`;
                return;
              }
              if (extraUrl && extraUrl !== window.location.pathname) {
                window.location.href = extraUrl;
              }
            } catch {}
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
      let slot = 0;
      const alternated = (d: Date) =>
        slot++ % 2 === 0 ? getSalmoForHour(d) : getMotivacionalForHour(d);

      let interval: ReturnType<typeof setInterval> | null = null;
      const timeout = setTimeout(async () => {
        const item = alternated(new Date());
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
          const item2 = alternated(new Date());
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