import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { ORACOES_GUIADAS, getSessaoAleatoria } from "@/lib/oracoesGuiadas";

export const Route = createFileRoute("/ora-comigo")({
  head: () => ({
    meta: [
      { title: "Ora comigo — Chosen" },
      {
        name: "description",
        content:
          "Uma oração guiada em 5 etapas: adorar, agradecer, confessar, pedir e entregar.",
      },
    ],
  }),
  component: OraComigoPage,
});

function OraComigoPage() {
  const navigate = useNavigate();
  const [sessaoId, setSessaoId] = useState(() => getSessaoAleatoria().id);
  const [step, setStep] = useState(0);
  const sessao = useMemo(
    () => ORACOES_GUIADAS.find((s) => s.id === sessaoId) ?? ORACOES_GUIADAS[0],
    [sessaoId],
  );
  const atual = sessao.etapas[step];
  const isLast = step === sessao.etapas.length - 1;

  const avancar = () => {
    if (isLast) {
      navigate({ to: "/home" });
      return;
    }
    setStep((s) => s + 1);
  };

  const trocarOracao = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSessaoId(getSessaoAleatoria(sessao.id).id);
    setStep(0);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <header className="grid grid-cols-3 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] pb-2 shrink-0">
        <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start">
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">CHOSEN</span>
        <button
          onClick={trocarOracao}
          className="justify-self-end text-[10px] font-bold tracking-[0.25em] uppercase text-black/50 hover:text-black px-2 py-1"
        >
          Outra
        </button>
      </header>

      <button
        onClick={avancar}
        className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center active:bg-black/[0.02] transition-colors"
      >
        <div className="flex items-center gap-1.5 mb-8">
          {sessao.etapas.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === step ? "w-8 bg-black" : i < step ? "w-4 bg-black/60" : "w-4 bg-black/15"}`}
            />
          ))}
        </div>

        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-black/40 mb-2">
          {sessao.tema}
        </p>
        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-black/50 mb-3">
          Etapa {step + 1} de {sessao.etapas.length}
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-black mb-1">
          {atual.titulo}
        </h1>
        <p className="text-xs text-black/50 mb-8">{atual.legenda}</p>

        <p className="max-w-md text-lg font-light leading-relaxed text-black">
          {atual.texto}
        </p>

        <p className="mt-12 text-[10px] font-bold tracking-[0.3em] uppercase text-black/40">
          {isLast ? "Toque para encerrar" : "Toque para continuar"}
        </p>
      </button>
    </div>
  );
}