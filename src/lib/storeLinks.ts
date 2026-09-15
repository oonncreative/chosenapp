// Links das lojas e detecção de plataforma para o link inteligente /baixar

export const SITE_URL = "https://chosen.oonn.com.br";
export const SMART_LINK = `${SITE_URL}/baixar`;

// Android: package do Capacitor (com.oonn.chosen)
export const PLAY_URL = "https://play.google.com/store/apps/details?id=com.oonn.chosen";

// iOS: quando o app for publicado, troque por https://apps.apple.com/br/app/id0000000000
export const APP_STORE_ID: string | null = null;
export const APP_STORE_URL = APP_STORE_ID
  ? `https://apps.apple.com/br/app/id${APP_STORE_ID}`
  : "https://apps.apple.com/br/search?term=chosen%20oonn";

export type Plataforma = "ios" | "android" | "web";

export function detectarPlataforma(ua?: string): Plataforma {
  const s = (ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "")) || "";
  const touchMac =
    typeof navigator !== "undefined" &&
    /Macintosh/i.test(s) &&
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints! > 1;
  if (/iPhone|iPad|iPod/i.test(s) || touchMac) return "ios";
  if (/Android/i.test(s)) return "android";
  return "web";
}

export function destinoPara(plataforma: Plataforma): string {
  if (plataforma === "ios") return APP_STORE_URL;
  if (plataforma === "android") return PLAY_URL;
  return SITE_URL;
}
