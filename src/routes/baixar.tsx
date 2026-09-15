import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  APP_STORE_URL,
  PLAY_URL,
  SITE_URL,
  destinoPara,
  detectarPlataforma,
  type Plataforma,
} from "@/lib/storeLinks";

export const Route = createFileRoute("/baixar")({
  head: () => ({
    meta: [
      { title: "Baixar o Chosen — inspirações pra cada momento do dia" },
      {
        name: "description",
        content:
          "Baixe o Chosen no iPhone ou Android, ou use direto pelo navegador. Versículos, orações e palavras de motivação todos os dias.",
      },
      { property: "og:title", content: "Baixar o Chosen" },
      {
        property: "og:description",
        content: "Versículos, orações e motivação pra cada momento do seu dia.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/baixar` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Baixar o Chosen" },
      {
        name: "twitter:description",
        content: "Versículos, orações e motivação pra cada momento do seu dia.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/baixar` }],
  }),
  component: Baixar,
});

function Baixar() {
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);

  useEffect(() => {
    const p = detectarPlataforma();
    setPlataforma(p);
    if (p === "ios" || p === "android") {
      const t = setTimeout(() => {
        window.location.replace(destinoPara(p));
      }, 600);
      return () => clearTimeout(t);
    }
    return;
  }, []);

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-6 text-center bg-background">
      <h1 className="text-3xl font-semibold tracking-tight uppercase text-foreground">Chosen</h1>
      <p className="max-w-sm text-sm text-foreground/60">
        {plataforma === "ios" || plataforma === "android"
          ? "Abrindo a loja do seu celular…"
          : "Inspirações escolhidas pra cada momento do seu dia."}
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href={APP_STORE_URL}
          className="rounded-full px-5 py-3 text-sm font-medium bg-foreground text-background"
        >
          Baixar no iPhone
        </a>
        <a
          href={PLAY_URL}
          className="rounded-full px-5 py-3 text-sm font-medium bg-foreground text-background"
        >
          Baixar no Android
        </a>
        <a
          href={SITE_URL}
          className="rounded-full px-5 py-3 text-sm font-medium border border-foreground/15 text-foreground"
        >
          Usar pelo navegador
        </a>
      </div>
    </main>
  );
}
