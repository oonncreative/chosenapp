import { createFileRoute, Link } from "@tanstack/react-router";
import { decodeSharedPayload } from "@/lib/share";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/p/$payload")({
  head: ({ params }: { params: { payload: string } }) => {
    const p = decodeSharedPayload(params.payload);
    const title = p ? `Uma palavra escolhida pra você — CHOSEN` : "CHOSEN";
    const description = p ? `"${p.t}" — ${p.r}` : "Inspirações escolhidas pra cada momento.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: SharedPage,
});

function SharedPage() {
  const { payload } = Route.useParams();
  const data = decodeSharedPayload(payload);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 350);
    return () => clearTimeout(t);
  }, []);

  if (!data) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="text-sm tracking-[0.3em] uppercase text-black/60">CHOSEN</p>
          <p className="mt-4 text-lg text-black/80">Esse link parece inválido.</p>
          <Link to="/" className="mt-6 inline-block underline text-sm">Abrir o app</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <header className="px-4 pt-[max(env(safe-area-inset-top),1.5rem)] pb-3 text-center">
        <p className="text-xs tracking-[0.4em] uppercase text-black/60">CHOSEN</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          className={`max-w-md transition-all duration-700 ${
            reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <p className="text-[11px] tracking-[0.25em] uppercase text-black/50 mb-6">
            {data.n ? `${data.n} escolheu essa palavra pensando em você` : "Alguém escolheu essa palavra pensando em você"}
          </p>
          <p className="text-2xl sm:text-3xl font-light leading-snug text-black">
            "{data.t}"
          </p>
          <p className="mt-6 text-[12px] font-bold tracking-[0.2em] uppercase text-black">
            {data.r}
          </p>
        </div>
      </main>

      <footer className="px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-6 flex flex-col items-center gap-2">
        <Link
          to="/home"
          className="h-12 px-6 rounded-full bg-[#f1f26c] text-black text-sm font-semibold tracking-wide inline-flex items-center justify-center active:scale-95 transition-transform"
        >
          Receber a minha palavra
        </Link>
        <p className="text-[11px] text-black/40">chosen.oonn.com.br</p>
      </footer>
    </div>
  );
}