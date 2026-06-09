import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { getVersiculoAleatorio, type Categoria } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Share2, RefreshCw, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/mensagem/$sentimento")({
  component: MensagemPage,
});

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const navigate = useNavigate();
  const [versiculo, setVersiculo] = useState(() => getVersiculoAleatorio(sentimento as Categoria));

  const handleRefresh = () => {
    setVersiculo(getVersiculoAleatorio(sentimento as Categoria));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Ressoa",
        text: `"${versiculo.texto}" - ${versiculo.referencia}`,
        url: window.location.href,
      });
    } else {
      alert("Copiado para a área de transferência!");
      navigator.clipboard.writeText(`"${versiculo.texto}" - ${versiculo.referencia}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background p-8">
      <Link 
        to="/home" 
        className="mb-12 flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
          <p className="text-2xl font-light italic leading-relaxed text-foreground md:text-3xl">
            "{versiculo.texto}"
          </p>
          <p className="mt-6 text-sm font-medium tracking-widest uppercase text-muted-foreground">
            {versiculo.referencia}
          </p>
          <p className="mt-12 text-base font-light leading-relaxed text-muted-foreground/80">
            {versiculo.reflexao}
          </p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-4 pt-12">
        <Button
          variant="outline"
          onClick={handleShare}
          className="h-14 rounded-2xl border-muted/50 font-light hover:bg-primary/5"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
        <Button
          onClick={handleRefresh}
          className="h-14 rounded-2xl bg-primary font-light text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Nova mensagem
        </Button>
      </div>
    </div>
  );
}
