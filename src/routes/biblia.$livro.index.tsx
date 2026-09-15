import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { getLivro } from "@/lib/biblia";
import {
  getLidosDoLivro,
  getMarcador,
  getMarcadorManual,
  reiniciarLivro,
  setLido,
} from "@/lib/biblia/marcador";

export const Route = createFileRoute("/biblia/$livro/")({
  loader: ({ params }) => {
    const livro = getLivro(params.livro);
    if (!livro) throw notFound();
    return livro;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Livro não encontrado | Chosen" }, { name: "robots", content: "noindex" }],
      };
    }
    const titulo = `${loaderData.nome} — Bíblia NT | Chosen`;
    const desc = `Leia ${loaderData.nome} no Chosen: ${loaderData.capitulos} capítulos, com marcador de onde você parou.`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: desc },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: CapitulosPage,
});

function CapitulosPage() {
  const livro = Route.useLoaderData();
  const [ultimoCap, setUltimoCap] = useState<number | null>(null);
  const [lidos, setLidos] = useState<number[]>([]);

  useEffect(() => {
    const m = getMarcadorManual() ?? getMarcador();
    if (m && m.livro === livro.slug) setUltimoCap(m.capitulo);
    else setUltimoCap(null);
    setLidos(getLidosDoLivro(livro.slug));
  }, [livro.slug]);

  const alternar = (c: number) => {
    const novo = !lidos.includes(c);
    setLido(livro.slug, c, novo);
    setLidos(getLidosDoLivro(livro.slug));
  };

  const pct = Math.round((lidos.length / livro.capitulos) * 100);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <header className="grid grid-cols-3 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] pb-2 shrink-0">
        <Link
          to="/biblia"
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
          <h1 className="text-[26px] font-light text-black tracking-tight">{livro.nome}</h1>
          <p className="text-sm text-black/50 mt-1">
            {livro.capitulos} {livro.capitulos === 1 ? "capítulo" : "capítulos"} ·{" "}
            {lidos.length} {lidos.length === 1 ? "lido" : "lidos"}
          </p>

          <div className="mt-3 mb-5 h-1 w-full rounded-full bg-black/5">
            <div
              className="h-1 rounded-full bg-black transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-[11px] text-black/40 mb-4">
            Toque no número para ler. Toque no quadradinho de cada capítulo para marcar como lido.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: livro.capitulos }, (_, i) => i + 1).map((c) => {
              const lido = lidos.includes(c);
              const parou = ultimoCap === c;
              return (
                <div key={c} className="relative">
                  <Link
                    to="/biblia/$livro/$capitulo"
                    params={{ livro: livro.slug, capitulo: String(c) }}
                    className={`flex h-14 items-center justify-center rounded-xl text-[15px] tabular-nums transition-all active:scale-95 ${
                      parou
                        ? "bg-black text-white font-semibold"
                        : lido
                          ? "bg-[#f1f26c] text-black font-medium"
                          : "bg-black/[0.04] text-black hover:bg-black/[0.08]"
                    }`}
                  >
                    {c}
                  </Link>
                  {parou && (
                    <Bookmark className="absolute -top-1 -left-1 h-4 w-4 fill-[#f1f26c] text-[#f1f26c]" />
                  )}
                  <button
                    onClick={() => alternar(c)}
                    aria-pressed={lido}
                    aria-label={`Marcar capítulo ${c} como lido`}
                    className={`absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-md border transition ${
                      lido
                        ? "border-black bg-black text-white"
                        : parou
                          ? "border-white/40 text-white/60"
                          : "border-black/15 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
