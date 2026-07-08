import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, Play, Pause } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  DURACAO_SEGUNDOS,
  LABEL_TEMPO,
  getLeituraById,
  getLeituraPorTempo,
  type TempoLeitura,
} from "@/lib/leituras";

const searchSchema = z.object({
  tempo: z.enum(["curto", "medio", "longo"]).catch("curto"),
  id: z.string().optional(),
});

export const Route = createFileRoute("/meutempo/ler")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Leitura no tempo certo — Chosen" },
      {
        name: "description",
        content:
          "Uma passagem da Bíblia com interpretação, no tempo que você tem agora.",
      },
    ],
  }),
  component: LerPage,
});

function formatMMSS(secs: number) {
  const s = Math.max(0, Math.floor(secs));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function LerPage() {
  const { tempo, id } = Route.useSearch();
  const navigate = useNavigate();

  const leitura = useMemo(() => {
    if (id) {
      const found = getLeituraById(id);
      if (found && found.tempo === tempo) return found;
    }
    return getLeituraPorTempo(tempo as TempoLeitura);
  }, [id, tempo]);

  const total = DURACAO_SEGUNDOS[tempo as TempoLeitura];
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(total);
    setRunning(true);
  }, [leitura.id, total]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const trocar = () => {
    const l = getLeituraPorTempo(tempo as TempoLeitura, leitura.id);
    navigate({ to: "/meutempo/ler", search: { tempo, id: l.id } });
  };

  const progresso = 1 - remaining / total;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <header className="grid grid-cols-3 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] pb-2 shrink-0">
        <Link
          to="/meutempo"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">
          CHOSEN
        </span>
        <button
          onClick={trocar}
          className="justify-self-end flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Outra leitura"
        >
          <RefreshCw className="h-5 w-5 text-black/60" />
        </button>
      </header>

      {/* Timer fixo no topo */}
      <div className="px-6 pt-2 pb-4 shrink-0">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/50">
              {LABEL_TEMPO[tempo as TempoLeitura]}
            </span>
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-sm font-semibold text-black">
                {formatMMSS(remaining)}
              </span>
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.05] hover:bg-black/[0.1]"
                aria-label={running ? "Pausar" : "Continuar"}
              >
                {running ? (
                  <Pause className="h-3.5 w-3.5 text-black" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-black" />
                )}
              </button>
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-black/[0.08] overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-1000 ease-linear"
              style={{ width: `${Math.min(100, Math.max(0, progresso * 100))}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 pb-24 flex flex-col items-center">
        <div className="w-full max-w-md">
          <h1 className="text-xl font-medium tracking-tight text-black mb-4">
            {leitura.titulo}
          </h1>

          <section className="mb-6">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/50 mb-3">
              Passagem
            </p>
            <p className="text-base leading-relaxed text-black">
              "{leitura.passagem}"
            </p>
            <p className="mt-3 text-[11px] font-bold tracking-[0.25em] uppercase text-black">
              {leitura.referencia}
            </p>
          </section>

          <section className="rounded-3xl bg-black/[0.04] p-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 mb-2">
              Interpretação
            </p>
            <p className="text-base text-black leading-relaxed">
              {leitura.interpretacao}
            </p>
          </section>

          <div className="flex gap-3 mt-8">
            <button
              onClick={trocar}
              className="flex-1 px-4 py-3 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-black/90 active:scale-[0.98] transition-all"
            >
              Outra leitura
            </button>
            <Link
              to="/meutempo"
              className="flex-1 text-center px-4 py-3 rounded-2xl bg-black/[0.05] text-black text-sm font-semibold hover:bg-black/[0.08] active:scale-[0.98] transition-all"
            >
              Mudar tempo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}