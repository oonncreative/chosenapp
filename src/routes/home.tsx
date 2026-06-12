import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shuffle } from "lucide-react";
import { CATEGORIAS, getRandomIdForCategoria, getRandomMensagemGlobal } from "@/lib/data";
import mascote1 from "@/assets/mascotes/mascote-1.png.asset.json";
import mascote2 from "@/assets/mascotes/mascote-2.png.asset.json";
import mascote3 from "@/assets/mascotes/mascote-3.png.asset.json";
import mascote4 from "@/assets/mascotes/mascote-4.png.asset.json";
import mascote5 from "@/assets/mascotes/mascote-5.png.asset.json";
import mascote6 from "@/assets/mascotes/mascote-6.png.asset.json";
import mascote7 from "@/assets/mascotes/mascote-7.png.asset.json";
import mascote8 from "@/assets/mascotes/mascote-8.png.asset.json";
import mascote9 from "@/assets/mascotes/mascote-9.png.asset.json";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const MASCOTES: Record<string, string> = {
  "Feliz": mascote1.url,
  "Ansioso": mascote4.url,
  "Triste": mascote6.url,
  "Sozinho": mascote3.url,
  "Agradecido": mascote7.url,
  "Nervoso": mascote9.url,
  "Preciso de esperança": mascote5.url,
  "Preciso de paz": mascote2.url,
  "Preciso de força": mascote8.url,
};

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      <header className="p-6 pt-12 flex flex-col gap-4 shrink-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-light tracking-[0.4em] text-black uppercase">RESSOA</h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const current = document.documentElement.classList.contains('grayscale');
                const next = !current;
                localStorage.setItem('isMono', next.toString());
                if (next) {
                  document.documentElement.classList.add('grayscale');
                } else {
                  document.documentElement.classList.remove('grayscale');
                }
              }}
              className="flex items-center p-3 transition-opacity active:opacity-50"
              title="Modo Minimalista"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
              </svg>
            </button>
            <button 
              onClick={() => {
                navigate({ to: "/oracoes" });
              }}
              className="flex items-center p-3 transition-opacity active:opacity-50"
              title="Orações Diárias"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={() => {
                navigate({ to: "/onboarding" });
              }}
              className="flex items-center p-3 -mr-3 transition-opacity active:opacity-50"
              title="Voltar ao início"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" className="text-black">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2">
          <h1 className="text-base font-light tracking-[0.4em] text-black uppercase">Qual seu sentimento?</h1>
        </div>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pb-6 pt-2">
        <div className="flex flex-col gap-3">
          {CATEGORIAS.map((sentimento, index) => {
            return (
              <Link
                key={sentimento}
                to="/mensagem/$sentimento"
                params={{ sentimento }}
                search={{
                  color: "#f1f26c",
                  id: getRandomIdForCategoria(sentimento)
                }}
                className="group relative flex items-center gap-4 min-h-[96px] px-5 py-4 transition-all active:scale-[0.98] rounded-[28px] bg-white border-2 border-black hover:-translate-y-0.5"
              >
                <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                  <img
                    src={MASCOTES[sentimento]}
                    alt={sentimento}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="flex-1 text-lg font-medium tracking-tight uppercase text-black">
                  {sentimento}
                </span>
                <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity text-black">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="py-4 text-center bg-white border-t border-gray-50 shrink-0">
        <a 
          href="https://oonn.com.br" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[9px] font-light tracking-[0.2em] text-gray-400 uppercase transition-colors hover:text-black"
        >
          OONN Creative — oonn.com.br
        </a>
      </footer>
    </div>
  );
}
