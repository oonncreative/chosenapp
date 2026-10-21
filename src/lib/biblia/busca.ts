import { LIVROS, carregarLivro, type LivroMeta } from "./index";

export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const compacto = (s: string) => normalizar(s).replace(/[\s.]/g, "");

// Apelidos comuns além do nome e da abreviação.
const APELIDOS: Record<string, string> = {
  salmo: "salmos",
  sal: "salmos",
  cantares: "canticos",
  "cantico dos canticos": "canticos",
  apoc: "apocalipse",
  ap: "apocalipse",
  jo: "joao",
};

export function acharLivro(texto: string): LivroMeta | undefined {
  const alvo = compacto(texto);
  if (!alvo) return undefined;
  const apelido = APELIDOS[normalizar(texto)];
  if (apelido) return LIVROS.find((l) => l.slug === apelido);
  return (
    LIVROS.find((l) => compacto(l.nome) === alvo || compacto(l.abrev) === alvo) ??
    LIVROS.find((l) => compacto(l.nome).startsWith(alvo) && alvo.length >= 2)
  );
}

export type Referencia = {
  livro: LivroMeta;
  capitulo: number;
  versiculo?: number;
  versiculoFim?: number;
};

// Entende "Êxodo 3:22", "ex 3 22", "1 Co 13", "Sl 23:1-4", "Joao 3.16".
export function interpretarReferencia(entrada: string): Referencia | null {
  const m = entrada
    .trim()
    .match(/^(\d?\s*[^\d:.,]+?)\s*(\d+)(?:\s*[:.,\s]\s*(\d+)(?:\s*-\s*(\d+))?)?\s*$/);
  if (!m) return null;
  const livro = acharLivro(m[1]);
  if (!livro) return null;
  const capitulo = Number(m[2]);
  if (capitulo < 1 || capitulo > livro.capitulos) return null;
  return {
    livro,
    capitulo,
    versiculo: m[3] ? Number(m[3]) : undefined,
    versiculoFim: m[4] ? Number(m[4]) : undefined,
  };
}

export type Resultado = {
  livro: LivroMeta;
  capitulo: number;
  versiculo: number;
  texto: string;
};

// Busca por palavras em toda a Bíblia (carrega os livros só quando precisa).
export async function buscarTexto(consulta: string, limite = 80): Promise<Resultado[]> {
  const palavras = normalizar(consulta).split(" ").filter((p) => p.length >= 2);
  if (palavras.length === 0) return [];
  const out: Resultado[] = [];
  for (const livro of LIVROS) {
    const caps = await carregarLivro(livro.slug);
    if (!caps) continue;
    for (let c = 0; c < caps.length; c++) {
      for (let v = 0; v < caps[c].length; v++) {
        const t = normalizar(caps[c][v]);
        if (palavras.every((p) => t.includes(p))) {
          out.push({ livro, capitulo: c + 1, versiculo: v + 1, texto: caps[c][v] });
          if (out.length >= limite) return out;
        }
      }
    }
  }
  return out;
}
