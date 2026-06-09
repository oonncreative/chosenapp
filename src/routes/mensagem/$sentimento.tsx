import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getProximaMensagem, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Share2, RefreshCw, ArrowLeft } from "lucide-react";
import { toPng } from "html-to-image";

export const Route = createFileRoute("/mensagem/$sentimento")({
  component: MensagemPage,
});

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const [mensagem, setMensagem] = useState<Mensagem>(() => getProximaMensagem(sentimento as Categoria));
  const shareRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setMensagem(getProximaMensagem(sentimento as Categoria));
  };

  const handleShare = async () => {
    if (!shareRef.current) return;

    try {
      const dataUrl = await toPng(shareRef.current, {
        width: 1080,
        height: 1920,
        style: {
          display: "flex",
          visibility: "visible",
        },
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "ressoa-mensagem.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Ressoa",
          text: "Uma palavra para você.",
        });
      } else {
        const link = document.createElement("a");
        link.download = "ressoa.png";
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background p-8">
      {/* Elemento oculto para geração da imagem de compartilhamento */}
      <div 
        ref={shareRef}
        className="fixed left-[-9999px] top-0 flex flex-col items-center justify-center bg-white p-20 text-center"
        style={{ width: "1080px", height: "1920px" }}
      >
        <span className="absolute top-20 text-xl font-medium tracking-[0.2em] text-black/40">RESSOA</span>
        <div className="flex flex-col items-center gap-12 px-12">
          <p className="text-5xl font-light leading-[1.4] text-black">
            "{mensagem.texto}"
          </p>
          <p className="text-2xl font-medium tracking-[0.1em] text-black/50 uppercase">
            {mensagem.referencia}
          </p>
        </div>
      </div>

      <header className="flex h-12 items-center">
        <Link 
          to="/home" 
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div key={mensagem.id} className="w-full max-w-md animate-in fade-in duration-700">
          <p className="text-3xl font-bold leading-tight tracking-tight text-black md:text-4xl">
            "{mensagem.texto}"
          </p>
          <p className="mt-8 text-sm font-bold tracking-widest uppercase text-black/40">
            {mensagem.referencia}
          </p>

        </div>
      </main>

      <footer className="flex flex-col gap-3 pb-4">
        <Button
          onClick={handleRefresh}
          className="h-[72px] rounded-[36px] bg-[#F0F26C] text-2xl font-bold tracking-tight text-black hover:bg-[#F0F26C]/90 shadow-none border-none"
        >
          Nova mensagem
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="h-[72px] rounded-[36px] border-2 border-black bg-white text-xl font-bold tracking-tight text-black hover:bg-gray-50 shadow-none"
        >
          <Share2 className="mr-2 h-5 w-5" />
          Compartilhar
        </Button>
      </footer>

    </div>
  );
}
