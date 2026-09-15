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

  const reiniciar = () => {
    if (!window.confirm(`Reiniciar a leitura de ${livro.nome}? Isso apaga os capítulos lidos e o marcador deste livro.`))
      return;
    reiniciarLivro(livro.slug);
    setLidos([]);
    setUltimoCap(null);
    toast(`Leitura de ${livro.nome} reiniciada`);
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
          <div className="rounded-3xl bg-[#f1f26c] px-5 py-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/50">
              Novo Testamento
            </p>
            <h1 className="mt-1 text-[30px] leading-none font-semibold text-black tracking-tight">
              {livro.nome}
            </h1>
            <p className="text-[13px] text-black/60 mt-2">
              {livro.capitulos} {livro.capitulos === 1 ? "capítulo" : "capítulos"} ·{" "}
              {lidos.length} {lidos.length === 1 ? "lido" : "lidos"} · {pct}%
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-black/10">
              <div
                className="h-1.5 rounded-full bg-black transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-black/40 mt-5 mb-1">
            Siga a trilha: toque no número para ler e no tique para marcar como lido.
          </p>

          {(lidos.length > 0 || ultimoCap !== null) && (
            <button
              onClick={reiniciar}
              className="mb-2 flex h-9 items-center gap-1.5 rounded-full bg-black/[0.04] px-3 text-[12px] font-medium text-black/60 active:scale-[0.98] transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar leitura deste livro
            </button>
          )}

          <TrilhaCapitulos
            slug={livro.slug}
            total={livro.capitulos}
            lidos={lidos}
            atual={atual}
            onAlternar={alternar}
          />
        </div>
      </main>


      <AppFooter />
    </div>
  );
}
