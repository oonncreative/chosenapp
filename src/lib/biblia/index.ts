export type LivroMeta = {
  slug: string;
  nome: string;
  abrev: string;
  capitulos: number;
  testamento?: "at" | "nt";
};

export const LIVROS_AT: LivroMeta[] = [
  { slug: "genesis", nome: "Gênesis", abrev: "Gn", capitulos: 50, testamento: "at" },
  { slug: "exodo", nome: "Êxodo", abrev: "Êx", capitulos: 40, testamento: "at" },
  { slug: "levitico", nome: "Levítico", abrev: "Lv", capitulos: 27, testamento: "at" },
  { slug: "numeros", nome: "Números", abrev: "Nm", capitulos: 36, testamento: "at" },
  { slug: "deuteronomio", nome: "Deuteronômio", abrev: "Dt", capitulos: 34, testamento: "at" },
  { slug: "josue", nome: "Josué", abrev: "Js", capitulos: 24, testamento: "at" },
  { slug: "juizes", nome: "Juízes", abrev: "Jz", capitulos: 21, testamento: "at" },
  { slug: "rute", nome: "Rute", abrev: "Rt", capitulos: 4, testamento: "at" },
  { slug: "1-samuel", nome: "1 Samuel", abrev: "1Sm", capitulos: 31, testamento: "at" },
  { slug: "2-samuel", nome: "2 Samuel", abrev: "2Sm", capitulos: 24, testamento: "at" },
  { slug: "1-reis", nome: "1 Reis", abrev: "1Rs", capitulos: 22, testamento: "at" },
  { slug: "2-reis", nome: "2 Reis", abrev: "2Rs", capitulos: 25, testamento: "at" },
  { slug: "1-cronicas", nome: "1 Crônicas", abrev: "1Cr", capitulos: 29, testamento: "at" },
  { slug: "2-cronicas", nome: "2 Crônicas", abrev: "2Cr", capitulos: 36, testamento: "at" },
  { slug: "esdras", nome: "Esdras", abrev: "Ed", capitulos: 10, testamento: "at" },
  { slug: "neemias", nome: "Neemias", abrev: "Ne", capitulos: 13, testamento: "at" },
  { slug: "ester", nome: "Ester", abrev: "Et", capitulos: 10, testamento: "at" },
  { slug: "jo", nome: "Jó", abrev: "Jó", capitulos: 42, testamento: "at" },
  { slug: "salmos", nome: "Salmos", abrev: "Sl", capitulos: 150, testamento: "at" },
  { slug: "proverbios", nome: "Provérbios", abrev: "Pv", capitulos: 31, testamento: "at" },
  { slug: "eclesiastes", nome: "Eclesiastes", abrev: "Ec", capitulos: 12, testamento: "at" },
  { slug: "canticos", nome: "Cânticos", abrev: "Ct", capitulos: 8, testamento: "at" },
  { slug: "isaias", nome: "Isaías", abrev: "Is", capitulos: 66, testamento: "at" },
  { slug: "jeremias", nome: "Jeremias", abrev: "Jr", capitulos: 52, testamento: "at" },
  { slug: "lamentacoes", nome: "Lamentações", abrev: "Lm", capitulos: 5, testamento: "at" },
  { slug: "ezequiel", nome: "Ezequiel", abrev: "Ez", capitulos: 48, testamento: "at" },
  { slug: "daniel", nome: "Daniel", abrev: "Dn", capitulos: 12, testamento: "at" },
  { slug: "oseias", nome: "Oseias", abrev: "Os", capitulos: 14, testamento: "at" },
  { slug: "joel", nome: "Joel", abrev: "Jl", capitulos: 3, testamento: "at" },
  { slug: "amos", nome: "Amós", abrev: "Am", capitulos: 9, testamento: "at" },
  { slug: "obadias", nome: "Obadias", abrev: "Ob", capitulos: 1, testamento: "at" },
  { slug: "jonas", nome: "Jonas", abrev: "Jn", capitulos: 4, testamento: "at" },
  { slug: "miqueias", nome: "Miqueias", abrev: "Mq", capitulos: 7, testamento: "at" },
  { slug: "naum", nome: "Naum", abrev: "Na", capitulos: 3, testamento: "at" },
  { slug: "habacuque", nome: "Habacuque", abrev: "Hc", capitulos: 3, testamento: "at" },
  { slug: "sofonias", nome: "Sofonias", abrev: "Sf", capitulos: 3, testamento: "at" },
  { slug: "ageu", nome: "Ageu", abrev: "Ag", capitulos: 2, testamento: "at" },
  { slug: "zacarias", nome: "Zacarias", abrev: "Zc", capitulos: 14, testamento: "at" },
  { slug: "malaquias", nome: "Malaquias", abrev: "Ml", capitulos: 4, testamento: "at" },
];

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

export const LIVROS: LivroMeta[] = [...LIVROS_AT, ...LIVROS_NT];

export function getLivro(slug: string): LivroMeta | undefined {
  return LIVROS.find((l) => l.slug === slug);
}

export function isAntigo(slug: string): boolean {
  return LIVROS_AT.some((l) => l.slug === slug);
}

export function livroSeguinte(slug: string): LivroMeta | undefined {
  const i = LIVROS.findIndex((l) => l.slug === slug);
  return i >= 0 ? LIVROS[i + 1] : undefined;
}

export function livroAnterior(slug: string): LivroMeta | undefined {
  const i = LIVROS.findIndex((l) => l.slug === slug);
  return i > 0 ? LIVROS[i - 1] : undefined;
}

const modulos = import.meta.glob<{ default: string[][] }>("./livros/*.ts");

// Carrega o texto de um livro sob demanda (não entra no bundle inicial).
export async function carregarLivro(slug: string): Promise<string[][] | null> {
  const carregar = modulos[`./livros/${slug}.ts`];
  if (!carregar) return null;
  const mod = await carregar();
  return mod.default;
}
