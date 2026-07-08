import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { getDevocionalDoDia } from "@/lib/devocionais";

export const Route = createFileRoute("/devocional")({
  head: () => ({
    meta: [
      { title: "Devocional de 3 minutos — Chosen" },
      {
        name: "description",
        content:
          "Um versículo, uma pergunta pra pensar e uma oração curta. Um por dia.",
      },
    ],
  }),
  component: DevocionalPage,
});

function DevocionalPage() {
  const dev = getDevocionalDoDia();

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <header className="grid grid-cols-3 h-14 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] shrink-0">
        <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start">
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">CHOSEN</span>
        <span />
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-40 pt-4 flex flex-col items-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full max-w-md">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/50 mb-6 text-center">
            Devocional de hoje
          </p>

          <section className="mb-6 rounded-3xl border border-black/10 p-4">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 mb-2">
              Antes de começar
            </p>
            <p className="text-sm text-black/80 leading-relaxed">{dev.dica}</p>
          </section>

          <section className="mb-8 text-center">
            <p className="text-xl font-light leading-snug text-black md:text-2xl">
              "{dev.versiculo}"
            </p>
            <p className="mt-4 text-[11px] font-bold tracking-[0.25em] uppercase text-black">
              {dev.referencia}
            </p>
          </section>

          <section className="mb-8 rounded-3xl bg-black/[0.03] p-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 mb-2">
              Reflexão
            </p>
            <p className="text-base text-black leading-relaxed">{dev.reflexao}</p>
          </section>

          <section className="mb-8 rounded-3xl bg-black/[0.04] p-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 mb-2">
              Pra pensar
            </p>
            <p className="text-base text-black leading-relaxed">{dev.pergunta}</p>
          </section>

          <section className="rounded-3xl bg-[#f1f26c]/40 p-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/60 mb-2">
              Oração
            </p>
            <p className="text-base text-black leading-relaxed">{dev.oracao}</p>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}