import { CATEGORIAS, MENSAGENS, type Categoria } from "./data";

export interface SearchHit {
  categoria: Categoria;
  id: string;
  texto: string;
  referencia: string;
  score: number;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchMensagens(query: string, limit = 12): SearchHit[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const hits: SearchHit[] = [];

  for (const categoria of CATEGORIAS) {
    const nomeCat = normalize(categoria);
    const catMatch = terms.every((t) => nomeCat.includes(t));

    for (const m of MENSAGENS[categoria]) {
      const hay = normalize(
        `${m.texto} ${m.referencia} ${m.resumo ?? ""} ${categoria}`,
      );
      let score = 0;
      for (const t of terms) {
        if (hay.includes(t)) score += 1;
        if (normalize(m.texto).includes(t)) score += 1;
      }
      if (catMatch) score += 2;
      if (score > 0) {
        hits.push({
          categoria,
          id: m.id,
          texto: m.texto,
          referencia: m.referencia,
          score,
        });
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}