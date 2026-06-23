const KEY = "chosen_favorites";

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