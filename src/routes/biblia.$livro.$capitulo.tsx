import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bookmark, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { carregarLivro, getLivro, livroAnterior, livroSeguinte } from "@/lib/biblia";
import {
  getMarcadorManual,
  isLido,
  setLido,
  setMarcador,
  toggleLido,
  toggleMarcadorManual,
  type Marcador,
} from "@/lib/biblia/marcador";

export const Route = createFileRoute("/biblia/$livro/$capitulo")({
  loader: ({ params }) => {
    const livro = getLivro(params.livro);
    const cap = parseInt(params.capitulo, 10);
    if (!livro || !Number.isFinite(cap) || cap < 1 || cap > livro.capitulos) throw notFound();
    return { livro, cap };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Capítulo não encontrado | Chosen" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const titulo = `${loaderData.livro.nome} ${loaderData.cap} — Bíblia NT | Chosen`;
    const desc = `Leia ${loaderData.livro.nome} capítulo ${loaderData.cap} no Chosen e marque onde você parou.`;
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
  component: LeituraPage,
});

function LeituraPage() {
  const { livro, cap } = Route.useLoaderData();
  const navigate = useNavigate();
  const [versiculos, setVersiculos] = useState<string[] | null>(null);
  const [manual, setManual] = useState<Marcador | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [versAtual, setVersAtual] = useState(1);
  const [lido, setLidoState] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let vivo = true;
    setVersiculos(null);
    carregarLivro(livro.slug).then((caps) => {
      if (!vivo) return;
      setVersiculos(caps?.[cap - 1] ?? []);
    });
    return () => {
      vivo = false;
    };
  }, [livro.slug, cap]);

  useEffect(() => {
    setManual(getMarcadorManual());
    setLidoState(isLido(livro.slug, cap));
    setVersAtual(1);
    setProgresso(0);
  }, [livro.slug, cap]);

  // Salva automaticamente o ponto de leitura enquanto a pessoa rola.
  useEffect(() => {
    if (!versiculos || versiculos.length === 0) return;
    const alvos = Array.from(document.querySelectorAll<HTMLElement>("[data-versiculo]"));
    if (alvos.length === 0) return;

    let timer: number | undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const visiveis = entries.filter((e) => e.isIntersecting);
        if (visiveis.length === 0) return;
        const n = Math.min(
          ...visiveis.map((e) => parseInt(e.target.getAttribute("data-versiculo") || "1", 10)),
        );
        setProgresso(Math.round((n / versiculos.length) * 100));
        setVersAtual(n);
        if (n >= versiculos.length) {
          setLido(livro.slug, cap, true);
          setLidoState(true);
        }
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          setMarcador({ livro: livro.slug, nome: livro.nome, capitulo: cap, versiculo: n });
        }, 600);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    alvos.forEach((a) => obs.observe(a));
    return () => {
      window.clearTimeout(timer);
      obs.disconnect();
    };
  }, [versiculos, livro.slug, livro.nome, cap]);

  // Rola até o versículo do link (#v16).
  useEffect(() => {
    if (!versiculos) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#v")) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ block: "center" });
  }, [versiculos]);

  const anteriorCap = cap > 1 ? cap - 1 : null;
  const proximoCap = cap < livro.capitulos ? cap + 1 : null;
  const livroAnt = livroAnterior(livro.slug);
  const livroProx = livroSeguinte(livro.slug);

  const irAnterior = () => {
    if (anteriorCap) {
      navigate({
        to: "/biblia/$livro/$capitulo",
        params: { livro: livro.slug, capitulo: String(anteriorCap) },
      });
    } else if (livroAnt) {
      navigate({
        to: "/biblia/$livro/$capitulo",
        params: { livro: livroAnt.slug, capitulo: String(livroAnt.capitulos) },
      });
    }
  };

  const irProximo = () => {
    if (proximoCap) {
      navigate({
        to: "/biblia/$livro/$capitulo",
        params: { livro: livro.slug, capitulo: String(proximoCap) },
      });
    } else if (livroProx) {
      navigate({
        to: "/biblia/$livro/$capitulo",
        params: { livro: livroProx.slug, capitulo: "1" },
      });
    }
  };

  const marcar = (n: number) => {
    const ativo = toggleMarcadorManual({
      livro: livro.slug,
      nome: livro.nome,
      capitulo: cap,
      versiculo: n,
    });
    setManual(getMarcadorManual());
    toast(
      ativo
        ? `Marcado: ${livro.nome} ${cap}:${n}`
        : "Marcação removida",
    );
  };

  const marcado = (n: number) =>
    !!manual && manual.livro === livro.slug && manual.capitulo === cap && manual.versiculo === n;

  const pareiAqui = () => {
    const n = versAtual;
    toggleMarcadorManual({
      livro: livro.slug,
      nome: livro.nome,
      capitulo: cap,
      versiculo: n,
    });
    setMarcador({ livro: livro.slug, nome: livro.nome, capitulo: cap, versiculo: n });
    setManual(getMarcadorManual());
    toast(`Salvo no celular: ${livro.nome} ${cap}:${n}`);
  };

  const alternarLido = () => {
    const novo = toggleLido(livro.slug, cap);
    setLidoState(novo);
    toast(
      novo
        ? `${livro.nome} ${cap} marcado como lido`
        : `${livro.nome} ${cap} desmarcado`,
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <header className="shrink-0 px-4 pt-[max(env(safe-area-inset-top),2rem)] pb-2">
        <div className="grid grid-cols-3 items-center">
          <Link
            to="/biblia/$livro"
            params={{ livro: livro.slug }}
            aria-label="Voltar"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start"
          >
            <ArrowLeft className="h-6 w-6 text-gray-400" />
          </Link>
          <span className="text-sm font-bold tracking-[0.2em] uppercase text-black text-center truncate">
            {livro.abrev} {cap}
          </span>
          <button
            onClick={alternarLido}
            aria-pressed={lido}
            aria-label="Marcar capítulo como lido"
            className={`justify-self-end flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition ${
              lido ? "bg-black text-white" : "bg-black/[0.05] text-black/60"
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            {lido ? "Lido" : "Lido?"}
          </button>
        </div>
        <div className="mt-2 h-0.5 w-full rounded-full bg-black/5">
          <div
            className="h-0.5 rounded-full bg-[#f1f26c] transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6">
        <div className="mx-auto w-full max-w-md pb-32 pt-4">
          <h1 className="text-[26px] font-light text-black tracking-tight mb-1">
            {livro.nome} {cap}
          </h1>
          <p className="text-[11px] text-black/40 mb-6">
            Toque no número do versículo, ou use o botão “Parei aqui” lá embaixo. Fica salvo no seu
            celular.
          </p>

          {!versiculos && (
            <div className="flex flex-col gap-3 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-black/[0.06] animate-pulse" />
              ))}
            </div>
          )}

          {versiculos && versiculos.length === 0 && (
            <p className="text-sm text-black/50">Capítulo indisponível.</p>
          )}

          {versiculos && versiculos.length > 0 && (
            <ol className="flex flex-col gap-4">
              {versiculos.map((texto, i) => {
                const n = i + 1;
                const ativo = marcado(n);
                return (
                  <li
                    key={n}
                    id={`v${n}`}
                    data-versiculo={n}
                    className={`flex items-start gap-3 rounded-xl -mx-2 px-2 py-1 transition-colors ${
                      ativo ? "bg-[#f1f26c]/50" : ""
                    }`}
                  >
                    <button
                      onClick={() => marcar(n)}
                      aria-label={`Marcar versículo ${n}`}
                      className="shrink-0 pt-[3px] text-[11px] tabular-nums font-semibold text-black/35 hover:text-black transition w-6 text-right"
                    >
                      {ativo ? <Bookmark className="h-3.5 w-3.5 fill-black text-black" /> : n}
                    </button>
                    <p className="text-[16px] leading-relaxed text-black font-light">{texto}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </main>

      <div
        className="shrink-0 border-t border-black/5 bg-white px-[4.5rem] py-3"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <div className="mx-auto mb-2 w-full max-w-md">
          <button
            onClick={pareiAqui}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-[14px] font-semibold text-white active:scale-[0.98] transition"
          >
            <Bookmark className="h-4 w-4 fill-[#f1f26c] text-[#f1f26c]" />
            Parei aqui · versículo {versAtual}
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-md items-center gap-2">
          <button
            onClick={irAnterior}
            disabled={!anteriorCap && !livroAnt}
            className="flex h-11 flex-1 items-center justify-center gap-1 rounded-full bg-black/[0.04] text-[13px] font-medium text-black disabled:opacity-30 active:scale-[0.98] transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            onClick={irProximo}
            disabled={!proximoCap && !livroProx}
            className="flex h-11 flex-1 items-center justify-center gap-1 rounded-full bg-[#f1f26c] text-[13px] font-semibold text-black disabled:opacity-30 active:scale-[0.98] transition"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
