// Persistência dos "momentos" — respostas livres escritas em notificações.

const KEY = 'chosen_gratitude_log';
const MAX = 200;

export interface Moment {
  id: string;
  ts: number;
  text: string;
  source: 'gratitude' | 'night_word' | 'need' | 'other';
}

export function getMoments(): Moment[] {
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

function write(list: Moment[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
    window.dispatchEvent(new Event('chosen:moments-changed'));
  } catch {}
}

export function addMoment(text: string, source: Moment['source'] = 'other') {
  const clean = (text || '').trim();
  if (!clean) return null;
  const list = getMoments();
  const m: Moment = {
    id: `mom-${Date.now()}`,
    ts: Date.now(),
    text: clean.slice(0, 500),
    source,
  };
  list.push(m);
  write(list);
  return m;
}

export function removeMoment(id: string) {
  const list = getMoments().filter((m) => m.id !== id);
  write(list);
}

export function clearMoments() {
  write([]);
}