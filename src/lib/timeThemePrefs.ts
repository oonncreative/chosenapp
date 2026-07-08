const KEY = "chosen_time_theme_enabled";

export function isTimeThemeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function setTimeThemeEnabled(v: boolean) {
  try {
    localStorage.setItem(KEY, v ? "true" : "false");
    window.dispatchEvent(new Event("chosen:timetheme-changed"));
  } catch {}
}