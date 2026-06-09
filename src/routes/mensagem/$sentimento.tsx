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
      // Pequeno delay para garantir que o DOM está pronto se necessário
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(shareRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        width: 1080,
        height: 1920,
        style: {
          display: "flex",
          visibility: "visible",
        },
      });

      // Baixar a imagem diretamente como fallback e principal método para garantir que funciona
      const link = document.createElement("a");
      link.download = "ressoa-mensagem.png";
      link.href = dataUrl;
      link.click();
      
      // Tentar compartilhar via API se disponível
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "ressoa.png", { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Ressoa",
              text: "Uma palavra para você.",
            });
          }
        } catch (shareErr) {
          console.log("Navegador não suporta compartilhamento de arquivos direto, download realizado.");
        }
      }
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white p-8">
      {/* Elemento oculto para geração da imagem de compartilhamento */}
      <div 
        ref={shareRef}
        className="fixed left-[-9999px] top-0 flex flex-col items-center justify-center bg-white p-20 text-center z-[-1]"
        style={{ width: "1080px", height: "1920px", display: "flex" }}
      >
        <span className="absolute top-20 text-2xl font-extralight tracking-[0.4em] text-black/20 uppercase">RESSOA</span>
        <div className="flex flex-col items-center gap-12 px-12">
          <p className="text-5xl font-light leading-[1.4] text-black">
            "{mensagem.texto}"
          </p>
          <p className="text-2xl font-medium tracking-[0.1em] text-black/50 uppercase">
            {mensagem.referencia}
          </p>
        </div>
      </div>

      <header className="flex h-12 items-center justify-between relative">
        <Link 
          to="/home" 
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 z-10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <h1 className="absolute inset-0 flex items-center justify-center text-[10px] font-extralight tracking-[0.4em] text-gray-300 uppercase pointer-events-none">
          Ressoa
        </h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div key={mensagem.id} className="w-full max-w-md animate-in fade-in duration-700">
          <p className="text-2xl font-light leading-relaxed text-black md:text-3xl tracking-tight">
            "{mensagem.texto}"
          </p>
          <p className="mt-8 text-xs font-medium tracking-[0.2em] uppercase text-gray-300">
            {mensagem.referencia}
          </p>
        </div>
      </main>

      <footer className="flex flex-col gap-2.5 pb-4">
        <Button
          onClick={handleRefresh}
          className="h-[60px] rounded-[30px] bg-[#F0F26C] text-xl font-bold tracking-tight text-black hover:bg-[#F0F26C]/90 shadow-none border-none"
        >
          Nova mensagem
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="h-[60px] rounded-[30px] border-2 border-black bg-white text-lg font-bold tracking-tight text-black hover:bg-gray-50 shadow-none"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </footer>
    </div>
  );
}
