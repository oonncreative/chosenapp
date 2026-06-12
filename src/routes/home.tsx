import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CATEGORIAS, getRandomIdForCategoria } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [mode, setMode] = useState<"grid" | "falling" | "picked">("grid");
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const shakeListenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const lastShakeRef = useRef(0);

  const fallPositions = useMemo(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 375;
    const vh = typeof window !== "undefined" ? window.innerHeight : 700;
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    return CATEGORIAS.map((_, i) => ({
      x: rand(-vw * 0.32, vw * 0.32),
      y: rand(vh * 0.18, vh * 0.32),
      rot: rand(-35, 35),
      delay: i * 0.06,
    }));
  }, [mode === "falling"]);

  const cleanupShake = () => {
    if (shakeListenerRef.current) {
      window.removeEventListener("devicemotion", shakeListenerRef.current);
      shakeListenerRef.current = null;
    }
  };

  const pickRandom = () => {
    cleanupShake();
    const idx = Math.floor(Math.random() * CATEGORIAS.length);
    setPickedIdx(idx);
    setMode("picked");
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 60, 80]);
    }
    setTimeout(() => {
      const sentimento = CATEGORIAS[idx];
      navigate({
        to: "/mensagem/$sentimento",
        params: { sentimento },
        search: { color: "#f1f26c", id: getRandomIdForCategoria(sentimento) },
      });
    }, 1800);
  };

  const startShakeListener = () => {
    cleanupShake();
    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;
      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const now = Date.now();
      if (mag > 25 && now - lastShakeRef.current > 500) {
        lastShakeRef.current = now;
        pickRandom();
      }
    };
    shakeListenerRef.current = handler;
    window.addEventListener("devicemotion", handler);
  };

  const startSorteio = async () => {
    setPickedIdx(null);
    setMode("falling");
    try {
      const DM = (typeof DeviceMotionEvent !== "undefined" ? DeviceMotionEvent : null) as any;
      if (DM && typeof DM.requestPermission === "function") {
        const res = await DM.requestPermission();
        if (res === "granted") startShakeListener();
      } else {
        startShakeListener();
      }
    } catch {
      // ignore
    }
  };

  const resetSorteio = () => {
    cleanupShake();
    setPickedIdx(null);
    setMode("grid");
  };

  useEffect(() => () => cleanupShake(), []);

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      <header className="p-6 pt-12 flex flex-col gap-4 shrink-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-light tracking-[0.4em] text-black uppercase">RESSOA</h1>
          
          <div className="flex items-center gap-2">
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

        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="text-base font-light tracking-[0.4em] text-black uppercase">Qual seu sentimento?</h1>
          {mode === "grid" ? (
            <button
              onClick={startSorteio}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f1f26c] text-black text-[10px] font-semibold tracking-[0.2em] uppercase border-2 border-black active:scale-95 transition-transform"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                <circle cx="16" cy="16" r="1.2" fill="currentColor"/>
                <circle cx="16" cy="8" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="16" r="1.2" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
              </svg>
              Sorteio
            </button>
          ) : (
            <button
              onClick={resetSorteio}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-[10px] font-semibold tracking-[0.2em] uppercase border-2 border-black active:scale-95 transition-transform"
            >
              Cancelar
            </button>
          )}
        </div>
      </header>

      {mode === "grid" && (
      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pb-6 pt-2">
        <div className="flex flex-col gap-3">
          {CATEGORIAS.map((sentimento, index) => {
            return (
              <Link
                key={sentimento}
                to="/mensagem/$sentimento"
                params={{ sentimento }}
                search={{
                  color: "#f1f26c",
                  id: getRandomIdForCategoria(sentimento)
                }}
                className="group relative flex items-center gap-4 min-h-[96px] px-5 py-4 transition-all active:scale-[0.98] rounded-[28px] bg-white border-2 border-black hover:-translate-y-0.5"
              >
                <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                  <img
                    src={MASCOTES[sentimento]}
                    alt={sentimento}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="flex-1 text-lg font-medium tracking-tight uppercase text-black">
                  {sentimento}
                </span>
                <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity text-black">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      )}

      {mode !== "grid" && (
        <section className="flex-1 min-h-0 relative overflow-hidden">
          <AnimatePresence>
            {mode === "falling" && (
              <motion.div
                key="instruction"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-0 right-0 z-20 text-center px-6 pointer-events-none"
              >
                <motion.p
                  animate={{ x: [0, -4, 4, -4, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="text-[11px] font-semibold tracking-[0.3em] text-black uppercase"
                >
                  Chacoalhe o celular
                </motion.p>
                <p className="mt-1 text-[10px] tracking-[0.2em] text-black/50 uppercase">
                  para escolher um sentimento
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0">
            {CATEGORIAS.map((sentimento, index) => {
              const pos = fallPositions[index];
              const isPicked = pickedIdx === index;
              const isOther = mode === "picked" && pickedIdx !== null && !isPicked;
              return (
                <motion.div
                  key={sentimento}
                  initial={{ x: 0, y: -window.innerHeight, rotate: 0, opacity: 0 }}
                  animate={
                    isPicked
                      ? { x: 0, y: 0, rotate: 0, scale: 1.1, opacity: 1 }
                      : isOther
                      ? { x: pos.x, y: pos.y + 400, rotate: pos.rot * 2, opacity: 0 }
                      : { x: pos.x, y: pos.y, rotate: pos.rot, opacity: 1 }
                  }
                  transition={
                    isPicked
                      ? { type: "spring", stiffness: 200, damping: 18 }
                      : isOther
                      ? { duration: 0.5, ease: "easeIn" }
                      : {
                          type: "spring",
                          stiffness: 90,
                          damping: 12,
                          delay: pos.delay,
                        }
                  }
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginLeft: -110,
                    marginTop: -60,
                    zIndex: isPicked ? 50 : 10 + index,
                  }}
                  onClick={() => {
                    if (mode === "falling") pickRandom();
                  }}
                  className="w-[220px] flex items-center gap-3 px-4 py-3 rounded-[24px] bg-white border-2 border-black shadow-[4px_6px_0_rgba(0,0,0,0.9)] cursor-pointer"
                >
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                    <img
                      src={MASCOTES[sentimento]}
                      alt={sentimento}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <span className="flex-1 text-sm font-semibold tracking-tight uppercase text-black leading-tight">
                    {sentimento}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

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
