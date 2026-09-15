import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight, Bookmark } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { LIVROS_EVANGELHOS_CARTAS, LIVRO_APOCALIPSE } from "@/lib/biblia";
import {
  formatarMarcador,
  getLidos,
  getMarcador,
  getMarcadorManual,
  type Lidos,
  type Marcador,
} from "@/lib/biblia/marcador";

export const Route = createFileRoute("/biblia/")({
  head: () => ({
    meta: [
      { title: "Bíblia — Novo Testamento | Chosen" },
      {
        name: "description",
        content:
          "Leia o Novo Testamento no Chosen, de Mateus a Judas com Apocalipse no fim, e continue de onde você parou.",
      },
      { property: "og:title", content: "Bíblia — Novo Testamento | Chosen" },
      {
        property: "og:description",
        content: "Leia o Novo Testamento e marque onde parou para continuar amanhã.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BibliaIndex,
});

function BibliaIndex() {
  const [auto, setAuto] = useState<Marcador | null>(null);
  const [manual, setManual] = useState<Marcador | null>(null);
  const [lidos, setLidos] = useState<Lidos>({});

  useEffect(() => {
    setAuto(getMarcador());
    setManual(getMarcadorManual());
    setLidos(getLidos());
  }, []);

  const ondeParou = manual ?? auto;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <header className="grid grid-cols-3 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] pb-2 shrink-0">
        <Link
          to="/home"
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">
          CHOSEN
        </span>
        <span />
      </header>

      <main className="flex-1 px-6 pb-28 pt-8">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-black/70" strokeWidth={2} />
            <h1 className="text-sm font-light tracking-[0.3em] uppercase text-black">
              Novo Testamento
            </h1>
          </div>
          <p className="text-sm text-black/60 mb-6">
            Leitura completa, sem internet. A gente guarda onde você parou.
          </p>

          {(manual || auto) && (
            <div className="flex flex-col gap-2 mb-8">
              {manual && (
                <ContinuarCard
                  titulo="Você marcou aqui"
                  marcador={manual}
                  destaque
                />
              )}
              {auto && (!manual || manual.livro !== auto.livro || manual.capitulo !== auto.capitulo) && (
                <ContinuarCard titulo="Continuar de onde parei" marcador={auto} />
              )}
            </div>
          )}

          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-3">
            Evangelhos e cartas
          </h2>
          <ul className="flex flex-col gap-1.5">
            {LIVROS_EVANGELHOS_CARTAS.map((l) => (
              <li key={l.slug}>
                <LivroLinha
                  slug={l.slug}
                  nome={l.nome}
                  capitulos={l.capitulos}
                  lidos={(lidos[l.slug] ?? []).length}
                  aqui={ondeParou?.livro === l.slug ? ondeParou.capitulo : null}
                />
              </li>
            ))}
          </ul>

          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mt-8 mb-3">
            Profecia
          </h2>
          <LivroLinha
            slug={LIVRO_APOCALIPSE.slug}
            nome={LIVRO_APOCALIPSE.nome}
            capitulos={LIVRO_APOCALIPSE.capitulos}
            lidos={(lidos[LIVRO_APOCALIPSE.slug] ?? []).length}
            aqui={ondeParou?.livro === LIVRO_APOCALIPSE.slug ? ondeParou.capitulo : null}
            destaque
          />
        </div>
      </main>

      <AppFooter />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

function ContinuarCard({
  titulo,
  marcador,
  destaque,
}: {
  titulo: string;
  marcador: Marcador;
  destaque?: boolean;
}) {
  return (
    <Link
      to="/biblia/$livro/$capitulo"
      params={{ livro: marcador.livro, capitulo: String(marcador.capitulo) }}
      hash={`v${marcador.versiculo}`}
      className={`flex items-center gap-3 rounded-2xl px-4 py-4 active:scale-[0.99] transition-all ${
        destaque ? "bg-black text-white" : "bg-black/[0.04] text-black"
      }`}
    >
      <Bookmark
        className={`h-5 w-5 shrink-0 ${destaque ? "text-[#f1f26c] fill-[#f1f26c]" : "text-black/50"}`}
      />
      <span className="flex-1 min-w-0">
        <span
          className={`block text-[10px] font-bold tracking-[0.25em] uppercase ${
            destaque ? "text-white/60" : "text-black/40"
          }`}
        >
          {titulo}
        </span>
        <span className="block text-[15px] mt-0.5 truncate">
          {formatarMarcador(marcador)}
        </span>
      </span>
      <ChevronRight className={`h-4 w-4 ${destaque ? "text-white/60" : "text-black/40"}`} />
    </Link>
  );
}
