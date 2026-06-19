import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getMensagemById, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Share2, ArrowLeft } from "lucide-react";
import * as htmlToImage from 'html-to-image';

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
  const navigate = useNavigate();
  const shareRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleRefresh = () => {
    navigate({ to: "/home" });
  };

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);
    void triggerHaptic();

    // Timeout de segurança: garante que o botão nunca fique travado
    const safetyTimeout = setTimeout(() => {
      setIsSharing(false);
    }, 8000);

    try {
      const element = shareRef.current;

      const dataUrl = await htmlToImage.toPng(element, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        skipFonts: false,
        fontEmbedCSS: '',
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

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `chosen-${sentimento}.png`, { type: "image/png" });

      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Chosen",
            text: `"${mensagem.texto}" - ${mensagem.referencia}`,
          });
          clearTimeout(safetyTimeout);
          setIsSharing(false);
          return;
        }
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') {
          clearTimeout(safetyTimeout);
          setIsSharing(false);
          return;
        }
        console.log('navigator.share falhou, usando fallback de download:', shareErr);
      }

      const link = document.createElement("a");
      link.download = `chosen-${sentimento}.png`;
      link.href = dataUrl;
      link.click();

    } catch (err: any) {
      console.error("Erro ao gerar imagem:", err);
      alert("Não foi possível gerar a imagem para compartilhamento. Tente novamente.");
    } finally {
      clearTimeout(safetyTimeout);
      setIsSharing(false);
    }
  };

  const handleSave = async () => {
    if (!shareRef.current || isSaving) return;
    setIsSaving(true);
    void triggerHaptic();

    try {
      const element = shareRef.current;
      const dataUrl = await htmlToImage.toPng(element, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        skipFonts: false,
        fontEmbedCSS: '',
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

      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();

      if (isNative) {
        const { Media } = await import('@capacitor-community/media');
        await Media.savePhoto({ path: dataUrl });
        alert('Imagem salva na galeria!');
      } else {
        const link = document.createElement('a');
        link.download = `chosen-${sentimento}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err: any) {
      console.error('Erro ao salvar imagem:', err);
      alert('Não foi possível salvar a imagem. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-white"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 0px)",
      }}
    >
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
        {/* Texto CHOSEN no topo */}
        <div style={{ paddingTop: '140px', display: 'flex', justifyContent: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '0.4em', color: '#9CA3AF', textTransform: 'uppercase', margin: 0, fontFamily: 'sans-serif' }}>
            Chosen
          </p>
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

        {/* Rodapé: frase + URL */}
        <div style={{ paddingBottom: '100px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '20px', fontWeight: 300, color: '#9CA3AF', margin: 0, fontFamily: 'sans-serif', fontStyle: 'italic' }}>
            Essa foi escolhida especialmente para mim
          </p>
          <p style={{ fontSize: '24px', fontWeight: 500, color: '#6B7280', margin: 0, fontFamily: 'sans-serif' }}>
            chosen.oonn.com.br
          </p>
        </div>
      </div>

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
        <img src="/logo-chosen.png" alt="Chosen" className="h-9 w-9 object-contain justify-self-end" />
      </header>

      <main className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-y-auto px-4 sm:px-6 py-2 text-center w-full">
        <div key={mensagem.id} className="w-full max-w-md animate-in fade-in duration-700 flex flex-col items-center">
          <p className="text-xl font-light leading-snug text-black sm:text-3xl md:text-4xl tracking-tight break-words">
            "{mensagem.texto}"
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
          onClick={handleShare}
          disabled={isSharing}
          className="h-12 rounded-full border-none bg-[#f1f26c] text-black hover:opacity-90 shadow-none flex items-center gap-2 px-6 transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="text-sm font-semibold tracking-wide">Compartilhar</span>
          <Share2 className="h-5 w-5 shrink-0" />
        </Button>
      </footer>
    </div>
  );
}
