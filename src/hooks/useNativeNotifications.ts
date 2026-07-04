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
import { getNotificationIntensity } from '@/lib/notificationPrefs';

const ENABLED_KEY = 'chosen_notifications_enabled';
const NATIVE_SCHEDULED_KEY = 'chosen_native_scheduled_date';

const MOOD_ACTION_TYPE = 'MOOD_CHECK';
const MSG_TYPE_ACTION_TYPE = 'MSG_TYPE_CHECK';
const MSG_QUICK_ACTION_TYPE = 'MSG_QUICK';
const MORNING_MOOD_ACTION_TYPE = 'MORNING_MOOD';
const TALK_INVITE_ACTION_TYPE = 'TALK_INVITE';
const NEED_CHECK_ACTION_TYPE = 'NEED_CHECK';
const MICRO_CHECK_ACTION_TYPE = 'MICRO_CHECK';
const NIGHT_WORD_ACTION_TYPE = 'NIGHT_WORD';
const GRATITUDE_ACTION_TYPE = 'GRATITUDE';

const MOOD_TO_CATEGORY: Record<string, string> = {
  mood_happy: 'Feliz',
  mood_neutral: 'Preciso de paz',
  mood_sad: 'Triste',
  mood_angry: 'Nervoso',
};

// Mapeamento das novas ações interativas para categorias existentes.
const MORNING_MOOD_TO_CATEGORY: Record<string, string> = {
  morning_tired: 'Preciso de paz',
  morning_grateful: 'Feliz',
  morning_anxious: 'Ansiedade',
  morning_calm: 'Feliz',
};
const NEED_TO_CATEGORY: Record<string, string> = {
  need_force: 'Força',
  need_peace: 'Preciso de paz',
  need_joy: 'Feliz',
  need_love: 'Feliz',
};
const DAY_MOOD_TO_CATEGORY: Record<string, string> = {
  day_good: 'Feliz',
  day_normal: 'Preciso de paz',
  day_hard: 'Triste',
  day_stress: 'Nervoso',
};
const NIGHT_WORD_TO_CATEGORY: Record<string, string> = {
  night_peace: 'Preciso de paz',
  night_gratitude: 'Feliz',
  night_hope: 'Esperança',
};
const MICRO_TO_CATEGORY: Record<string, string> = {
  micro_ok: 'Feliz',
  micro_not_ok: 'Preciso de paz',
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
          {
            id: MORNING_MOOD_ACTION_TYPE,
            actions: [
              { id: 'morning_tired', title: '😴 Cansado' },
              { id: 'morning_grateful', title: '🙏 Grato' },
              { id: 'morning_anxious', title: '😟 Ansioso' },
              { id: 'morning_calm', title: '🌤️ Tranquilo' },
            ],
          },
          {
            id: TALK_INVITE_ACTION_TYPE,
            actions: [
              { id: 'talk_yes', title: '💛 Sim, quero' },
              { id: 'talk_word', title: '📖 Só uma palavra' },
              { id: 'talk_later', title: '⏭️ Depois' },
            ],
          },
          {
            id: NEED_CHECK_ACTION_TYPE,
            actions: [
              { id: 'need_force', title: '🙏 Força' },
              { id: 'need_peace', title: '🕊️ Paz' },
              { id: 'need_joy', title: '✨ Ânimo' },
              { id: 'need_love', title: '❤️ Carinho' },
            ],
          },
          {
            id: MICRO_CHECK_ACTION_TYPE,
            actions: [
              { id: 'micro_ok', title: '👍 Tô' },
              { id: 'micro_not_ok', title: '😔 Nem tanto' },
            ],
          },
          {
            id: NIGHT_WORD_ACTION_TYPE,
            actions: [
              { id: 'night_peace', title: '🕊️ Paz' },
              { id: 'night_gratitude', title: '🙏 Gratidão' },
              { id: 'night_hope', title: '💛 Esperança' },
            ],
          },
          {
            id: GRATITUDE_ACTION_TYPE,
            actions: [
              { id: 'grat_save', title: '💛 Salvar momento' },
              { id: 'grat_later', title: '⏭️ Amanhã' },
            ],
          },
        ],
      });
    } catch {}

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const intensity = getNotificationIntensity();

    // Slots de "palavra pronta" (salmo/motivação alternado) por intensidade.
    const WORD_SCHEDULE_PRESENT = [
      { hour: 8,  minute: 8,  title: 'Bom dia. Começa o dia com isso 👇' },
      { hour: 10, minute: 10, title: 'Uma pausa pra recarregar 👇' },
      { hour: 12, minute: 12, title: 'Pausa do almoço. Uma palavra pra você 👇' },
      { hour: 14, minute: 14, title: 'Respira. Tem algo pra você 👇' },
      { hour: 18, minute: 18, title: 'Fim de tarde — uma palavra pra você 👇' },
      { hour: 21, minute: 21, title: 'Antes de dormir, guarda isso no coração 👇' },
    ];
    const WORD_SCHEDULE_NORMAL = WORD_SCHEDULE_PRESENT;
    const WORD_SCHEDULE_LIGHT = [
      { hour: 8,  minute: 8,  title: 'Bom dia. Começa o dia com isso 👇' },
      { hour: 12, minute: 12, title: 'Pausa do almoço. Uma palavra pra você 👇' },
      { hour: 18, minute: 18, title: 'Fim de tarde — uma palavra pra você 👇' },
      { hour: 21, minute: 21, title: 'Antes de dormir, guarda isso no coração 👇' },
    ];
    const DEFAULT_SCHEDULE =
      intensity === 'light'
        ? WORD_SCHEDULE_LIGHT
        : intensity === 'normal'
        ? WORD_SCHEDULE_NORMAL
        : WORD_SCHEDULE_PRESENT;

    // Se já temos amostras suficientes, usa as top horas do usuário.
    // No modo "leve" mantemos os 4 slots fixos pra não estourar o volume.
    const learned = intensity === 'light' ? null : getPreferredHours(6);
    const SCHEDULE = learned
      ? learned.map((h) => ({
          hour: h,
          minute: h, // mantém variação tipo 8h08, 14h14
          title: 'Uma palavra escolhida pra você 👇',
        }))
      : DEFAULT_SCHEDULE;

    const notifications: any[] = [];
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
                categoria: 'Motivação',
                ref: item.ref,
                text: item.text,
              },
            },
          } as any);
          id++;
        }
      });
    }

    // ===== Extras por intensidade =====
    // "light" = apenas as palavras acima. Sai daqui.
    if (intensity === 'light') {
      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        try { localStorage.setItem(NATIVE_SCHEDULED_KEY, new Date().toDateString()); } catch {}
      }
      return;
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

    // Como foi seu dia até agora? — todos os dias às 17h, próximas 2 semanas.
    for (let day = 0; day < 14; day++) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(17, 0, 0, 0);
      if (d > now) {
          notifications.push({
            id: id++,
            title: 'Como foi seu dia até agora?',
            body: 'Toca no que você sentiu — escolho uma palavra pro momento.',
            schedule: { at: d },
            actionTypeId: intensity === 'present' ? 'DAY_MOOD' : MOOD_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'mood' },
          } as any);
      }
    }

    // ===== Modo "normal" pára por aqui (mood 17h + tipo 11h abaixo). =====
    // No modo "present" adicionamos os 5 check-ins interativos extras.

    // Check-in de tipo de mensagem — 11h (normal) ou substituído por TALK_INVITE (present).
    for (let day = 0; day < 14; day++) {
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(11, 0, 0, 0);
      if (d > now && intensity === 'normal') {
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

    if (intensity === 'present') {
      // 07:00 — Bom dia. Como você acordou hoje?
      for (let day = 0; day < 14; day++) {
        const d = new Date(now);
        d.setDate(now.getDate() + day);
        d.setHours(7, 0, 0, 0);
        if (d > now) {
          notifications.push({
            id: id++,
            title: 'Bom dia. Como você acordou hoje?',
            body: 'Toca em como tá o seu coração agora.',
            schedule: { at: d },
            actionTypeId: MORNING_MOOD_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'morning_mood' },
          } as any);
        }
      }

      // 11:00 — Quer conversar com o Chosen agora?
      for (let day = 0; day < 14; day++) {
        const d = new Date(now);
        d.setDate(now.getDate() + day);
        d.setHours(11, 0, 0, 0);
        if (d > now) {
          notifications.push({
            id: id++,
            title: 'Quer conversar com o Chosen agora?',
            body: 'Toca aqui — tem uma palavra te esperando.',
            schedule: { at: d },
            actionTypeId: TALK_INVITE_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'talk_invite' },
          } as any);
        }
      }

      // 13:30 — Tá precisando de quê agora?
      for (let day = 0; day < 14; day++) {
        const d = new Date(now);
        d.setDate(now.getDate() + day);
        d.setHours(13, 30, 0, 0);
        if (d > now) {
          notifications.push({
            id: id++,
            title: 'Tá precisando de quê agora?',
            body: 'Escolhe o que fala com você nesse momento.',
            schedule: { at: d },
            actionTypeId: NEED_CHECK_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'need_check' },
          } as any);
        }
      }

      // 15:30 — Micro-check da tarde
      for (let day = 0; day < 14; day++) {
        const d = new Date(now);
        d.setDate(now.getDate() + day);
        d.setHours(15, 30, 0, 0);
        if (d > now) {
          notifications.push({
            id: id++,
            title: 'Respira fundo. Tá tudo bem aí?',
            body: 'Só um segundo pra você.',
            schedule: { at: d },
            actionTypeId: MICRO_CHECK_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'micro_check' },
          } as any);
        }
      }

      // 20:30 — Quer levar uma palavra pra dormir?
      for (let day = 0; day < 14; day++) {
        const d = new Date(now);
        d.setDate(now.getDate() + day);
        d.setHours(20, 30, 0, 0);
        if (d > now) {
          notifications.push({
            id: id++,
            title: 'Quer levar uma palavra pra dormir?',
            body: 'Toca no que você quer sentir agora.',
            schedule: { at: d },
            actionTypeId: NIGHT_WORD_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'night_word' },
          } as any);
        }
      }

      // 22:00 — Gratidão do dia
      for (let day = 0; day < 14; day++) {
        const d = new Date(now);
        d.setDate(now.getDate() + day);
        d.setHours(22, 0, 0, 0);
        if (d > now) {
          notifications.push({
            id: id++,
            title: 'Uma coisa boa de hoje pra guardar no coração?',
            body: 'Fecha o dia com gratidão 💛',
            schedule: { at: d },
            actionTypeId: GRATITUDE_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'gratitude' },
          } as any);
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

// Força reagendamento imediato (usado quando o usuário muda a intensidade).
export async function rescheduleNotifications() {
  try {
    localStorage.removeItem(NATIVE_SCHEDULED_KEY);
  } catch {}
  await scheduleNativeNotifications();
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
              // Novas ações: mapeia actionId → categoria
              const cat =
                (actionId && (
                  MOOD_TO_CATEGORY[actionId] ||
                  MORNING_MOOD_TO_CATEGORY[actionId] ||
                  NEED_TO_CATEGORY[actionId] ||
                  DAY_MOOD_TO_CATEGORY[actionId] ||
                  NIGHT_WORD_TO_CATEGORY[actionId] ||
                  MICRO_TO_CATEGORY[actionId]
                )) || undefined;
              if (cat) {
                window.location.href = `/mensagem/${encodeURIComponent(cat)}?color=%23f1f26c&id=mood`;
                return;
              }

              // Talk invite
              if (actionId === 'talk_yes' || actionId === 'talk_word') {
                const { categoria, id } = getRandomMotivacional();
                window.location.href = `/mensagem/${encodeURIComponent(categoria)}?color=%23f1f26c&id=${encodeURIComponent(id)}`;
                return;
              }
              if (actionId === 'talk_later' || actionId === 'grat_later') {
                return; // usuário optou por deixar pra depois
              }

              // Gratidão — abre escolhidas pra "salvar momento"
              if (actionId === 'grat_save') {
                window.location.href = '/escolhidas';
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