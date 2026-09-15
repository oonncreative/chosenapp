export type LivroMeta = {
  slug: string;
  nome: string;
  abrev: string;
  capitulos: number;
};

// Ordem canônica do Novo Testamento — Apocalipse fica destacado no fim.
export const LIVROS_NT: LivroMeta[] = [
  { slug: "mateus", nome: "Mateus", abrev: "Mt", capitulos: 28 },
  { slug: "marcos", nome: "Marcos", abrev: "Mc", capitulos: 16 },
  { slug: "lucas", nome: "Lucas", abrev: "Lc", capitulos: 24 },
  { slug: "joao", nome: "João", abrev: "Jo", capitulos: 21 },
  { slug: "atos", nome: "Atos", abrev: "At", capitulos: 28 },
  { slug: "romanos", nome: "Romanos", abrev: "Rm", capitulos: 16 },
  { slug: "1-corintios", nome: "1 Coríntios", abrev: "1Co", capitulos: 16 },
  { slug: "2-corintios", nome: "2 Coríntios", abrev: "2Co", capitulos: 13 },
  { slug: "galatas", nome: "Gálatas", abrev: "Gl", capitulos: 6 },
  { slug: "efesios", nome: "Efésios", abrev: "Ef", capitulos: 6 },
  { slug: "filipenses", nome: "Filipenses", abrev: "Fp", capitulos: 4 },
  { slug: "colossenses", nome: "Colossenses", abrev: "Cl", capitulos: 4 },
  { slug: "1-tessalonicenses", nome: "1 Tessalonicenses", abrev: "1Ts", capitulos: 5 },
  { slug: "2-tessalonicenses", nome: "2 Tessalonicenses", abrev: "2Ts", capitulos: 3 },
  { slug: "1-timoteo", nome: "1 Timóteo", abrev: "1Tm", capitulos: 6 },
  { slug: "2-timoteo", nome: "2 Timóteo", abrev: "2Tm", capitulos: 4 },
  { slug: "tito", nome: "Tito", abrev: "Tt", capitulos: 3 },
  { slug: "filemom", nome: "Filemom", abrev: "Fm", capitulos: 1 },
  { slug: "hebreus", nome: "Hebreus", abrev: "Hb", capitulos: 13 },
  { slug: "tiago", nome: "Tiago", abrev: "Tg", capitulos: 5 },
  { slug: "1-pedro", nome: "1 Pedro", abrev: "1Pe", capitulos: 5 },
  { slug: "2-pedro", nome: "2 Pedro", abrev: "2Pe", capitulos: 3 },
  { slug: "1-joao", nome: "1 João", abrev: "1Jo", capitulos: 5 },
  { slug: "2-joao", nome: "2 João", abrev: "2Jo", capitulos: 1 },
  { slug: "3-joao", nome: "3 João", abrev: "3Jo", capitulos: 1 },
  { slug: "judas", nome: "Judas", abrev: "Jd", capitulos: 1 },
  { slug: "apocalipse", nome: "Apocalipse", abrev: "Ap", capitulos: 22 },
];

export const LIVROS_EVANGELHOS_CARTAS = LIVROS_NT.filter((l) => l.slug !== "apocalipse");
export const LIVRO_APOCALIPSE = LIVROS_NT[LIVROS_NT.length - 1];

export function getLivro(slug: string): LivroMeta | undefined {
  return LIVROS_NT.find((l) => l.slug === slug);
}

export function livroSeguinte(slug: string): LivroMeta | undefined {
  const i = LIVROS_NT.findIndex((l) => l.slug === slug);
  return i >= 0 ? LIVROS_NT[i + 1] : undefined;
}

export function livroAnterior(slug: string): LivroMeta | undefined {
  const i = LIVROS_NT.findIndex((l) => l.slug === slug);
  return i > 0 ? LIVROS_NT[i - 1] : undefined;
}

const modulos = import.meta.glob<{ default: string[][] }>("./livros/*.ts");

// Carrega o texto de um livro sob demanda (não entra no bundle inicial).
export async function carregarLivro(slug: string): Promise<string[][] | null> {
  const carregar = modulos[`./livros/${slug}.ts`];
  if (!carregar) return null;
  const mod = await carregar();
  return mod.default;
}
