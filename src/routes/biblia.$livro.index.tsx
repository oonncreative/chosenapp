import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, Check } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { getLivro } from "@/lib/biblia";
import {
  getLidosDoLivro,
  getMarcador,
  getMarcadorManual,
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

  useEffect(() => {
    const m = getMarcadorManual() ?? getMarcador();
    if (m && m.livro === livro.slug) setUltimoCap(m.capitulo);
    else setUltimoCap(null);
  }, [livro.slug]);

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
          <p className="text-sm text-black/50 mt-1 mb-6">
            {livro.capitulos} {livro.capitulos === 1 ? "capítulo" : "capítulos"} · escolha por onde
            começar
          </p>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: livro.capitulos }, (_, i) => i + 1).map((c) => (
              <Link
                key={c}
                to="/biblia/$livro/$capitulo"
                params={{ livro: livro.slug, capitulo: String(c) }}
                className={`flex h-12 items-center justify-center rounded-xl text-[15px] tabular-nums transition-all active:scale-95 ${
                  ultimoCap === c
                    ? "bg-black text-white font-semibold"
                    : "bg-black/[0.04] text-black hover:bg-black/[0.08]"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
