import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getMensagemById, type Categoria, type Mensagem, getProximaMensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useMemo } from "react";
import { Share2, ArrowLeft, RefreshCw, Palette, Image as ImageIcon } from "lucide-react";
import domtoimage from "dom-to-image-more";
import { motion, AnimatePresence } from "framer-motion";

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

const SHARE_MODES = [
  { id: 'minimal', label: 'Minimalista', bg: '#ffffff', text: '#000000' },
  { id: 'dark', label: 'Noturno', bg: '#18181b', text: '#ffffff' },
  { id: 'gradient', label: 'Gradiente', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' },
  { id: 'nature', label: 'Natureza', bg: '#f0fdf4', text: '#166534' },
];

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const { color } = Route.useSearch();
  const { mensagem: initialMensagem } = Route.useLoaderData();
  const [mensagem, setMensagem] = useState(initialMensagem);
  const navigate = useNavigate();
  const shareRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [shareMode, setShareMode] = useState(SHARE_MODES[0]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    fetch("/logo-ressoa.png")
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(err => console.error("Erro ao carregar logo:", err));
  }, []);

  const handleRefresh = () => {
    const proxima = getProximaMensagem(sentimento as Categoria);
    setMensagem(proxima);
  };

  const handleShare = async () => {
    if (!shareRef.current || isSharing) return;
    setIsSharing(true);

    try {
      const element = shareRef.current;
      const originalLeft = element.style.left;
      element.style.left = '0';
      element.style.opacity = '1';

      const dataUrl = await domtoimage.toPng(element, {
        width: 1080,
        height: 1920,
        style: { transform: 'none', left: '0', top: '0', opacity: '1' }
      });

      element.style.left = originalLeft;
      element.style.opacity = '0';

      if (!dataUrl || dataUrl === "data:,") throw new Error("Imagem vazia");

      if (navigator.share) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "ressoa.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Ressoa" });
          return;
        }
      }

      const link = document.createElement("a");
      link.download = `ressoa-${sentimento}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar imagem.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-background px-6 pb-8 pt-safe transition-colors duration-500 overflow-hidden">
      {/* Background Dinâmico Sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <div 
          className="absolute inset-0 transition-colors duration-1000"
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${color}22 0%, transparent 70%)` 
          }} 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[100px]"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Share Capture Element */}
      <div 
        ref={shareRef}
        style={{ 
          position: 'fixed', left: '-9999px', top: '0', width: '1080px', height: '1920px',
          background: shareMode.bg, color: shareMode.text,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', zIndex: -100, opacity: 0, pointerEvents: 'none',
        }}
      >
        <div style={{ padding: '0 100px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '60px' }}>
          {logoBase64 && <img src={logoBase64} alt="Ressoa" style={{ width: '140px', filter: shareMode.id === 'dark' || shareMode.id === 'gradient' ? 'brightness(0) invert(1)' : 'none' }} />}
          <p style={{ fontSize: '72px', fontFamily: '"Playfair Display", serif', fontWeight: '700', lineHeight: '1.2', margin: 0 }}>
            "{mensagem.texto}"
          </p>
          <p style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase', margin: 0 }}>
            {mensagem.referencia}
          </p>
          {mensagem.resumo && (
            <p style={{ fontSize: '36px', fontWeight: '300', opacity: 0.8, lineHeight: '1.5', maxWidth: '850px' }}>
              {mensagem.resumo}
            </p>
          )}
        </div>
        <div style={{ paddingBottom: '120px', fontSize: '28px', fontWeight: '700', letterSpacing: '0.5em', opacity: 0.5 }}>RESSOA</div>
      </div>

      <header className="flex h-20 items-center justify-between z-10">
        <Link to="/home" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-6 w-6 text-foreground/50" />
        </Link>
        <img src="/logo-ressoa.png" alt="Ressoa" className="h-8 w-8 object-contain dark:invert" />
        <div className="w-10" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={mensagem.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-lg space-y-8"
          >
            <p className="text-4xl md:text-5xl font-serif font-bold leading-[1.15] text-foreground tracking-tight px-4 italic">
              "{mensagem.texto}"
            </p>
            <div className="space-y-6">
              <p className="text-[13px] font-black tracking-[0.3em] uppercase text-foreground/40">
                {mensagem.referencia}
              </p>
              {mensagem.resumo && (
                <p className="text-base font-light text-muted-foreground max-w-[320px] mx-auto leading-relaxed border-t border-muted/20 pt-6">
                  {mensagem.resumo}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="space-y-6 pt-6 z-10">
        {/* Share Mode Selector */}
        <div className="flex justify-center gap-3">
          {SHARE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setShareMode(mode)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${shareMode.id === mode.id ? 'border-primary scale-110' : 'border-transparent opacity-50'}`}
              style={{ background: mode.bg }}
              title={mode.label}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="h-[60px] flex-1 rounded-3xl border-2 border-foreground text-foreground text-sm font-black tracking-tighter uppercase italic hover:bg-muted"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Nova Mensagem
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing}
            style={{ backgroundColor: color }}
            className="h-[60px] flex-1 rounded-3xl text-white text-sm font-black tracking-tighter uppercase italic hover:opacity-90 shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <Share2 className="mr-2 h-5 w-5" />
            {isSharing ? "Gerando..." : "Compartilhar"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

