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
import { COPY } from '@/lib/notificationCopy';
import {
  recordAnswer,
  getDominantMood,
  hasStreak,
} from '@/lib/moodMemory';
import { addMoment } from '@/lib/gratitudeLog';

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
const FOLLOW_TIRED = 'FOLLOW_TIRED';
const FOLLOW_ANXIOUS = 'FOLLOW_ANXIOUS';
const FOLLOW_GRATEFUL = 'FOLLOW_GRATEFUL';
const FOLLOW_FORCE = 'FOLLOW_FORCE';
const FOLLOW_PEACE = 'FOLLOW_PEACE';
const FOLLOW_GRAT_BLESS = 'FOLLOW_GRAT_BLESS';
const PERSONAL_ANXIETY = 'PERSONAL_ANXIETY';
const PERSONAL_GRATEFUL = 'PERSONAL_GRATEFUL';
const REACTIVE_MISSED = 'REACTIVE_MISSED';
const GRATITUDE_INPUT = 'GRATITUDE_INPUT';
const NIGHT_WORD_INPUT = 'NIGHT_WORD_INPUT';
const NEED_INPUT = 'NEED_INPUT';

const LAST_ACTIVE_KEY = 'chosen_last_active_at';
const REACTIVE_LAST_KEY = 'chosen_reactive_last_fired';

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

// Chave usada pra IDs de follow-up (não colidem com o range fixo)
let FOLLOW_ID = 900000;
function nextFollowId() {
  FOLLOW_ID = (FOLLOW_ID + 1) % 999999;
  return FOLLOW_ID;
}

async function scheduleFollowUp(
  minutesFromNow: number,
  title: string,
  body: string,
  actionTypeId: string,
  extra: Record<string, any> = {},
  input?: { placeholder?: string }
) {
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const at = new Date(Date.now() + minutesFromNow * 60 * 1000);
    const notif: any = {
      id: nextFollowId(),
      title,
      body,
      schedule: { at },
      actionTypeId,
      smallIcon: 'ic_stat_chosen',
      iconColor: '#f1f26c',
      extra: { url: '/home', chain: actionTypeId, ...extra },
    };
    if (input) {
      notif.attachments = undefined;
      notif.inputText = true;
      notif.inputPlaceholder = input.placeholder || 'Escreve aqui…';
    }
    await LocalNotifications.schedule({ notifications: [notif] });
  } catch (err) {
    console.error('scheduleFollowUp error', err);
  }
}

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
              { id: 'morning_tired', title: COPY.morningMood.actions.tired },
              { id: 'morning_grateful', title: COPY.morningMood.actions.grateful },
              { id: 'morning_anxious', title: COPY.morningMood.actions.anxious },
              { id: 'morning_calm', title: COPY.morningMood.actions.calm },
            ],
          },
          {
            id: TALK_INVITE_ACTION_TYPE,
            actions: [
              { id: 'talk_yes', title: COPY.talkInvite.actions.yes },
              { id: 'talk_word', title: COPY.talkInvite.actions.word },
              { id: 'talk_later', title: COPY.talkInvite.actions.later },
            ],
          },
          {
            id: NEED_CHECK_ACTION_TYPE,
            actions: [
              { id: 'need_force', title: COPY.need.actions.force },
              { id: 'need_peace', title: COPY.need.actions.peace },
              { id: 'need_joy', title: COPY.need.actions.joy },
              { id: 'need_love', title: COPY.need.actions.love },
              { id: 'need_talk', title: COPY.need.actions.talk, input: true, inputPlaceholder: 'Conta o que sente…' } as any,
            ],
          },
          {
            id: MICRO_CHECK_ACTION_TYPE,
            actions: [
              { id: 'micro_ok', title: COPY.micro.actions.ok },
              { id: 'micro_not_ok', title: COPY.micro.actions.notOk },
            ],
          },
          {
            id: NIGHT_WORD_ACTION_TYPE,
            actions: [
              { id: 'night_write', title: COPY.nightWord.actions.write, input: true, inputPlaceholder: 'Uma palavra…' } as any,
              { id: 'night_peace', title: COPY.nightWord.actions.peace },
              { id: 'night_gratitude', title: COPY.nightWord.actions.gratitude },
              { id: 'night_hope', title: COPY.nightWord.actions.hope },
            ],
          },
          {
            id: GRATITUDE_ACTION_TYPE,
            actions: [
              { id: 'grat_write', title: COPY.gratitude.actions.write, input: true, inputPlaceholder: 'Uma bênção de hoje…' } as any,
              { id: 'grat_save', title: COPY.gratitude.actions.save },
              { id: 'grat_later', title: COPY.gratitude.actions.later },
            ],
          },
          // ==== Follow-ups (mini-conversa) ====
          {
            id: FOLLOW_TIRED,
            actions: [
              { id: 'ft_yes', title: COPY.follow.tiredSoft.actions.yes },
              { id: 'ft_later', title: COPY.follow.tiredSoft.actions.later },
            ],
          },
          {
            id: FOLLOW_ANXIOUS,
            actions: [
              { id: 'fa_breathe', title: COPY.follow.anxiousBreath.actions.breathe },
              { id: 'fa_word', title: COPY.follow.anxiousBreath.actions.word },
            ],
          },
          {
            id: FOLLOW_GRATEFUL,
            actions: [
              { id: 'fg_amem', title: COPY.follow.gratefulKeep.actions.amem },
              { id: 'fg_share', title: COPY.follow.gratefulKeep.actions.share },
            ],
          },
          {
            id: FOLLOW_FORCE,
            actions: [
              { id: 'ff_pray', title: COPY.follow.forcePray.actions.pray },
              { id: 'ff_word', title: COPY.follow.forcePray.actions.word },
            ],
          },
          {
            id: FOLLOW_PEACE,
            actions: [
              { id: 'fp_yes', title: COPY.follow.peaceSilence.actions.yes },
              { id: 'fp_later', title: COPY.follow.peaceSilence.actions.later },
            ],
          },
          {
            id: FOLLOW_GRAT_BLESS,
            actions: [
              { id: 'fgb_amem', title: COPY.follow.gratitudeBless.actions.amem },
              { id: 'fgb_sleep', title: COPY.follow.gratitudeBless.actions.sleep },
            ],
          },
          {
            id: PERSONAL_ANXIETY,
            actions: [
              { id: 'pa_peace', title: COPY.personalized.anxietyStreak.actions.peace },
              { id: 'pa_force', title: COPY.personalized.anxietyStreak.actions.force },
            ],
          },
          {
            id: PERSONAL_GRATEFUL,
            actions: [
              { id: 'pg_write', title: COPY.personalized.gratefulStreak.actions.write, input: true, inputPlaceholder: 'Escreve sua gratidão…' } as any,
              { id: 'pg_save', title: COPY.personalized.gratefulStreak.actions.save },
            ],
          },
          {
            id: REACTIVE_MISSED,
            actions: [
              { id: 'rm_ok', title: COPY.reactive.missed.actions.ok },
              { id: 'rm_need', title: COPY.reactive.missed.actions.need },
              { id: 'rm_pray', title: COPY.reactive.missed.actions.pray },
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
    const dominantMood = getDominantMood(3);
    const anxietyStreak = hasStreak('Ansiedade', 3);
    const gratefulStreak = hasStreak('Feliz', 3);

    // Slots de "palavra pronta" (salmo/motivação alternado) por intensidade.
    const WORD_SCHEDULE_PRESENT = [
      { hour: 8,  minute: 8,  title: COPY.wordSlots.morning },
      { hour: 10, minute: 10, title: COPY.wordSlots.midMorning },
      { hour: 12, minute: 12, title: COPY.wordSlots.lunch },
      { hour: 14, minute: 14, title: COPY.wordSlots.afternoon },
      { hour: 18, minute: 18, title: COPY.wordSlots.lateAfternoon },
      { hour: 21, minute: 21, title: COPY.wordSlots.night },
    ];
    const WORD_SCHEDULE_NORMAL = WORD_SCHEDULE_PRESENT;
    const WORD_SCHEDULE_LIGHT = [
      { hour: 8,  minute: 8,  title: COPY.wordSlots.morning },
      { hour: 12, minute: 12, title: COPY.wordSlots.lunch },
      { hour: 18, minute: 18, title: COPY.wordSlots.lateAfternoon },
      { hour: 21, minute: 21, title: COPY.wordSlots.night },
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
    const learnedTitle = COPY.wordByMood(dominantMood);
    const SCHEDULE = learned
      ? learned.map((h) => ({
          hour: h,
          minute: h, // mantém variação tipo 8h08, 14h14
          title: learnedTitle,
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
          // Streak de ansiedade sobrescreve a pergunta padrão
          const useAnxietyStreak = anxietyStreak && day < 2;
          notifications.push({
            id: id++,
            title: useAnxietyStreak
              ? COPY.personalized.anxietyStreak.title
              : COPY.morningMood.title,
            body: useAnxietyStreak
              ? COPY.personalized.anxietyStreak.body
              : COPY.morningMood.body,
            schedule: { at: d },
            actionTypeId: useAnxietyStreak
              ? PERSONAL_ANXIETY
              : MORNING_MOOD_ACTION_TYPE,
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
            title: COPY.talkInvite.title,
            body: COPY.talkInvite.body,
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
            title: COPY.need.title,
            body: COPY.need.body,
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
            title: COPY.micro.title,
            body: COPY.micro.body,
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
            title: COPY.nightWord.title,
            body: COPY.nightWord.body,
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
          const useGratefulStreak = gratefulStreak && day < 2;
          notifications.push({
            id: id++,
            title: useGratefulStreak
              ? COPY.personalized.gratefulStreak.title
              : COPY.gratitude.title,
            body: useGratefulStreak
              ? COPY.personalized.gratefulStreak.body
              : COPY.gratitude.body,
            schedule: { at: d },
            actionTypeId: useGratefulStreak
              ? PERSONAL_GRATEFUL
              : GRATITUDE_ACTION_TYPE,
            smallIcon: 'ic_stat_chosen',
            iconColor: '#f1f26c',
            extra: { url: '/home', type: 'gratitude' },
          } as any);
        }
      }

      // ===== Gatilho reativo: sumiço curto =====
      try {
        const lastActive = Number(localStorage.getItem(LAST_ACTIVE_KEY) || Date.now());
        const lastReactive = Number(localStorage.getItem(REACTIVE_LAST_KEY) || 0);
        const missed = Date.now() - lastActive > 24 * 60 * 60 * 1000;
        const notFiredToday =
          new Date(lastReactive).toDateString() !== new Date().toDateString();
        if (missed && notFiredToday) {
          const at = new Date(Date.now() + 5 * 60 * 1000);
          const hour = at.getHours();
          if (hour >= 9 && hour <= 21) {
            notifications.push({
              id: id++,
              title: COPY.reactive.missed.title,
              body: COPY.reactive.missed.body,
              schedule: { at },
              actionTypeId: REACTIVE_MISSED,
              smallIcon: 'ic_stat_chosen',
              iconColor: '#f1f26c',
              extra: { url: '/home', type: 'reactive_missed' },
            } as any);
            localStorage.setItem(REACTIVE_LAST_KEY, String(Date.now()));
          }
        }
      } catch {}
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