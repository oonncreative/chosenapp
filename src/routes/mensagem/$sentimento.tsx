import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getProximaMensagem, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Share2, ArrowLeft } from "lucide-react";
import * as htmlToImage from "html-to-image";

export const Route = createFileRoute("/mensagem/$sentimento")({
  component: MensagemPage,
});

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const navigate = useNavigate();
  const [mensagem] = useState<Mensagem>(() => getProximaMensagem(sentimento as Categoria));
  const shareRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");

  useEffect(() => {
    // Converter logo para base64 para garantir que seja incluída na imagem
    fetch("/0novalogo.png")
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(err => console.error("Erro ao carregar logo para base64:", err));
  }, []);

  const handleRefresh = () => {
    navigate({ to: "/home" });
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
        pixelRatio: 1, // Fixar ratio para evitar problemas de escala
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
      {/* Elemento para geração da imagem de compartilhamento - movido para fora do viewport mas visível para o html-to-image */}
      <div 
        style={{ 
          position: 'absolute',
          left: '-2000px',
          top: '0',
          width: '1080px',
          height: '1920px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px'
        }}
        ref={shareRef}
      >
        <img src="/0novalogo.png" alt="Ressoa" style={{ position: 'absolute', top: '80px', width: '60px', height: '60px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '48px' }}>
          <p style={{ fontSize: '48px', fontWeight: '300', lineHeight: '1.4', color: '#000000', margin: '0' }}>
            "{mensagem.texto}"
          </p>
          <p style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '0.1em', color: '#000000', textTransform: 'uppercase', margin: '0' }}>
            {mensagem.referencia}
          </p>
          {mensagem.fraseMotivacional && (
            <p style={{ marginTop: '32px', fontSize: '30px', fontWeight: '300', fontStyle: 'italic', color: 'rgba(0,0,0,0.4)', padding: '0 80px' }}>
              {mensagem.fraseMotivacional}
            </p>
          )}
        </div>
      </div>

      <header className="flex h-12 items-center justify-between relative">
        <Link 
          to="/home" 
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 z-10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/0novalogo.png" alt="Ressoa" className="h-6 w-6 object-contain" />
        </div>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div key={mensagem.id} className="w-full max-w-md animate-in fade-in duration-700 flex flex-col items-center">
          <p className="text-2xl font-light leading-relaxed text-black md:text-3xl tracking-tight">
            "{mensagem.texto}"
          </p>
          <p className="mt-4 text-[10px] font-bold tracking-[0.2em] uppercase text-black">
            {mensagem.referencia}
          </p>
          
          {mensagem.fraseMotivacional && (
            <p className="mt-12 text-sm font-light italic text-gray-400 max-w-[280px]">
              {mensagem.fraseMotivacional}
            </p>
          )}
        </div>
      </main>

      <footer className="grid grid-cols-2 gap-3 pb-6 shrink-0">
        <Button
          onClick={handleRefresh}
          className="h-[56px] rounded-full bg-[#F0F26C] text-sm font-bold tracking-tight text-black hover:bg-[#F0F26C]/90 shadow-none border-none whitespace-nowrap px-2"
        >
          Novo sentimento
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="h-[56px] rounded-full border-2 border-black bg-white text-sm font-bold tracking-tight text-black hover:bg-gray-50 shadow-none flex items-center justify-center gap-2 px-2"
        >
          <Share2 className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Compartilhar</span>
        </Button>
      </footer>
    </div>
  );
}
