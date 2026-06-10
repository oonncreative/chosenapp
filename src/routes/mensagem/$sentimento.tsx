import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getProximaMensagem, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Share2, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";

export const Route = createFileRoute("/mensagem/$sentimento")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      color: (search.color as string) || "#2D8C3C",
    };
  },
  component: MensagemPage,
});

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const { color } = Route.useSearch();
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
      // Pequeno delay para garantir que o DOM está pronto e imagens carregadas
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = shareRef.current;
      
      // Usando html2canvas que é mais confiável no iOS
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 2, // Melhor qualidade
        logging: false,
        width: 1080,
        height: 1920,
      });

      const dataUrl = canvas.toDataURL("image/png");

      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Imagem gerada está vazia");
      }

      // Se for mobile e tiver API de share, priorizar ela
      if (navigator.share) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], "ressoa-mensagem.png", { type: "image/png" });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Ressoa",
              text: `"${mensagem.texto}" - ${mensagem.referencia}`,
            });
            return;
          }
        } catch (shareErr) {
          console.log("Erro no share nativo, tentando fallback de download:", shareErr);
        }
      }

      // Fallback para download direto
      const link = document.createElement("a");
      link.download = `ressoa-${sentimento}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white p-8">
      {/* Elemento para geração da imagem de compartilhamento - otimizado */}
      <div 
        ref={shareRef}
        style={{ 
          position: 'fixed',
          left: '0',
          top: '0',
          width: '1080px',
          height: '1920px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: -100, // Muito atrás de tudo
          opacity: 0.01, // Quase invisível mas presente para o browser
          pointerEvents: 'none',
        }}
      >
        <div style={{ position: 'absolute', top: '150px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          {logoBase64 && <img src={logoBase64} alt="Ressoa" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px', padding: '0 100px', width: '100%' }}>
          <p style={{ 
            fontSize: '56px', 
            fontWeight: '300', 
            lineHeight: '1.4', 
            color: '#000000', 
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            "{mensagem.texto}"
          </p>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            letterSpacing: '0.2em', 
            color: '#000000', 
            textTransform: 'uppercase', 
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {mensagem.referencia}
          </p>
          {mensagem.fraseMotivacional && (
            <p style={{ 
              marginTop: '40px', 
              fontSize: '32px', 
              fontWeight: '300', 
              fontStyle: 'italic', 
              color: 'rgba(0,0,0,0.5)', 
              padding: '0 40px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {mensagem.fraseMotivacional}
            </p>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: '100px', width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '20px', fontWeight: '300', letterSpacing: '0.3em', color: '#cccccc', textTransform: 'uppercase' }}>
            Ressoa
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

      <footer className="flex flex-row gap-3 pb-8 shrink-0 w-full">
        <Button
          onClick={handleRefresh}
          className="h-[60px] flex-1 rounded-[24px] bg-transparent border-2 border-black text-black text-sm font-black tracking-tighter hover:bg-black/5 shadow-none uppercase italic transition-all active:scale-95"
        >
          Novo sentimento
        </Button>
        <Button
          onClick={handleShare}
          style={{ backgroundColor: color.startsWith('#') ? color : undefined }}
          className={`h-[60px] flex-1 rounded-[24px] border-none ${color === 'bg-white' ? 'bg-white text-black border-2 border-black' : (color.startsWith('bg-') ? `${color} text-white` : 'text-white')} text-sm font-black tracking-tighter hover:opacity-90 shadow-none flex items-center justify-center gap-2 uppercase italic transition-all active:scale-95`}
        >
          <Share2 className="h-4 w-4 shrink-0" />
          <span>Compartilhar</span>
        </Button>
      </footer>
    </div>
  );
}
