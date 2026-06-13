import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getMensagemById, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Share2, ArrowLeft } from "lucide-react";
import * as htmlToImage from 'html-to-image';

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
  const { mensagem } = Route.useLoaderData();
  const navigate = useNavigate();
  const shareRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleRefresh = () => {
    navigate({ to: "/home" });
  };

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);

    try {
      const element = shareRef.current;
      
      // html-to-image é geralmente mais robusto que dom-to-image
      // Ele lida melhor com fontes e imagens externas
      const dataUrl = await htmlToImage.toPng(element, {
        width: 1080,
        height: 1920,
        pixelRatio: 1, // Fixar ratio para consistência
        skipFonts: false,
        fontEmbedCSS: '', // Forçar embed de fontes se necessário
        style: {
          visibility: 'visible',
          position: 'static',
          left: '0',
          top: '0',
          transform: 'none',
        }
      });

      if (!dataUrl || dataUrl === "data:,") {
        throw new Error("Imagem gerada está vazia");
      }

      if (navigator.share) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `chosen-${sentimento}.png`, { type: "image/png" });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Chosen",
              text: `"${mensagem.texto}" - ${mensagem.referencia}`,
            });
            return;
          }
        } catch (shareErr) {
          console.log("Erro no share nativo, tentando fallback de download:", shareErr);
        }
      }

      const link = document.createElement("a");
      link.download = `chosen-${sentimento}.png`;
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
    <div className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-white px-6 pb-6 pt-safe">
      {/* Elemento para geração da imagem de compartilhamento - otimizado */}
      <div 
        ref={shareRef}
        style={{ 
          position: 'fixed',
          left: '-5000px',
          top: '0',
          width: '1080px',
          height: '1920px',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: -1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {/* Logo no topo */}
        <div style={{ paddingTop: '100px', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/logo-chosen.png" 
            alt="Chosen" 
            style={{ width: '140px', height: '140px', objectFit: 'contain' }} 
          />
        </div>

        {/* Conteúdo central */}
        <div style={{ padding: '0 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px', width: '100%', flex: 1, justifyContent: 'center' }}>
          <p style={{ 
            fontSize: '72px', 
            fontWeight: '300', 
            lineHeight: '1.2', 
            color: '#000000', 
            margin: '0',
            fontFamily: 'sans-serif'
          }}>
            "{mensagem.texto}"
          </p>
          <p style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            letterSpacing: '0.2em', 
            color: '#000000', 
            textTransform: 'uppercase', 
            margin: '0',
            fontFamily: 'sans-serif'
          }}>
            {mensagem.referencia}
          </p>
          {mensagem.resumo && (
            <p style={{ 
              marginTop: '40px', 
              fontSize: mensagem.resumo.length > 600 ? '24px' : mensagem.resumo.length > 400 ? '28px' : mensagem.resumo.length > 250 ? '32px' : '34px', 
              fontWeight: '300', 
              color: '#4B5563', 
              padding: '0 40px',
              fontFamily: 'sans-serif',
              lineHeight: '1.5',
              maxWidth: '900px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: mensagem.resumo.length > 600 ? 14 : 12,
            }}>
              {mensagem.resumo}
            </p>
          )}
        </div>

        {/* Rodapé com link mais visível */}
        <div style={{ paddingBottom: '100px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '28px', fontWeight: '300', letterSpacing: '0.4em', color: '#9CA3AF', textTransform: 'uppercase', margin: 0 }}>
            Ressoa
          </p>
          <p style={{ fontSize: '24px', fontWeight: '500', color: '#6B7280', margin: 0, fontFamily: 'sans-serif' }}>
            ressoa.oonn.com.br
          </p>
        </div>
      </div>

      <header className="flex h-16 shrink-0 items-center justify-between relative">
        <Link 
          to="/home" 
          className="flex h-14 w-14 items-center justify-center rounded-full transition-colors hover:bg-gray-100 z-10"
        >
          <ArrowLeft className="h-8 w-8 text-gray-400" />
        </Link>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/logo-chosen.png" alt="Chosen" className="h-10 w-10 object-contain" />
        </div>
        <div className="w-14 h-14" /> {/* Spacer */}
      </header>

      <main className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-y-auto px-2 py-4 text-center">
        <div key={mensagem.id} className="w-full max-w-md animate-in fade-in duration-700 flex flex-col items-center">
          <p className="text-2xl font-light leading-snug text-black sm:text-3xl md:text-4xl tracking-tight">
            "{mensagem.texto}"
          </p>
          <p className="mt-6 text-[12px] font-bold tracking-[0.2em] uppercase text-black">
            {mensagem.referencia}
          </p>
          
          {mensagem.resumo && (
            <div className="mt-8 flex flex-col items-center">
              <p className={`text-sm font-light text-gray-500 max-w-[320px] leading-relaxed transition-all duration-300 ${isExpanded ? "" : "line-clamp-4"}`}>
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

      <footer className="flex flex-row items-center justify-center gap-3 pb-2 pt-2 shrink-0 w-full">
        <Button
          onClick={handleRefresh}
          className="h-12 w-12 rounded-full bg-transparent border-2 border-black text-black hover:bg-black/5 shadow-none transition-all active:scale-95 flex items-center justify-center"
          aria-label="Novo sentimento"
        >
          <ArrowLeft className="h-5 w-5 rotate-[-90deg]" />
        </Button>
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className="h-12 w-12 rounded-full border-none bg-[#f1f26c] text-black hover:opacity-90 shadow-none flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          aria-label={isSharing ? "Gerando..." : "Compartilhar"}
        >
          <Share2 className="h-5 w-5 shrink-0" />
        </Button>
      </footer>
    </div>
  );
}
