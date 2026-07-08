import { createFileRoute, Link } from "@tanstack/react-router";
import { getMensagemById, getProximaMensagemFeed, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Share2, ArrowLeft, Heart, ChevronUp } from "lucide-react";
import { isFavorite, toggleFavorite, addToHistory } from "@/lib/favorites";
import { toast } from "sonner";
import { ShareSheet } from "@/components/share/ShareSheet";

function ResumoBlock({ text }: { text: string }) {
  const pRef = useRef<HTMLParagraphElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = pRef.current;
    if (!el) return;
    const check = () => {
      // Só há necessidade do botão se, colapsado, o texto realmente estoura o clamp.
      const prevExpanded = el.classList.contains("chosen-resumo-expanded");
      el.classList.remove("chosen-resumo-expanded");
      const doesOverflow = el.scrollHeight - el.clientHeight > 1;
      if (prevExpanded) el.classList.add("chosen-resumo-expanded");
      setOverflows(doesOverflow);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div className="mt-8 flex flex-col items-center w-full">
      <p
        ref={pRef}
        className={`chosen-resumo text-sm font-light text-gray-500 w-full max-w-[320px] leading-relaxed transition-all duration-300 break-words ${
          isExpanded ? "chosen-resumo-expanded" : "line-clamp-4"
        }`}
      >
        {text}
      </p>
      {overflows && (
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="mt-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
        >
          {isExpanded ? "menos" : "mais..."}
        </button>
      )}
    </div>
  );
}

const triggerHaptic = async () => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
};

export const Route = createFileRoute("/mensagem/$sentimento")({
  head: ({ params, loaderData }: { params: { sentimento: string }; loaderData?: { mensagem?: Mensagem } }) => ({
    meta: [
      {
        title: `Versículo para quando você está ${params.sentimento} — Chosen`,
      },
      {
        name: 'description',
        content: loaderData?.mensagem
          ? `"${loaderData.mensagem.texto}" — ${loaderData.mensagem.referencia}`
          : 'Uma palavra escolhida especialmente para você.',
      },
      {
        property: 'og:title',
        content: `Versículo para quando você está ${params.sentimento} — Chosen`,
      },
      {
        property: 'og:description',
        content: loaderData?.mensagem
          ? `"${loaderData.mensagem.texto}" — ${loaderData.mensagem.referencia}`
          : 'Uma palavra escolhida especialmente para você.',
      },
      {
        property: 'og:url',
        content: `https://chosen.oonn.com.br/mensagem/${params.sentimento}`,
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      color: (search.color as string) || "#2D8C3C",
      id: search.id as string,
    };
  },
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: ({ params, deps: { id } }) => {
    return {
      mensagem: getMensagemById(params.sentimento as Categoria, id),
    };
  },
  component: MensagemPage,
});

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const { mensagem: mensagemInicial } = Route.useLoaderData();
  const [feed, setFeed] = useState<Mensagem[]>([mensagemInicial]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  const mensagemAtual = feed[currentIndex] ?? mensagemInicial;

  // Carrega estado de favorito para toda mensagem que entra no feed.
  useEffect(() => {
    setFavMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const m of feed) {
        if (!(m.id in next)) {
          next[m.id] = isFavorite(m.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [feed]);

  // Registra no histórico sempre que uma mensagem se torna visível.
  useEffect(() => {
    if (!mensagemAtual?.id) return;
    addToHistory({
      id: mensagemAtual.id,
      categoria: sentimento,
      ref: mensagemAtual.referencia,
      text: mensagemAtual.texto,
    });
  }, [mensagemAtual?.id, mensagemAtual?.referencia, mensagemAtual?.texto, sentimento]);

  // Atualiza a URL (sem navegar) para refletir a mensagem visível — mantém deep-link/back.
  useEffect(() => {
    if (!mensagemAtual?.id) return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("id") !== mensagemAtual.id) {
        url.searchParams.set("id", mensagemAtual.id);
        window.history.replaceState(window.history.state, "", url.toString());
      }
    } catch {}
  }, [mensagemAtual?.id]);

  // Adiciona novas mensagens ao feed quando o usuário se aproxima do fim.
  const ensureNext = useCallback(() => {
    setFeed((prev) => {
      if (currentIndex < prev.length - 2) return prev;
      const excluir = prev.map((m) => m.id);
      const proxima = getProximaMensagemFeed(sentimento as Categoria, excluir);
      return [...prev, proxima];
    });
  }, [currentIndex, sentimento]);

  useEffect(() => {
    ensureNext();
  }, [ensureNext]);

  // Detecta qual slide está visível.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.idx);
          if (Number.isNaN(idx)) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx, ratio: e.intersectionRatio };
          }
        }
        if (best && best.ratio > 0.55) {
          setCurrentIndex((old) => (old === best!.idx ? old : best!.idx));
        }
      },
      { root: scroller, threshold: [0.25, 0.55, 0.85] },
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [feed.length]);

  // Dica visual de "arraste pra cima" na primeira abertura.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const KEY = "chosen_feed_hint_v1";
      if (!localStorage.getItem(KEY)) {
        setShowHint(true);
        const t = setTimeout(() => {
          setShowHint(false);
          localStorage.setItem(KEY, "1");
        }, 4500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  // Some com a dica assim que rolar.
  useEffect(() => {
    if (currentIndex > 0 && showHint) setShowHint(false);
  }, [currentIndex, showHint]);

  const handleToggleFav = () => {
    if (!mensagemAtual) return;
    void triggerHaptic();
    const now = toggleFavorite({
      id: mensagemAtual.id,
      categoria: sentimento,
      ref: mensagemAtual.referencia,
      text: mensagemAtual.texto,
    });
    setFavMap((prev) => ({ ...prev, [mensagemAtual.id]: now }));
    toast(now ? "Adicionada às suas escolhidas 💛" : "Removida das escolhidas");
  };

  const handleOpenShare = () => {
    void triggerHaptic();
    setShareOpen(true);
  };

  const favAtual = favMap[mensagemAtual.id] ?? false;

  return (
    <div
      className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-white"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 2rem)",
      }}
    >
      {/* Elemento para geração da imagem de compartilhamento - otimizado */}
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        mensagem={mensagemAtual}
        sentimento={sentimento}
      />

      {/* Header fixo */}
      <header className="shrink-0 z-20 bg-white grid grid-cols-3 h-14 items-center px-4">
        <Link 
          to="/home" 
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 justify-self-start"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">
          CHOSEN
        </span>
        <button
          onClick={handleToggleFav}
          aria-label={favAtual ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 justify-self-end active:scale-90"
        >
          <Heart
            className={`h-6 w-6 transition-colors ${favAtual ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            strokeWidth={2}
          />
        </button>
      </header>

      <main
        ref={scrollerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto snap-y snap-mandatory no-scrollbar overscroll-contain"
        style={{ scrollBehavior: "smooth" }}
      >
        {feed.map((m, idx) => (
            <section
              key={`${m.id}-${idx}`}
              data-idx={idx}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              className="snap-start snap-always h-full min-h-full w-full flex flex-col items-center justify-center px-4 sm:px-6 py-2 text-center"
            >
              <div className="w-full max-w-md animate-in fade-in duration-500 flex flex-col items-center">
                <p className="text-xl font-light leading-snug text-black sm:text-3xl md:text-4xl tracking-tight break-words cursor-default select-text">
                  {`"${m.texto}"`}
                </p>
                <p className="mt-6 text-[12px] font-bold tracking-[0.2em] uppercase text-black">
                  {m.referencia}
                </p>

                {m.resumo && <ResumoBlock text={m.resumo} />}
              </div>
            </section>
          ))}
      </main>

      {showHint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-10 flex flex-col items-center gap-1 text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <ChevronUp className="h-5 w-5 animate-bounce" />
          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase">
            Arraste para a próxima
          </span>
        </div>
      )}

      {/* Footer fixo */}
      <footer className="shrink-0 z-20 w-full px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+36px)] bg-white flex items-center justify-center gap-3">
        <Button
          onClick={handleOpenShare}
          className="h-12 rounded-full border-none bg-[#f1f26c] text-black hover:opacity-90 shadow-none flex items-center gap-2 px-6 transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="text-sm font-semibold tracking-wide">Compartilhar</span>
          <Share2 className="h-5 w-5 shrink-0" />
        </Button>
      </footer>
    </div>
  );
}
