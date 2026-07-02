import { createFileRoute, Link } from "@tanstack/react-router";
import { getMensagemById, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Share2, ArrowLeft, Heart } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { toast } from "sonner";
import { ShareSheet } from "@/components/share/ShareSheet";

const triggerHaptic = async () => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
};

export const Route = createFileRoute("/mensagem/$sentimento")({
  head: ({ params, loaderData }: { params: { sentimento: string }; loaderData?: { mensagem?: Mensagem } }) => ({
    meta: [
      {
        title: `Versículo para quando você está ${params.sentimento} — Chosen`,
      },
      {
        name: 'description',
        content: loaderData?.mensagem
          ? `"${loaderData.mensagem.texto}" — ${loaderData.mensagem.referencia}`
          : 'Uma palavra escolhida especialmente para você.',
      },
      {
        property: 'og:title',
        content: `Versículo para quando você está ${params.sentimento} — Chosen`,
      },
      {
        property: 'og:description',
        content: loaderData?.mensagem
          ? `"${loaderData.mensagem.texto}" — ${loaderData.mensagem.referencia}`
          : 'Uma palavra escolhida especialmente para você.',
      },
      {
        property: 'og:url',
        content: `https://chosen.oonn.com.br/mensagem/${params.sentimento}`,
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      color: (search.color as string) || "#2D8C3C",
      id: search.id as string,
    };
  },
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: ({ params, deps: { id } }) => {
    return {
      mensagem: getMensagemById(params.sentimento as Categoria, id),
    };
  },
  component: MensagemPage,
});

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const { mensagem } = Route.useLoaderData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [fav, setFav] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const fullText = `"${mensagem.texto}"`;

  useEffect(() => {
    if (mensagem?.id) setFav(isFavorite(mensagem.id));
  }, [mensagem?.id]);

  const handleToggleFav = () => {
    if (!mensagem) return;
    void triggerHaptic();
    const now = toggleFavorite({
      id: mensagem.id,
      categoria: sentimento,
      ref: mensagem.referencia,
      text: mensagem.texto,
    });
    setFav(now);
    toast(now ? "Adicionada às suas escolhidas 💛" : "Removida das escolhidas");
  };

  const handleOpenShare = () => {
    void triggerHaptic();
    setShareOpen(true);
  };

  return (
    <div
      className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-white"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 2rem)",
      }}
    >
      {/* Elemento para geração da imagem de compartilhamento - otimizado */}
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        mensagem={mensagem}
        sentimento={sentimento}
      />

      {/* Header fixo */}
      <header className="shrink-0 z-20 bg-white grid grid-cols-3 h-14 items-center px-4">
        <Link 
          to="/home" 
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 justify-self-start"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">
          CHOSEN
        </span>
        <button
          onClick={handleToggleFav}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 justify-self-end active:scale-90"
        >
          <Heart
            className={`h-6 w-6 transition-colors ${fav ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            strokeWidth={2}
          />
        </button>
      </header>

      <main className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-y-auto px-4 sm:px-6 py-2 text-center w-full">
        <div key={mensagem.id} className="w-full max-w-md animate-in fade-in duration-700 flex flex-col items-center">
          <p className="text-xl font-light leading-snug text-black sm:text-3xl md:text-4xl tracking-tight break-words cursor-default select-text">
            {fullText}
          </p>
          <p className="mt-6 text-[12px] font-bold tracking-[0.2em] uppercase text-black">
            {mensagem.referencia}
          </p>
          
          {mensagem.resumo && (
            <div className="mt-8 flex flex-col items-center w-full">
              <p className={`text-sm font-light text-gray-500 w-full max-w-[320px] leading-relaxed transition-all duration-300 break-words ${isExpanded ? "" : "line-clamp-4"}`}>
                {mensagem.resumo}
              </p>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-black transition-colors"
              >
                {isExpanded ? "menos" : "mais..."}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer fixo */}
      <footer className="shrink-0 z-20 w-full px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)] bg-white flex items-center justify-center gap-3">
        <Button
          onClick={handleOpenShare}
          className="h-12 rounded-full border-none bg-[#f1f26c] text-black hover:opacity-90 shadow-none flex items-center gap-2 px-6 transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="text-sm font-semibold tracking-wide">Compartilhar</span>
          <Share2 className="h-5 w-5 shrink-0" />
        </Button>
      </footer>
    </div>
  );
}
