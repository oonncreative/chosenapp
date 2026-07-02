const KEY = "chosen_favorites";
const HISTORY_KEY = "chosen_history";
const HISTORY_MAX = 100;

export interface Favorite {
  id: string;
  categoria: string;
  ref: string;
  text: string;
  addedAt: number;
}

export function getFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function save(list: Favorite[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("chosen:favorites-changed"));
  } catch {}
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export function toggleFavorite(fav: Omit<Favorite, "addedAt">): boolean {
  const list = getFavorites();
  const idx = list.findIndex((f) => f.id === fav.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    save(list);
    return false;
  }
  list.unshift({ ...fav, addedAt: Date.now() });
  save(list);
  return true;
}

export function removeFavorite(id: string) {
  save(getFavorites().filter((f) => f.id !== id));
}

// -------- Histórico --------
export interface HistoryEntry {
  id: string;
  categoria: string;
  ref: string;
  text: string;
  viewedAt: number;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, "viewedAt">) {
  try {
    const list = getHistory().filter((h) => h.id !== entry.id);
    list.unshift({ ...entry, viewedAt: Date.now() });
    const trimmed = list.slice(0, HISTORY_MAX);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent("chosen:history-changed"));
  } catch {}
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new CustomEvent("chosen:history-changed"));
  } catch {}
}