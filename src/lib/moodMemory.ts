// Registro leve das últimas ~30 respostas em notificações.
// Usado pra personalizar títulos e detectar streaks.

const KEY = 'chosen_mood_memory';
const MAX = 30;

export interface MoodEntry {
  ts: number;
  actionId: string;
  category: string; // ex.: "Ansiedade", "Feliz"
}

function read(): MoodEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: MoodEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
  } catch {}
}

export function recordAnswer(actionId: string, category: string) {
  if (!actionId || !category) return;
  const list = read();
  list.push({ ts: Date.now(), actionId, category });
  write(list);
}

export function getMoodHistory(): MoodEntry[] {
  return read();
}

export function getDominantMood(days = 3): string | null {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const list = read().filter((e) => e.ts >= cutoff);
  if (list.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const e of list) counts[e.category] = (counts[e.category] || 0) + 1;
  let best: string | null = null;
  let bestN = 0;
  for (const [cat, n] of Object.entries(counts)) {
    if (n > bestN) {
      best = cat;
      bestN = n;
    }
  }
  return best;
}

export function hasStreak(category: string, n = 3): boolean {
  const list = read();
  if (list.length < n) return false;
  return list.slice(-n).every((e) => e.category === category);
}