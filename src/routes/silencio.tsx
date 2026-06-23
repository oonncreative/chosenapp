import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { pickSilenceWord } from "@/lib/silenceWords";

export const Route = createFileRoute("/silencio")({
  validateSearch: (s: Record<string, unknown>) => ({
    w: typeof s.w === "string" ? (s.w as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Silêncio — CHOSEN" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SilencioPage,
});

function SilencioPage() {
  const { w } = Route.useSearch();
  // Seed determinístico pelo dia (ISO week-day-year) pra todos verem o mesmo no sábado
  const [word] = useState(() => {
    if (w) return w;
    const d = new Date();
    const seed = d.getFullYear() * 1000 + Math.floor(d.getTime() / (24 * 3600 * 1000));
    return pickSilenceWord(seed);
  });
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <header className="px-4 pt-[max(env(safe-area-inset-top),1.5rem)] pb-3 text-center">
        <p className="text-[10px] tracking-[0.5em] uppercase text-black/40">CHOSEN — silêncio</p>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 text-center">
        <p
          className={`text-5xl sm:text-6xl font-extralight tracking-tight text-black transition-all duration-1000 ${
            show ? "opacity-100" : "opacity-0"
          }`}
        >
          {word}
        </p>
      </main>
      <footer className="px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] text-center">
        <Link to="/home" className="text-[11px] tracking-[0.3em] uppercase text-black/40">
          voltar
        </Link>
      </footer>
    </div>
  );
}