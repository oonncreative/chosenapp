// Marcador de leitura da Bíblia: guarda onde a pessoa parou.

const KEY = "chosen_biblia_marcador";
const KEY_MANUAL = "chosen_biblia_marcador_manual";

export type Marcador = {
  livro: string;
  nome: string;
  capitulo: number;
  versiculo: number;
  at: number;
};

function ler(key: string): Marcador | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.livro !== "string") return null;
    return obj as Marcador;
  } catch {
    return null;
  }
}

function gravar(key: string, m: Marcador | null) {
  if (typeof window === "undefined") return;
  try {
    if (m) localStorage.setItem(key, JSON.stringify(m));
    else localStorage.removeItem(key);
  } catch {}
}

// Marcador automático: último ponto lido.
export function getMarcador(): Marcador | null {
  return ler(KEY);
}

export function setMarcador(m: Omit<Marcador, "at">) {
  gravar(KEY, { ...m, at: Date.now() });
}

// Marcador manual: "parei aqui" escolhido pela pessoa.
export function getMarcadorManual(): Marcador | null {
  return ler(KEY_MANUAL);
}

export function toggleMarcadorManual(m: Omit<Marcador, "at">): boolean {
  const atual = getMarcadorManual();
  if (
    atual &&
    atual.livro === m.livro &&
    atual.capitulo === m.capitulo &&
    atual.versiculo === m.versiculo
  ) {
    gravar(KEY_MANUAL, null);
    return false;
  }
  gravar(KEY_MANUAL, { ...m, at: Date.now() });
  return true;
}

export function formatarMarcador(m: Marcador): string {
  return `${m.nome} ${m.capitulo} · versículo ${m.versiculo}`;
}

// ---------- Capítulos lidos ----------

const KEY_LIDOS = "chosen_biblia_lidos";

export type Lidos = Record<string, number[]>;

export function getLidos(): Lidos {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY_LIDOS);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? (obj as Lidos) : {};
  } catch {
    return {};
  }
}

function gravarLidos(l: Lidos) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_LIDOS, JSON.stringify(l));
  } catch {}
}

export function getLidosDoLivro(livro: string): number[] {
  return getLidos()[livro] ?? [];
}

export function isLido(livro: string, capitulo: number): boolean {
  return getLidosDoLivro(livro).includes(capitulo);
}

export function setLido(livro: string, capitulo: number, lido: boolean) {
  const todos = getLidos();
  const atual = new Set(todos[livro] ?? []);
  if (lido) atual.add(capitulo);
  else atual.delete(capitulo);
  const lista = Array.from(atual).sort((a, b) => a - b);
  if (lista.length) todos[livro] = lista;
  else delete todos[livro];
  gravarLidos(todos);
}

export function toggleLido(livro: string, capitulo: number): boolean {
  const novo = !isLido(livro, capitulo);
  setLido(livro, capitulo, novo);
  return novo;
}

export function contarLidos(livro: string): number {
  return getLidosDoLivro(livro).length;
}

export function totalLidos(): number {
  return Object.values(getLidos()).reduce((s, v) => s + v.length, 0);
}
