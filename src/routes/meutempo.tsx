import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { getLeituraPorTempo, type TempoLeitura } from "@/lib/leituras";

export const Route = createFileRoute("/meutempo")({
  head: () => ({
    meta: [
      { title: "Quanto tempo você tem? — Chosen" },
      {
        name: "description",
        content:
          "Escolha uma mensagem pelo tempo que você tem: 30 segundos, 2 minutos ou 5 minutos.",
      },
    ],
  }),
  component: MeuTempoPage,
});

function MeuTempoPage() {
  const navigate = useNavigate();

  const go = (tempo: TempoLeitura) => {
    const l = getLeituraPorTempo(tempo);
    navigate({ to: "/meutempo/ler", search: { tempo, id: l.id } });
  };

  const opcoes: { modo: TempoLeitura; titulo: string; sub: string }[] = [
    { modo: "curto", titulo: "Tenho 30 segundos", sub: "Uma passagem curta com interpretação" },
    { modo: "medio", titulo: "Tenho 2 minutos", sub: "Uma passagem média pra refletir" },
    { modo: "longo", titulo: "Tenho 5 minutos", sub: "Uma passagem longa com interpretação completa" },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <header className="grid grid-cols-3 h-14 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] shrink-0">
        <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start">
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">CHOSEN</span>
        <span />
      </header>

      <main className="flex-1 px-6 pb-24 pt-4 flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-black/70" strokeWidth={2} />
            <h1 className="text-sm font-light tracking-[0.3em] uppercase text-black">Quanto tempo você tem?</h1>
          </div>
          <p className="text-sm text-black/60 mb-6">
            Escolha e a gente separa uma passagem da Bíblia com interpretação no tempo certo pra agora.
          </p>

          <div className="flex flex-col gap-3">
            {opcoes.map((o) => (
              <button
                key={o.modo}
                onClick={() => go(o.modo)}
                className="w-full text-left px-5 py-5 rounded-3xl bg-black/[0.04] hover:bg-black/[0.07] active:scale-[0.98] transition-all"
              >
                <div className="text-base font-semibold text-black">{o.titulo}</div>
                <div className="text-xs text-black/60 mt-1">{o.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}