import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIAS, getRandomIdForCategoria } from "@/lib/data";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const colors = [
  "bg-[#F7C1E1] text-white", // Rosa (Jastin Philips style)
  "bg-[#2D8C3C] text-white", // Verde (Michael Jordan style)
  "bg-[#007AFF] text-white", // Azul (Bergsonist style)
  "bg-white text-black border-2 border-black", // Branco com borda (Cullen Omori style)
  "bg-[#FFCC00] text-black", // Amarelo
  "bg-[#FF3B30] text-white", // Vermelho
  "bg-[#5856D6] text-white", // Indigo
  "bg-[#AF52DE] text-white", // Roxo
  "bg-[#FF9500] text-white", // Laranja
];


function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      <header className="p-6 pt-12 flex flex-col gap-4 shrink-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-[0.4em] text-black uppercase">RESSOA</h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                navigate({ to: "/oracoes" });
              }}
              className="flex items-center p-3 transition-opacity active:opacity-50"
              title="Orações Diárias"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" className="text-black">
                <path d="M12 20c-1.5 0-3-1-3.5-2.5L7 12l2-5 3 2 3-2 2 5-1.5 5.5c-.5 1.5-2 2.5-3.5 2.5z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10l2 2 2-2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12v5" strokeLinecap="round" strokeLinejoin="round"/>
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
          <h1 className="text-base font-bold tracking-[0.4em] text-black uppercase">Qual seu sentimento?</h1>
        </div>
      </header>

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 pb-6">
        <div className="flex flex-col gap-2">
          {CATEGORIAS.map((sentimento, index) => {
            const colorClass = colors[index % colors.length];
            
            // Alternar inclinação para dar o efeito visual da imagem
            const rotation = index % 2 === 0 ? "rotate-[-1.5deg]" : "rotate-[1.5deg]";
            
            return (
              <Link
                key={sentimento}
                to="/mensagem/$sentimento"
                params={{ sentimento }}
                search={{ 
                  color: colorClass.split(' ')[0].replace('bg-[', '').replace(']', ''),
                  id: getRandomIdForCategoria(sentimento)
                }}
                className={`group relative flex items-center justify-between min-h-[90px] px-8 py-4 transition-all active:scale-[0.97] rounded-[24px] overflow-hidden ${colorClass} ${rotation} hover:rotate-0`}
              >
                <div className="flex flex-col">
                  <span className="text-3xl font-black leading-[0.85] tracking-tighter max-w-[220px] break-words uppercase italic">
                    {sentimento}
                  </span>
                </div>
                
                <div className="absolute right-6 bottom-4 opacity-20 group-hover:opacity-100 transition-opacity">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                     <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
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
