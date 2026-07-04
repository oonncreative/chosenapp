export type NotificationIntensity = "light" | "normal" | "present";

const KEY = "chosen_notification_intensity";

export function getNotificationIntensity(): NotificationIntensity {
  if (typeof window === "undefined") return "present";
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "normal" || v === "present") return v;
  } catch {}
  return "present"; // padrão da nova versão
}

export function setNotificationIntensity(v: NotificationIntensity) {
  try {
    localStorage.setItem(KEY, v);
    window.dispatchEvent(new Event("chosen:intensity-changed"));
  } catch {}
}

export const INTENSITY_LABELS: Record<
  NotificationIntensity,
  { emoji: string; label: string; desc: string }
> = {
  light: { emoji: "🌱", label: "Leve", desc: "4 por dia" },
  normal: { emoji: "✨", label: "Normal", desc: "9 por dia" },
  present: { emoji: "💛", label: "Presente", desc: "14 por dia" },
};