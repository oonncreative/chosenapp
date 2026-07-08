import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

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

interface Etapa {
  titulo: string;
  legenda: string;
  texto: string;
}

const ETAPAS: Etapa[] = [
  {
    titulo: "Adorar",
    legenda: "Comece reconhecendo quem Deus é",
    texto:
      "Senhor, Tu és santo, fiel e digno de toda honra. Antes de qualquer pedido, eu paro só pra dizer: Tu és bom, e o Teu amor não muda.",
  },
  {
    titulo: "Agradecer",
    legenda: "Lembre-se do que Ele já fez",
    texto:
      "Obrigado, Pai, pela vida, pelo fôlego e pelas pessoas que colocaste no meu caminho. Obrigado pelo que já vi e pelo que ainda nem consigo perceber.",
  },
  {
    titulo: "Confessar",
    legenda: "Abra o coração com sinceridade",
    texto:
      "Perdoa o que em mim não Te agrada. Perdoa as palavras duras, os medos que me dominaram e as vezes em que segui o meu jeito. Restaura o meu coração.",
  },
  {
    titulo: "Pedir",
    legenda: "Traga o que pesa em oração",
    texto:
      "Senhor, olha pra minha vida hoje. Cuida do que me preocupa, dá sabedoria pras minhas decisões e paz onde a ansiedade quer entrar. Toca em cada pessoa que eu amo.",
  },
  {
    titulo: "Entregar",
    legenda: "Solte tudo nas mãos dEle",
    texto:
      "Eu solto o que não consigo carregar sozinho. Que seja feita a Tua vontade, no Teu tempo, do Teu jeito. Confio em Ti. Em nome de Jesus, amém.",
  },
];

function OraComigoPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const atual = ETAPAS[step];
  const isLast = step === ETAPAS.length - 1;

  const avancar = () => {
    if (isLast) {
      navigate({ to: "/home" });
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <header className="grid grid-cols-3 h-14 items-center px-4 pt-[max(env(safe-area-inset-top),1rem)] shrink-0">
        <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start">
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">CHOSEN</span>
        <span />
      </header>

      <button
        onClick={avancar}
        className="flex-1 flex flex-col items-center justify-center px-6 pb-24 text-center active:bg-black/[0.02] transition-colors"
      >
        <div className="flex items-center gap-1.5 mb-8">
          {ETAPAS.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === step ? "w-8 bg-black" : i < step ? "w-4 bg-black/60" : "w-4 bg-black/15"}`}
            />
          ))}
        </div>

        <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-black/50 mb-3">
          Etapa {step + 1} de {ETAPAS.length}
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