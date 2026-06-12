import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIAS, getRandomIdForCategoria } from "@/lib/data";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const colors = [
  "bg-[#FF3B30] text-white", // Vermelho
  "bg-[#A9A9A9] text-white", // Cinza
  "bg-[#4CD964] text-white", // Verde
  "bg-[#FFCC00] text-black", // Amarelo
  "bg-[#3A3000] text-white", // Marrom Escuro
  "bg-[#007AFF] text-white", // Azul
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
                const current = localStorage.getItem('isMono') === 'true';
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
                <path d="M7 20c0-1.5 1-3.5 2.5-4.5L12 14l2.5 1.5c1.5 1 2.5 3 2.5 4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 10c0-1.1.9-2 2-2s2 .9 2 2v4H10v-4z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2v6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6l2 2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 6l-2 2" strokeLinecap="round" strokeLinejoin="round"/>
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

      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pb-6 pt-2">
        <div className="flex flex-col -space-y-6">
          {CATEGORIAS.map((sentimento, index) => {
            const colorClass = colors[index % colors.length];
            
            return (
              <Link
                key={sentimento}
                to="/mensagem/$sentimento"
                params={{ sentimento }}
                search={{ 
                  color: colorClass.split(' ')[0].replace('bg-[', '').replace(']', ''),
                  id: getRandomIdForCategoria(sentimento)
                }}
                className={`group relative flex flex-col justify-start min-h-[120px] px-8 py-6 transition-all active:scale-[0.98] rounded-[32px] shadow-sm ${colorClass} hover:z-10 hover:-translate-y-1`}
                style={{ zIndex: index }}
              >
                <div className="flex flex-col gap-1">

                  <span className="text-xl font-bold tracking-tight uppercase">
                    {sentimento}
                  </span>
                </div>
                
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
