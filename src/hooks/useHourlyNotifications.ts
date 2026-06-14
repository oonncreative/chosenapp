import { useEffect } from "react";
import { toast } from "sonner";
import {
  getChosenForHour,
  isWithinQuietHours,
  NOTIFICATION_TITLES,
} from "@/lib/psalms";

const LAST_FIRED_KEY = "chosen_last_fired_hour";
const ENABLED_KEY = "chosen_notifications_enabled";

function currentHourBucket(date = new Date()): number {
  return Math.floor(date.getTime() / (60 * 60 * 1000));
}

function pickTitle(): string {
  return NOTIFICATION_TITLES[Math.floor(Math.random() * NOTIFICATION_TITLES.length)];
}

async function showSystemNotification(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: "/logo-chosen.png",
        badge: "/logo-chosen.png",
        tag: "chosen-hourly",
        data: { url: "/home" },
      });
      return;
    }
    new Notification(title, { body, icon: "/logo-chosen.png" });
  } catch (err) {
    console.error("notification error", err);
  }
}

function showInAppToast(title: string, body: string) {
  if (typeof document === "undefined") return;
  if (document.visibilityState !== "visible") return;
  toast(title, {
    description: body,
    duration: 8000,
  });
}

async function fireChosen(reason: "scheduled" | "missed" | "manual") {
  const item = getChosenForHour();
  const title = pickTitle();
  const body = `${item.ref} — ${item.text}`;
  // Toast in-app sempre (se visível)
  showInAppToast(title, body);
  // Notificação do sistema apenas em quiet hours (8–22h) ou se for manual
  if (reason === "manual" || isWithinQuietHours()) {
    await showSystemNotification(title, body);
  }
  try {
    localStorage.setItem(LAST_FIRED_KEY, String(currentHourBucket()));
  } catch {}
}

export function useHourlyNotifications() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const enabled = localStorage.getItem(ENABLED_KEY) !== "false";
    if (!enabled) return;

    // Ao abrir: se há uma hora "perdida" dentro do quiet window, dispara uma vez.
    const lastStr = localStorage.getItem(LAST_FIRED_KEY);
    const now = currentHourBucket();
    const last = lastStr ? parseInt(lastStr, 10) : 0;
    if (last < now && isWithinQuietHours()) {
      void fireChosen("missed");
    }

    // Agenda para o próximo topo de hora, depois a cada 1h.
    const next = new Date();
    next.setMinutes(0, 5, 0); // 5s após o topo da hora
    next.setHours(next.getHours() + 1);
    const msUntilNext = next.getTime() - Date.now();

    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      void fireChosen("scheduled");
      interval = setInterval(() => {
        void fireChosen("scheduled");
      }, 60 * 60 * 1000);
    }, Math.max(1000, msUntilNext));

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);
}

export async function requestNotificationsPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  const result = await Notification.requestPermission();
  if (result === "granted") {
    try { localStorage.setItem(ENABLED_KEY, "true"); } catch {}
    await fireChosen("manual");
  }
  return result;
}

export function setNotificationsEnabled(enabled: boolean) {
  try { localStorage.setItem(ENABLED_KEY, String(enabled)); } catch {}
}

export function getNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ENABLED_KEY) !== "false";
}

export async function fireChosenNow() {
  await fireChosen("manual");
}
