import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shuffle, List, GalleryHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, getRandomIdForCategoria, getRandomMensagemGlobal } from "@/lib/data";
import mascote1 from "@/assets/mascotes/mascote-1.png.asset.json";
import mascote2 from "@/assets/mascotes/mascote-2.png.asset.json";
import mascote3 from "@/assets/mascotes/mascote-3.png.asset.json";
import mascote4 from "@/assets/mascotes/mascote-4.png.asset.json";
import mascote5 from "@/assets/mascotes/mascote-5.png.asset.json";
import mascote6 from "@/assets/mascotes/mascote-6.png.asset.json";
import mascote7 from "@/assets/mascotes/mascote-7.png.asset.json";
import mascote8 from "@/assets/mascotes/mascote-8.png.asset.json";
import mascote9 from "@/assets/mascotes/mascote-9.png.asset.json";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const MASCOTES: Record<string, string> = {
  "Feliz": mascote1.url,
  "Ansioso": mascote4.url,
  "Triste": mascote6.url,
  "Sozinho": mascote3.url,
  "Agradecido": mascote7.url,
  "Nervoso": mascote9.url,
  "Preciso de esperança": mascote5.url,
  "Preciso de paz": mascote2.url,
  "Preciso de força": mascote8.url,
};

function HomePage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "swipe" | "tinder">(() => {
    if (typeof window === "undefined") return "list";
    return (localStorage.getItem("viewMode") as "list" | "swipe" | "tinder") || "list";
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      <header className="p-6 pt-12 flex flex-col gap-4 shrink-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-light tracking-[0.4em] text-black uppercase">RESSOA</h1>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const { categoria, id } = getRandomMensagemGlobal();
                navigate({ to: "/mensagem/$sentimento", params: { sentimento: categoria }, search: { color: "#f1f26c", id } });
              }}
              className="flex items-center p-3 transition-opacity active:opacity-50"
              title="Aleatório"
            >
              <Shuffle className="h-[22px] w-[22px] text-black" strokeWidth={2} />
            </button>
            <button 
              onClick={() => {
                const current = document.documentElement.classList.contains('grayscale');
                const next = !current;
                localStorage.setItem('isMono', next.toString());
                if (next) {
                  document.documentElement.classList.add('grayscale');
                } else {
                  document.documentElement.classList.remove('grayscale');
                }
              }}
              className="flex items-center p-3 transition-opacity active:opacity-50"
              title="Modo Minimalista"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
              </svg>
            </button>
            <button 
              onClick={() => {
                navigate({ to: "/oracoes" });
              }}
              className="flex items-center p-3 transition-opacity active:opacity-50"
              title="Orações Diárias"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={() => {
                navigate({ to: "/onboarding" });
              }}
              className="flex items-center p-3 -mr-3 transition-opacity active:opacity-50"
              title="Voltar ao início"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" className="text-black">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2">
          <h1 className="text-base font-light tracking-[0.4em] text-black uppercase">Qual seu sentimento?</h1>
        </div>

        <div className="flex items-center gap-1 mt-1 -ml-2">
          {([
            { key: "list", icon: List, label: "Lista" },
            { key: "swipe", icon: GalleryHorizontal, label: "Swipe" },
            { key: "tinder", icon: Layers, label: "Tinder" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-[11px] tracking-[0.2em] uppercase transition-all ${
                viewMode === key ? "bg-black text-white" : "text-black/50 hover:text-black"
              }`}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {viewMode === "list" && <ListView navigate={navigate} />}
      {viewMode === "swipe" && <SwipeView navigate={navigate} />}
      {viewMode === "tinder" && <TinderView navigate={navigate} />}

      <footer className="py-4 text-center bg-white border-t border-gray-50 shrink-0">
        <a 
          href="https://oonn.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] font-light tracking-[0.2em] text-gray-400 uppercase transition-colors hover:text-black"
        >
          OONN Creative — oonn.com.br
        </a>
      </footer>
    </div>
  );
}

type NavFn = ReturnType<typeof useNavigate>;

function goTo(navigate: NavFn, sentimento: string) {
  navigate({
    to: "/mensagem/$sentimento",
    params: { sentimento },
    search: { color: "#f1f26c", id: getRandomIdForCategoria(sentimento as any) },
  });
}

function ListView({ navigate }: { navigate: NavFn }) {
  return (
    <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pb-6 pt-2">
      <div className="flex flex-col gap-3">
        {CATEGORIAS.map((sentimento) => (
          <Link
            key={sentimento}
            to="/mensagem/$sentimento"
            params={{ sentimento }}
            search={{ color: "#f1f26c", id: getRandomIdForCategoria(sentimento) }}
            className="group relative flex items-center gap-4 min-h-[96px] px-5 py-4 transition-all active:scale-[0.98] rounded-[28px] bg-white border-2 border-black hover:-translate-y-0.5"
          >
            <div className="shrink-0 w-16 h-16 flex items-center justify-center">
              <img src={MASCOTES[sentimento]} alt={sentimento} className="w-full h-full object-contain" loading="lazy" />
            </div>
            <span className="flex-1 text-lg font-medium tracking-tight uppercase text-black">{sentimento}</span>
            <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SwipeView({ navigate }: { navigate: NavFn }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const [drag, setDrag] = useState(0);

  const total = CATEGORIAS.length;
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const onStart = (x: number) => { startX.current = x; deltaX.current = 0; };
  const onMove = (x: number) => {
    if (startX.current === null) return;
    deltaX.current = x - startX.current;
    setDrag(deltaX.current);
  };
  const onEnd = () => {
    if (Math.abs(deltaX.current) > 80) {
      if (deltaX.current < 0) next(); else prev();
    }
    startX.current = null; deltaX.current = 0; setDrag(0);
  };

  return (
    <section className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 pb-6 pt-2 select-none">
      <div
        className="relative w-full max-w-sm h-[440px]"
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => startX.current !== null && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={() => startX.current !== null && onEnd()}
      >
        {CATEGORIAS.map((sentimento, i) => {
          const offset = i - index;
          if (Math.abs(offset) > 1) return null;
          const translate = offset * 100 + (drag / 4);
          const scale = offset === 0 ? 1 : 0.9;
          const opacity = offset === 0 ? 1 : 0.4;
          return (
            <div
              key={sentimento}
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${translate}%) scale(${scale})`, opacity, transitionDuration: startX.current !== null ? "0ms" : "300ms" }}
            >
              <button
                onClick={() => offset === 0 && goTo(navigate, sentimento)}
                className="w-full h-full rounded-[32px] bg-white border-2 border-black flex flex-col items-center justify-center gap-6 p-8 active:scale-[0.98] transition-transform"
              >
                <div className="w-40 h-40 flex items-center justify-center">
                  <img src={MASCOTES[sentimento]} alt={sentimento} className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-medium tracking-tight uppercase text-black text-center">{sentimento}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-6 mt-6">
        <button onClick={prev} className="p-3 rounded-full border-2 border-black active:scale-95 transition-transform" title="Anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="flex items-center gap-1.5">
          {CATEGORIAS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-black" : "w-1.5 bg-black/20"}`} />
          ))}
        </div>
        <button onClick={next} className="p-3 rounded-full border-2 border-black active:scale-95 transition-transform" title="Próximo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
}

function TinderView({ navigate }: { navigate: NavFn }) {
  const [order, setOrder] = useState<string[]>([...CATEGORIAS]);
  const startX = useRef<number | null>(null);
  const startY = useRef(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);

  const top = order[0];

  const completeSwipe = (dir: "left" | "right") => {
    setExiting(dir);
    setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setExiting(null);
      setDrag({ x: 0, y: 0 });
    }, 260);
  };

  const onStart = (x: number, y: number) => { startX.current = x; startY.current = y; };
  const onMove = (x: number, y: number) => {
    if (startX.current === null) return;
    setDrag({ x: x - startX.current, y: y - startY.current });
  };
  const onEnd = () => {
    if (Math.abs(drag.x) > 110) {
      completeSwipe(drag.x > 0 ? "right" : "left");
    } else {
      setDrag({ x: 0, y: 0 });
    }
    startX.current = null;
  };

  return (
    <section className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 pb-6 pt-2 select-none">
      <div className="relative w-full max-w-sm h-[440px]">
        {order.slice(0, 3).reverse().map((sentimento, idxFromBottom) => {
          const stackIndex = 2 - idxFromBottom;
          const isTop = stackIndex === 0;
          const baseScale = 1 - stackIndex * 0.05;
          const baseY = stackIndex * 12;

          let transform = `translate(0px, ${baseY}px) scale(${baseScale})`;
          let transition = "transform 300ms ease-out, opacity 300ms ease-out";
          let opacity = 1;

          if (isTop) {
            if (exiting) {
              const x = exiting === "right" ? 600 : -600;
              transform = `translate(${x}px, ${drag.y}px) rotate(${exiting === "right" ? 25 : -25}deg)`;
              opacity = 0;
            } else {
              const rot = drag.x / 20;
              transform = `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`;
              transition = startX.current !== null ? "none" : "transform 300ms ease-out";
            }
          }

          return (
            <div
              key={sentimento + stackIndex}
              className="absolute inset-0"
              style={{ transform, transition, opacity, zIndex: 10 - stackIndex }}
              onTouchStart={isTop ? (e) => onStart(e.touches[0].clientX, e.touches[0].clientY) : undefined}
              onTouchMove={isTop ? (e) => onMove(e.touches[0].clientX, e.touches[0].clientY) : undefined}
              onTouchEnd={isTop ? onEnd : undefined}
              onMouseDown={isTop ? (e) => onStart(e.clientX, e.clientY) : undefined}
              onMouseMove={isTop ? (e) => startX.current !== null && onMove(e.clientX, e.clientY) : undefined}
              onMouseUp={isTop ? onEnd : undefined}
              onMouseLeave={isTop ? () => startX.current !== null && onEnd() : undefined}
            >
              <button
                onClick={() => isTop && Math.abs(drag.x) < 5 && goTo(navigate, sentimento)}
                className="w-full h-full rounded-[32px] bg-white border-2 border-black flex flex-col items-center justify-center gap-6 p-8 cursor-grab active:cursor-grabbing"
              >
                <div className="w-40 h-40 flex items-center justify-center pointer-events-none">
                  <img src={MASCOTES[sentimento]} alt={sentimento} className="w-full h-full object-contain" draggable={false} />
                </div>
                <span className="text-2xl font-medium tracking-tight uppercase text-black text-center pointer-events-none">{sentimento}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-6">
        <button onClick={() => completeSwipe("left")} className="p-4 rounded-full border-2 border-black active:scale-95 transition-transform" title="Pular">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={() => top && goTo(navigate, top)} className="px-6 py-4 rounded-full bg-black text-white text-xs tracking-[0.3em] uppercase active:scale-95 transition-transform">
          Abrir
        </button>
        <button onClick={() => completeSwipe("right")} className="p-4 rounded-full border-2 border-black active:scale-95 transition-transform" title="Próximo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
}
