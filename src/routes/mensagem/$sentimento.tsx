import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getMensagemById, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Share2, ArrowLeft } from "lucide-react";
import domtoimage from "dom-to-image-more";

export const Route = createFileRoute("/mensagem/$sentimento")({
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
  const { color } = Route.useSearch();
  const { mensagem } = Route.useLoaderData();
  const navigate = useNavigate();
  const shareRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");

  useEffect(() => {
    // Converter logo para base64 para garantir que seja incluída na imagem
    fetch("/logo-ressoa.png")
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

  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);

    try {
      const element = shareRef.current;
      
      // Ajustes temporários para captura
      const originalLeft = element.style.left;
      const originalOpacity = element.style.opacity;
      element.style.left = '0';
      element.style.opacity = '1';

      // dom-to-image é mais leve e costuma funcionar melhor em Safari/iOS
      const dataUrl = await domtoimage.toPng(element, {
        width: 600,
        height: 800,
        style: {
          transform: 'none',
          left: '0',
          top: '0',
          opacity: '1'
        }
      });

      // Restaurar estado
      element.style.left = originalLeft;
      element.style.opacity = originalOpacity;

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
      alert("Não foi possível gerar a imagem para compartilhamento. Tente novamente.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-white px-8 pb-8 pt-safe">
      {/* Elemento para geração da imagem de compartilhamento - otimizado */}
      <div 
        ref={shareRef}
        style={{ 
          position: 'fixed',
          left: '-9999px', // Mais longe para evitar interferência visual
          top: '0',
          width: '600px', // Tamanho mais razoável para mobile sharing
          height: '800px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: -100,
          opacity: 1, // Visível para o renderizador
          pointerEvents: 'none',
        }}
      >
        <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
          {logoBase64 && <img src={logoBase64} alt="Ressoa" style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '20px' }} />}
          
          <p style={{ 
            fontSize: '32px', 
            fontWeight: '300', 
            lineHeight: '1.4', 
            color: '#000000', 
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            "{mensagem.texto}"
          </p>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '700', 
            letterSpacing: '0.2em', 
            color: '#000000', 
            textTransform: 'uppercase', 
            margin: '0',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {mensagem.referencia}
          </p>
          {mensagem.resumo && (
            <p style={{ 
              marginTop: '20px', 
              fontSize: '16px', 
              fontWeight: '300', 
              color: '#666666', 
              padding: '0 20px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              lineHeight: '1.5'
            }}>
              {mensagem.resumo}
            </p>
          )}
        </div>

        <div style={{ marginTop: 'auto', marginBottom: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontWeight: '300', letterSpacing: '0.3em', color: '#cccccc', textTransform: 'uppercase' }}>
            Ressoa
          </p>
        </div>
      </div>

      <header className="flex h-20 items-center justify-between relative">
        <Link 
          to="/home" 
          className="flex h-14 w-14 items-center justify-center rounded-full transition-colors hover:bg-gray-100 z-10"
        >
          <ArrowLeft className="h-8 w-8 text-gray-400" />
        </Link>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/logo-ressoa.png" alt="Ressoa" className="h-10 w-10 object-contain" />
        </div>
        <div className="w-14 h-14" /> {/* Spacer */}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
        <div key={mensagem.id} className="w-full max-w-md animate-in fade-in duration-700 flex flex-col items-center">
          <p className="text-3xl font-light leading-snug text-black md:text-4xl tracking-tight">
            "{mensagem.texto}"
          </p>
          <p className="mt-6 text-[12px] font-bold tracking-[0.2em] uppercase text-black">
            {mensagem.referencia}
          </p>
          
          {mensagem.resumo && (
            <p className="mt-8 text-sm font-light text-gray-500 max-w-[320px] leading-relaxed">
              {mensagem.resumo}
            </p>
          )}
        </div>
      </main>

      <footer className="flex flex-col sm:flex-row gap-3 pt-6 shrink-0 w-full mt-auto mb-safe">
        <Button
          onClick={handleRefresh}
          className="h-[56px] w-full sm:flex-1 rounded-[24px] bg-transparent border-2 border-black text-black text-sm font-black tracking-tighter hover:bg-black/5 shadow-none uppercase italic transition-all active:scale-95"
        >
          Novo sentimento
        </Button>
        <Button
          onClick={handleShare}
          disabled={isSharing}
          style={{ backgroundColor: color.startsWith('#') ? color : undefined }}
          className={`h-[56px] w-full sm:flex-1 rounded-[24px] border-none ${color === 'bg-white' ? 'bg-white text-black border-2 border-black' : (color.startsWith('bg-') ? `${color} text-white` : 'text-white')} text-sm font-black tracking-tighter hover:opacity-90 shadow-none flex items-center justify-center gap-2 uppercase italic transition-all active:scale-95 disabled:opacity-50`}
        >
          <Share2 className="h-5 w-5 shrink-0" />
          <span>{isSharing ? "Gerando..." : "Compartilhar"}</span>
        </Button>
      </footer>
    </div>
  );
}
