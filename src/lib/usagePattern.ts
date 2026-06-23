// Aprende horário preferido do usuário: conta aberturas por hora
// e expõe as top horas para ajustar notificações.

const KEY = "chosen_open_hours";
const MIN_SAMPLES = 10;

type HourMap = Record<string, number>;

function read(): HourMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function write(map: HourMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}

export function recordAppOpen(date = new Date()) {
  const map = read();
  const h = String(date.getHours());
  map[h] = (map[h] || 0) + 1;
  write(map);
}

export function totalOpens(): number {
  const map = read();
  return Object.values(map).reduce((a, b) => a + b, 0);
}

// Retorna até `count` horas preferidas (entre 7 e 22), ordenadas crescentes.
// Retorna null se não tiver amostras suficientes (usa default).
export function getPreferredHours(count = 6): number[] | null {
  const map = read();
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  if (total < MIN_SAMPLES) return null;

  const entries = Object.entries(map)
    .map(([h, c]) => ({ hour: parseInt(h, 10), count: c }))
    .filter((e) => e.hour >= 7 && e.hour <= 22)
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((e) => e.hour)
    .sort((a, b) => a - b);

  return entries.length >= 3 ? entries : null;
}